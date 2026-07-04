"use client";

import { useState, useTransition } from "react";
import { LIMITS } from "@/lib/constants";

interface CommentFormProps {
  onSubmit: (body: string) => Promise<string | null>;
}

export function CommentForm({ onSubmit }: CommentFormProps) {
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function submit() {
    const trimmed = body.trim();
    if (!trimmed) return;
    setError(null);

    startTransition(async () => {
      const result = await onSubmit(trimmed);
      if (result) {
        setError(result);
        return;
      }
      setBody("");
    });
  }

  return (
    <div className="flex flex-col gap-2 py-4">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
        maxLength={LIMITS.comment}
        placeholder="コメントする（匿名可）"
        className="rounded-lg border border-(--color-line) bg-transparent px-3 py-2 text-(length:--text-base) outline-none focus:border-(--color-vermilion)"
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-(--color-ink-faded)">
          {body.length}/{LIMITS.comment}
        </span>
        <button
          type="button"
          onClick={submit}
          disabled={!body.trim() || isPending}
          className="rounded-full bg-(--color-vermilion) px-5 py-1.5 text-sm text-(--color-paper) disabled:opacity-40"
        >
          {isPending ? "送信中…" : "コメントする"}
        </button>
      </div>
      {error && <p className="text-sm text-(--color-vermilion)">{error}</p>}
    </div>
  );
}
