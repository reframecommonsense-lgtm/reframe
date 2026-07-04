import { notFound } from "next/navigation";
import { PostCard } from "@/components/post-card/PostCard";
import { OfficialBadge } from "@/components/post-card/OfficialBadge";
import { getProfileByHandle } from "@/lib/profiles";
import { getPostsByAuthorId } from "@/lib/posts";
import { getUserReactedPostIds } from "@/lib/reactions";

interface UserPageProps {
  params: Promise<{ handle: string }>;
}

export default async function UserPage({ params }: UserPageProps) {
  const { handle } = await params;
  const profile = await getProfileByHandle(handle);

  if (!profile) notFound();

  const posts = await getPostsByAuthorId(profile.id);
  const reactedIds = await getUserReactedPostIds(posts.map((p) => p.id));

  return (
    <div className="mx-auto max-w-2xl">
      <div className="border-b border-(--color-line) px-4 py-6">
        <h1 className="inline-flex items-center gap-2 font-gothic text-xl font-bold text-(--color-ink)">
          {profile.is_official && <OfficialBadge />}@{profile.handle}
        </h1>
        <p className="text-sm text-(--color-ink-faded)">
          {profile.display_name}
        </p>
      </div>

      {posts.length === 0 ? (
        <p className="px-4 py-16 text-center text-(--color-ink-faded)">
          まだ投稿がありません。
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
    </div>
  );
}
