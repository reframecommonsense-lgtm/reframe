"use client";

import { useState } from "react";
import { CommentForm } from "./CommentForm";
import { CommentList } from "./CommentList";
import { ensureAnonymousSession } from "@/lib/supabase/client";
import { createComment } from "@/lib/actions/comments";
import { ANONYMOUS_DISPLAY_NAME } from "@/lib/constants";
import type { Comment } from "@/lib/types";

interface CommentsSectionProps {
  postId: string;
  initialComments: Comment[];
}

export function CommentsSection({
  postId,
  initialComments,
}: CommentsSectionProps) {
  const [comments, setComments] = useState(initialComments);

  async function handleSubmit(body: string): Promise<string | null> {
    const tempId = `temp-${crypto.randomUUID()}`;
    const optimisticComment: Comment = {
      id: tempId,
      body,
      created_at: new Date().toISOString(),
      author_display_name: ANONYMOUS_DISPLAY_NAME,
      author_is_official: false,
    };
    setComments((prev) => [...prev, optimisticComment]);

    try {
      await ensureAnonymousSession();
    } catch {
      setComments((prev) => prev.filter((c) => c.id !== tempId));
      return "セッションの確立に失敗しました。時間をおいて再度お試しください。";
    }

    const result = await createComment({ postId, body });
    if (!result.success || !result.comment) {
      setComments((prev) => prev.filter((c) => c.id !== tempId));
      return result.error ?? "コメントの投稿に失敗しました。";
    }

    const confirmed = result.comment;
    setComments((prev) => prev.map((c) => (c.id === tempId ? confirmed : c)));
    return null;
  }

  return (
    <section id="comments" className="mt-10 border-t border-(--color-line) pt-6">
      <h2 className="mb-2 text-sm font-bold text-(--color-ink-faded)">
        コメント（{comments.length}）
      </h2>
      <CommentForm onSubmit={handleSubmit} />
      <CommentList comments={comments} />
    </section>
  );
}
