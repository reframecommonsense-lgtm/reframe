import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { OfficialBadge } from "./OfficialBadge";
import { ReactionButton } from "./ReactionButton";
import { CATEGORIES, ANONYMOUS_DISPLAY_NAME } from "@/lib/constants";
import { formatRelativeTime } from "@/lib/format";
import type { Post } from "@/lib/types";

function categoryLabel(value: string): string {
  return CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

interface PostCardProps {
  post: Post;
  reacted: boolean;
}

export function PostCard({ post, reacted }: PostCardProps) {
  const authorName = post.profiles?.display_name ?? ANONYMOUS_DISPLAY_NAME;

  return (
    <article className="border-b border-(--color-line) px-4 py-6">
      <Link href={`/r/${post.id}`} className="block">
        {post.type === "reframe" ? (
          <div className="flex flex-col gap-2">
            <p className="font-mincho text-(length:--text-card-before) text-(--color-ink-faded)">
              {post.before_text}
            </p>
            <p className="font-gothic text-(length:--text-card-after) font-bold text-(--color-ink)">
              {post.after_text}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <h2 className="font-gothic text-(length:--text-card-after) font-bold text-(--color-ink)">
              {post.title}
            </h2>
            <p className="line-clamp-3 whitespace-pre-line text-(length:--text-base) text-(--color-ink-faded)">
              {post.body}
            </p>
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-(--color-ink-faded)">
          <span className="rounded-full border border-(--color-line) px-2 py-0.5">
            {categoryLabel(post.category)}
          </span>
          <span className="inline-flex items-center gap-1">
            {post.profiles?.is_official && <OfficialBadge />}
            {authorName}
          </span>
          <span>{formatRelativeTime(post.created_at)}</span>
        </div>
      </Link>

      <div className="mt-3 flex items-center gap-4">
        <ReactionButton
          postId={post.id}
          initialCount={post.reaction_count}
          initialReacted={reacted}
        />
        <Link
          href={`/r/${post.id}#comments`}
          className="inline-flex items-center gap-1 text-xs text-(--color-ink-faded)"
        >
          <MessageCircle className="h-4 w-4" />
          {post.comment_count}
        </Link>
      </div>
    </article>
  );
}
