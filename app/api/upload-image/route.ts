import { getSupabaseStorageClient } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-");
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = await getSupabaseStorageClient();
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!(file instanceof File))
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 },
      );
    }

    const key = `image/${userId}/${Date.now()}-${sanitizeFileName(file.name)}`;
    const { data, error } = await supabase.storage
      .from("ai-go-go")
      .upload(key, file);

    if (error)
      return NextResponse.json(
        { error: "Failed to upload image" },
        { status: 500 },
      );

    const { data: publicUrlData } = await supabase.storage
      .from("ai-go-go")
      .getPublicUrl(key);

    return NextResponse.json({
      image: {
        key: data?.id,
        url: publicUrlData?.publicUrl,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 },
    );
  }
}
