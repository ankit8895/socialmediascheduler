import { ChannelTypeEnum } from "@/constants/channels";
import { getOAuthProvider } from "@/lib/social-oauth";
import { createPkcePair, getPkceCookieName } from "@/lib/social-oauth/pkce";
import { createOAuthState } from "@/lib/social-oauth/state";
import { getSupabaseServerClient } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate the user via Clerk
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    // 2. Get the requested channel type ID from the frontend
    const body = await req.json();
    const { channelTypeId } = body;

    if (!channelTypeId)
      return new NextResponse("Channel Type ID is required", { status: 400 });

    // 3. Initialize Supabase
    const supabase = await getSupabaseServerClient();

    // 4. Verify the channel type exists in Supabase
    const { data: channelType, error } = await supabase
      .from("channel_types")
      .select("id, type")
      .eq("id", channelTypeId)
      .single(); // .single() ensures we only get one object back, not an array

    if (error || !channelType) {
      return new NextResponse("Invalid channel type", { status: 400 });
    }

    const redirectTo = `${APP_URL}/settings`;

    // Initialize the provider toolkit (e.g., Twitter or LinkedIn)
    const provider = getOAuthProvider(channelType.type as ChannelTypeEnum);

    // Create the secure state to prevent CSRF attacks
    const state = createOAuthState({
      userId,
      channelTypeId: channelType.id,
      channelType: channelType.type,
      redirectTo,
    });

    const callbackUrl = `${APP_URL}/api/channel/callback`;

    const pkce =
      channelType.type === ChannelTypeEnum.TWITTER ? createPkcePair() : null;

    const url = provider.getAuthorizationUrl({
      state,
      redirectUri: callbackUrl,
      codeChallenge: pkce?.codeChallenge,
      codeChallengeMethod: pkce?.codeChallengeMethod,
    });

    const response = NextResponse.json({ url });

    if (pkce) {
      response.cookies.set(getPkceCookieName(state), pkce.codeVerifier, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 10, // 10 minutes
      });
    }

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to connect channel" },
      { status: 500 },
    );
  }
}
