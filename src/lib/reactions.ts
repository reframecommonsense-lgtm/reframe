import { createClient } from "@/lib/supabase/server";

export async function getUserReactedPostIds(
  postIds: string[],
): Promise<Set<string>> {
  if (postIds.length === 0) return new Set();

  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return new Set();

  const { data } = await supabase
    .from("reactions")
    .select("post_id")
    .eq("user_id", session.user.id)
    .in("post_id", postIds);

  return new Set((data ?? []).map((row) => row.post_id as string));
}
