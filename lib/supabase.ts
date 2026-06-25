import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

export async function getSupabaseServerClient() {
  const { getToken } = await auth();
  const clerkToken = await getToken();

  const supabaseUrl = process.env.SUPABASE_BASE_URL!;
  const supabaseKey = process.env.SUPABASE_ANON_KEY!;

  const supabase = createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        Authorization: `Bearer ${clerkToken}`,
      },
    },
  });

  return supabase;
}

export function getSupabaseStorageClient() {
  const supabaseUrl = process.env.SUPABASE_BASE_URL!;
  const supabaseServiceRoleKey = process.env.SUPABASE_SECRET_KEY!;

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  return supabase;
}
