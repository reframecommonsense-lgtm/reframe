import { OfficialBadge } from "@/components/post-card/OfficialBadge";
import { ReportButton } from "@/components/post-card/ReportButton";
import { formatRelativeTime } from "@/lib/format";
import type { Comment } from "@/lib/types";

export function CommentItem({ comment }: { comment: Comment }) {
  const isConfirmed = !comment.id.startsWith("temp-");

  return (
    <li className="border-b border-(--color-line) py-4">
      <div className="mb-1 flex items-center gap-2 text-xs text-(--color-ink-faded)">
        {comment.author_is_official && <OfficialBadge />}
        <span>{comment.author_display_name}</span>
        <span>{formatRelativeTime(comment.created_at)}</span>
        {isConfirmed && (
          <span className="ml-auto">
            <ReportButton target="comment" commentId={comment.id} />
          </span>
        )}
      </div>
      <p className="whitespace-pre-line text-(length:--text-base) text-(--color-ink)">
        {comment.body}
      </p>
    </li>
  );
}
