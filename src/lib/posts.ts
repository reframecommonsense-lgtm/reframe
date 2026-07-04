import { createClient } from "@/lib/supabase/server";
import type { Post, PostAuthor, PostRow } from "@/lib/types";

const PAGE_SIZE = 20;
const POST_SELECT =
  "*, profiles!posts_author_id_fkey(display_name, is_official, handle)";

export type FeedTab = "hot" | "new" | "top";

interface GetFeedPostsParams {
  tab: FeedTab;
  category?: string;
  page: number;
}

export async function getFeedPosts({
  tab,
  category,
  page,
}: GetFeedPostsParams): Promise<{ posts: Post[]; hasMore: boolean }> {
  const supabase = await createClient();
  const from = (page - 1) * PAGE_SIZE;

  if (tab === "hot") {
    const { data, error } = await supabase.rpc("hot_posts", {
      p_category: category ?? null,
      p_limit: PAGE_SIZE + 1,
      p_offset: from,
    });
    if (error) throw error;
    const posts = await attachProfiles(supabase, (data ?? []) as PostRow[]);
    return paginate(posts);
  }

  let query = supabase
    .from("posts")
    .select(POST_SELECT)
    .eq("status", "published")
    .range(from, from + PAGE_SIZE);

  if (category) {
    query = query.eq("category", category);
  }

  query =
    tab === "top"
      ? query.order("reaction_count", { ascending: false })
      : query.order("created_at", { ascending: false });

  const { data, error } = await query;
  if (error) throw error;
  return paginate((data ?? []) as unknown as Post[]);
}

export async function getPostById(id: string): Promise<Post | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select(POST_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return data as unknown as Post;
}

function paginate(posts: Post[]): { posts: Post[]; hasMore: boolean } {
  return { posts: posts.slice(0, PAGE_SIZE), hasMore: posts.length > PAGE_SIZE };
}

async function attachProfiles(
  supabase: Awaited<ReturnType<typeof createClient>>,
  rows: PostRow[],
): Promise<Post[]> {
  if (rows.length === 0) return [];

  const authorIds = [...new Set(rows.map((row) => row.author_id))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name, is_official, handle")
    .in("id", authorIds);

  const profileMap = new Map<string, PostAuthor>(
    (profiles ?? []).map((profile) => [
      profile.id as string,
      {
        display_name: profile.display_name as string,
        is_official: profile.is_official as boolean,
        handle: profile.handle as string | null,
      },
    ]),
  );

  return rows.map((row) => ({
    ...row,
    profiles: profileMap.get(row.author_id) ?? null,
  }));
}
