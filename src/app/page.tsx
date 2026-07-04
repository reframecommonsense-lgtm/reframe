import { FeedTabs } from "@/components/feed/FeedTabs";
import { CategoryFilter } from "@/components/feed/CategoryFilter";
import { LoadMore } from "@/components/feed/LoadMore";
import { PostCard } from "@/components/post-card/PostCard";
import { Hero } from "@/components/hero/Hero";
import { getFeedPosts, type FeedTab } from "@/lib/posts";
import { getUserReactedPostIds } from "@/lib/reactions";

export const revalidate = 60;

interface HomePageProps {
  searchParams: Promise<{ tab?: string; cat?: string; page?: string }>;
}

function parseTab(value: string | undefined): FeedTab {
  if (value === "new" || value === "top") return value;
  return "hot";
}

export default async function Home({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const tab = parseTab(params.tab);
  const category = params.cat;
  const page = Math.max(1, Number(params.page) || 1);

  const { posts, hasMore } = await getFeedPosts({ tab, category, page });
  const reactedIds = await getUserReactedPostIds(posts.map((p) => p.id));
  const heroPost =
    tab === "hot" && page === 1 && !category
      ? (posts.find((p) => p.type === "reframe") ?? null)
      : null;

  return (
    <div className="mx-auto max-w-2xl">
      {heroPost && <Hero post={heroPost} />}
      <FeedTabs active={tab} category={category} />
      <CategoryFilter active={category} tab={tab} />

      {posts.length === 0 ? (
        <p className="px-4 py-16 text-center text-(--color-ink-faded)">
          まだ投稿がありません。最初のリフレームを投稿してみませんか。
        </p>
      ) : (
        <div>
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              reacted={reactedIds.has(post.id)}
            />
          ))}
        </div>
      )}

      {hasMore && (
        <LoadMore tab={tab} category={category} nextPage={page + 1} />
      )}
    </div>
  );
}
