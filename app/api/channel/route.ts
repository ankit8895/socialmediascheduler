import { getSupabaseServerClient } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // 1. Authenticate the user via Clerk
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const supabase = await getSupabaseServerClient();

    // 2. Fetch channel types AND the user's connected channels in ONE query!
    const { data: channelTypes, error } = await supabase
      .from("channel_types")
      .select(
        `
        *,
        user_channels (*)
        `,
      )
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json(
        { message: "Database error", error: error },
        { status: 500 },
      );
    }

    // 3. Format the data to match what the frontend UI expects
    const formattedChannels = channelTypes.map((type) => {
      // user_channels will be an array of 0 or 1 item because of our unique constraint
      const userChannel = type.user_channels[0];

      return {
        id: type.id,
        type: type.type,
        name: type.name,
        color: type.color,
        characterLimit: type.character_limit,

        // If the user has connected this channel, grab their specific data
        userChannelId: userChannel?.id || null,
        handle: userChannel?.handle || null,
        profileImageUrl: userChannel?.profile_image || null,
        connected: !!userChannel?.is_connected,
      };
    });

    // 4. Calculate counts for the sidebar UI
    const totalChannels = formattedChannels.length;
    const connectedCount = formattedChannels.filter((c) => c.connected).length;

    return NextResponse.json({
      channels: formattedChannels,
      totalChannels,
      connectedCount,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error", error: error },
      { status: 500 },
    );
  }
}
