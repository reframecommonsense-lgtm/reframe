import { createClient } from "@/lib/supabase/server";
import { ANONYMOUS_DISPLAY_NAME } from "@/lib/constants";
import type { Comment } from "@/lib/types";

interface CommentProfile {
  display_name: string;
  is_official: boolean;
}

export async function getCommentsByPostId(postId: string): Promise<Comment[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("comments")
    .select(
      "id, body, created_at, profiles!comments_author_id_fkey(display_name, is_official)",
    )
    .eq("post_id", postId)
    .eq("status", "published")
    .order("created_at", { ascending: true });

  if (error || !data) return [];

  return data.map((row) => {
    const profile = (
      Array.isArray(row.profiles) ? row.profiles[0] : row.profiles
    ) as CommentProfile | null;

    return {
      id: row.id,
      body: row.body,
      created_at: row.created_at,
      author_display_name: profile?.display_name ?? ANONYMOUS_DISPLAY_NAME,
      author_is_official: profile?.is_official ?? false,
    };
  });
}
