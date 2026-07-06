import { getSupabaseServerClient } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const searchParams = req.nextUrl.searchParams;
    const channelIds = searchParams
      .getAll("channelIds")
      .flatMap((channel) => channel.split(","))
      .filter(Boolean);

    const supabase = await getSupabaseServerClient();

    const query = supabase
      .from("scheduled_posts")
      .select("id,status")
      .eq("user_id", userId);

    if (channelIds.length > 0) {
      query.in("user_channel_id", channelIds);
    }

    const { data, error } = await query;
    if (error) throw error;

    const totalDraft = data.filter((post) => post.status === "draft").length;
    const totalQueue = data.filter((post) => post.status === "queue").length;
    const totalPublished = data.filter(
      (post) => post.status === "published",
    ).length;
    const totalFailed = data.filter((post) => post.status === "failed").length;

    return NextResponse.json({
      totalDraft,
      totalQueue,
      totalPublished,
      totalFailed,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
