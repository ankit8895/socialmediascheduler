import { POST_STATUS } from "@/constants/post";
import { getSupabaseServerClient } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { content, images, scheduled_at, status } = await req.json();

    const updateData: any = {};
    if (content) updateData.content = content;
    if (Array.isArray(images)) updateData.images = images;
    if (scheduled_at) updateData.scheduled_at = scheduled_at;
    if (status && status === POST_STATUS.DRAFT) updateData.status = status;

    const supabase = await getSupabaseServerClient();
    const { data, error } = await supabase
      .from("scheduled_posts")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error)
      return NextResponse.json(
        { error: "Failed to update post" },
        { status: 500 },
      );

    return NextResponse.json({ post: data });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
