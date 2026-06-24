import { getSupabaseServerClient } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    if (!id)
      return NextResponse.json({ error: "Missing idea ID" }, { status: 400 });

    const supabase = await getSupabaseServerClient();
    const { error } = await supabase
      .from("ideas")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error)
      return NextResponse.json(
        { error: "Failed to delete idea" },
        { status: 500 },
      );

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete idea" },
      { status: 500 },
    );
  }
}
