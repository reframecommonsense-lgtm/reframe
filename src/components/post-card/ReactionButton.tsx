"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { ensureAnonymousSession } from "@/lib/supabase/client";
import { toggleReaction } from "@/lib/actions/reactions";

interface ReactionButtonProps {
  postId: string;
  initialCount: number;
  initialReacted: boolean;
}

export function ReactionButton({
  postId,
  initialCount,
  initialReacted,
}: ReactionButtonProps) {
  const [reacted, setReacted] = useState(initialReacted);
  const [count, setCount] = useState(initialCount);
  const [isPending, startTransition] = useTransition();

  function handleClick(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (isPending) return;

    const prevReacted = reacted;
    const nextReacted = !prevReacted;
    setReacted(nextReacted);
    setCount((c) => c + (nextReacted ? 1 : -1));

    startTransition(async () => {
      try {
        await ensureAnonymousSession();
        const result = await toggleReaction(postId);
        if (!result.success) {
          setReacted(prevReacted);
          setCount((c) => c + (nextReacted ? -1 : 1));
        }
      } catch {
        setReacted(prevReacted);
        setCount((c) => c + (nextReacted ? -1 : 1));
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={reacted}
      aria-label="リアクション"
      className="inline-flex items-center gap-1 text-xs text-(--color-ink-faded) transition-transform active:scale-90"
    >
      <Heart
        className={`h-4 w-4 transition-colors duration-150 ${
          reacted
            ? "fill-(--color-vermilion) text-(--color-vermilion)"
            : "text-(--color-ink-faded)"
        }`}
      />
      {count}
    </button>
  );
}
