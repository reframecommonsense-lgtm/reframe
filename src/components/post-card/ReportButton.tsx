"use client";

import { useState, useTransition } from "react";
import { Flag } from "lucide-react";
import { ensureAnonymousSession } from "@/lib/supabase/client";
import { reportPost, reportComment, type ReportReason } from "@/lib/actions/reports";

const REASONS: { value: ReportReason; label: string }[] = [
  { value: "spam", label: "スパム" },
  { value: "abuse", label: "誹謗中傷" },
  { value: "offtopic", label: "趣旨違反" },
  { value: "other", label: "その他" },
];

type ReportButtonProps =
  | { target: "post"; postId: string }
  | { target: "comment"; commentId: string };

export function ReportButton(props: ReportButtonProps) {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSelect(reason: ReportReason) {
    setError(null);
    startTransition(async () => {
      try {
        await ensureAnonymousSession();
      } catch {
        setError("セッションの確立に失敗しました。");
        return;
      }

      const result =
        props.target === "post"
          ? await reportPost(props.postId, reason)
          : await reportComment(props.commentId, reason);
      if (!result.success) {
        setError(result.error ?? "通報に失敗しました。");
        return;
      }
      setDone(true);
      setOpen(false);
    });
  }

  if (done) {
    return (
      <span className="text-xs text-(--color-ink-faded)">通報しました</span>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        aria-label="通報"
        className="inline-flex items-center text-(--color-ink-faded) hover:text-(--color-vermilion)"
      >
        <Flag className="h-3.5 w-3.5" />
      </button>
      {open && (
        <div className="absolute right-0 z-10 mt-1 flex w-36 flex-col gap-1 rounded-lg border border-(--color-line) bg-(--color-paper) p-2 shadow-sm">
          {REASONS.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSelect(r.value);
              }}
              disabled={isPending}
              className="rounded px-2 py-1 text-left text-xs text-(--color-ink-faded) hover:bg-black/5"
            >
              {r.label}
            </button>
          ))}
        </div>
      )}
      {error && (
        <p className="absolute right-0 mt-1 w-36 text-xs text-(--color-vermilion)">
          {error}
        </p>
      )}
    </div>
  );
}
