import Link from "next/link";
import { Heart, MessageCircle } from "lucide-react";
import { OfficialBadge } from "./OfficialBadge";
import { CATEGORIES, ANONYMOUS_DISPLAY_NAME } from "@/lib/constants";
import { formatRelativeTime } from "@/lib/format";
import type { Post } from "@/lib/types";

function categoryLabel(value: string): string {
  return CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

export function PostCard({ post }: { post: Post }) {
  const authorName = post.profiles?.display_name ?? ANONYMOUS_DISPLAY_NAME;

  return (
    <Link
      href={`/r/${post.id}`}
      className="block border-b border-(--color-line) px-4 py-6 transition-colors hover:bg-black/[0.02]"
    >
      {post.type === "reframe" ? (
        <div className="flex flex-col gap-2">
          <p className="font-mincho text-(length:--text-card-before) text-(--color-ink-faded) line-through decoration-(--color-vermilion) decoration-2">
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
        <span className="ml-auto inline-flex items-center gap-4">
          <span className="inline-flex items-center gap-1">
            <Heart className="h-4 w-4 text-(--color-vermilion)" />
            {post.reaction_count}
          </span>
          <span className="inline-flex items-center gap-1">
            <MessageCircle className="h-4 w-4" />
            {post.comment_count}
          </span>
        </span>
      </div>
    </Link>
  );
}
