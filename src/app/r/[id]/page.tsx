import { notFound } from "next/navigation";
import { OfficialBadge } from "@/components/post-card/OfficialBadge";
import { CATEGORIES, ANONYMOUS_DISPLAY_NAME } from "@/lib/constants";
import { formatRelativeTime } from "@/lib/format";
import { getPostById } from "@/lib/posts";

function categoryLabel(value: string): string {
  return CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

interface PostDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { id } = await params;
  const post = await getPostById(id);

  if (!post) notFound();

  const authorName = post.profiles?.display_name ?? ANONYMOUS_DISPLAY_NAME;

  return (
    <article className="mx-auto max-w-2xl px-4 py-10">
      {post.type === "reframe" ? (
        <div className="flex flex-col gap-4">
          <p className="font-mincho text-2xl text-(--color-ink-faded) line-through decoration-(--color-vermilion) decoration-2">
            {post.before_text}
          </p>
          <p className="font-gothic text-3xl font-bold text-(--color-ink)">
            {post.after_text}
          </p>
        </div>
      ) : (
        <h1 className="font-gothic text-3xl font-bold text-(--color-ink)">
          {post.title}
        </h1>
      )}

      {post.body && (
        <p className="mt-6 whitespace-pre-line text-(length:--text-base) text-(--color-ink)">
          {post.body}
        </p>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-(--color-line) pt-4 text-sm text-(--color-ink-faded)">
        <span className="rounded-full border border-(--color-line) px-2 py-0.5 text-xs">
          {categoryLabel(post.category)}
        </span>
        <span className="inline-flex items-center gap-1">
          {post.profiles?.is_official && <OfficialBadge />}
          {authorName}
        </span>
        <span>{formatRelativeTime(post.created_at)}</span>
      </div>
    </article>
  );
}
