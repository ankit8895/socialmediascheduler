import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

export async function getSupabaseServerClient() {
  const { getToken } = await auth();
  const clerkToken = await getToken();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_BASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

  const supabase = createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        Authorization: `Bearer ${clerkToken}`,
      },
    },
  });

  return supabase;
}
