"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deletePost } from "@/lib/actions/posts";

export function DeletePostButton({ postId }: { postId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!window.confirm("この投稿を削除しますか？この操作は取り消せません。")) {
      return;
    }
    setError(null);

    startTransition(async () => {
      const result = await deletePost(postId);
      if (!result.success) {
        setError(result.error ?? "削除に失敗しました。");
        return;
      }
      router.push("/");
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        className="text-xs text-(--color-ink-faded) underline disabled:opacity-40"
      >
        {isPending ? "削除中…" : "この投稿を削除する"}
      </button>
      {error && <p className="text-xs text-(--color-vermilion)">{error}</p>}
    </div>
  );
}
