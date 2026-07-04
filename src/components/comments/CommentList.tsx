import { CommentItem } from "./CommentItem";
import type { Comment } from "@/lib/types";

export function CommentList({ comments }: { comments: Comment[] }) {
  if (comments.length === 0) {
    return (
      <p className="py-6 text-sm text-(--color-ink-faded)">
        まだコメントはありません。最初のひとことをどうぞ。
      </p>
    );
  }

  return (
    <ul>
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} />
      ))}
    </ul>
  );
}
