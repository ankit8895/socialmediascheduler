import { POST_STATUS } from "@/constants/post";
import { getSupabaseServerClient } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get("status");
    const channelIds = searchParams
      .getAll("channels")
      .flatMap((channel) => channel.split(","))
      .filter(Boolean);
    const groupByDate = searchParams.get("group_by_date") === "true";

    const supabase = await getSupabaseServerClient();

    const postQuery = supabase
      .from("scheduled_posts")
      .select(
        "*,user_channels(id, handle, profile_image, channel_type_id, channel_types(id,type,name,color,character_limit))",
      )
      .eq("user_id", userId)
      .order("scheduled_at", { ascending: false });

    if (status) postQuery.eq("status", status);
    if (channelIds.length > 0) postQuery.in("user_channel_id", channelIds);

    const { data: posts, error } = await postQuery;
    if (error) throw error;

    if (!groupByDate) return NextResponse.json({ posts: posts ?? [] });

    // {date: {label: "",posts: []}}
    const groupMap = new Map<string, { label: string; posts: typeof posts }>();

    (posts ?? []).forEach((post) => {
      const key = post.scheduled_at.slice(0, 10);
      if (!groupMap.has(key))
        groupMap.set(key, { label: formatDayLabel(key), posts: [] });

      groupMap.get(key)!.posts.push(post);
    });

    const groupPosts = Array.from(groupMap.entries()).map(([key, value]) => ({
      key,
      value,
    }));

    return NextResponse.json({ groupPosts });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { posts, scheduledAt, status } = await req.json();

    if (status !== undefined && status !== POST_STATUS.DRAFT)
      return NextResponse.json(
        { error: "Only draft status is allowed" },
        { status: 400 },
      );

    if (!Array.isArray(posts) || posts.length === 0)
      return NextResponse.json(
        { error: "Posts array is required and cannot be empty" },
        { status: 400 },
      );

    const normalizedPosts = posts
      .filter((post) => !!post)
      .map((post) => ({
        channelTypeId: post.channelTypeId,
        content: post.content,
        images: post.images || [],
      }));

    if (normalizedPosts.length === 0)
      return NextResponse.json(
        { error: "No valid posts provided" },
        { status: 400 },
      );

    const invalidPost = normalizedPosts.find((post) => !post.content);
    if (invalidPost)
      return NextResponse.json(
        { error: "Post content is required" },
        { status: 400 },
      );

    const channelTypeIds = [
      ...new Set(normalizedPosts.map((post) => post.channelTypeId)),
    ];

    const supabase = await getSupabaseServerClient();
    const { data: userChannels, error: userChannelsError } = await supabase
      .from("user_channels")
      .select("id,channel_type_id")
      .eq("user_id", userId)
      .eq("is_active", true)
      .eq("is_connected", true)
      .in("channel_type_id", channelTypeIds);

    if (userChannelsError)
      return NextResponse.json(
        { error: "Failed to fetch user channels" },
        { status: 500 },
      );

    if (!userChannels || userChannels.length === 0)
      return NextResponse.json(
        { error: "No active channels found" },
        { status: 404 },
      );

    const connectedChannels = new Map(
      userChannels.map((user_channel) => [
        user_channel.channel_type_id,
        user_channel.id,
      ]),
    );

    const missingChannel = channelTypeIds.find(
      (channelTypeId) => !connectedChannels.has(channelTypeId),
    );

    if (missingChannel)
      return NextResponse.json(
        { error: "No active channel found for channel type" },
        { status: 404 },
      );

    if (!scheduledAt)
      return NextResponse.json(
        { error: "Scheduled at is required" },
        { status: 400 },
      );

    const scheduledDate = new Date(scheduledAt);
    if (scheduledDate < new Date())
      return NextResponse.json(
        { error: "Scheduled time must be in the future" },
        { status: 400 },
      );

    const postStatus =
      status === POST_STATUS.DRAFT ? POST_STATUS.DRAFT : POST_STATUS.QUEUE;

    const payload = normalizedPosts.map((post) => ({
      user_id: userId,
      user_channel_id: connectedChannels.get(post.channelTypeId),
      content: post.content,
      images: post.images,
      scheduled_at: scheduledAt,
      status: postStatus,
    }));

    const { data, error } = await supabase
      .from("scheduled_posts")
      .insert(payload)
      .select();

    if (error)
      return NextResponse.json(
        { error: "Failed to create posts" },
        { status: 500 },
      );

    return NextResponse.json({ posts: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

function formatDayLabel(utcDateKey: string): string {
  const todayKey = new Date().toISOString().slice(0, 10);

  const tomorrowDate = new Date();
  tomorrowDate.setUTCDate(tomorrowDate.getUTCDate() + 1);
  const tomorrowKey = tomorrowDate.toISOString().slice(0, 10);

  if (utcDateKey === todayKey) return "Today";
  if (utcDateKey === tomorrowKey) return "Tomorrow";

  // Display in a readable format, explicitly UTC
  const [year, month, day] = utcDateKey.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("en-US", {
    timeZone: "UTC",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
