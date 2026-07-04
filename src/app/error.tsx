"use client";

import Link from "next/link";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-4 py-24 text-center">
      <p className="font-mincho text-3xl text-(--color-vermilion)">
        エラーが発生しました
      </p>
      <p className="text-(--color-ink-faded)">
        予期しない問題が起きました。時間をおいて再度お試しください。
      </p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-(--color-vermilion) px-5 py-2 text-sm text-(--color-paper)"
        >
          再試行する
        </button>
        <Link
          href="/"
          className="rounded-full border border-(--color-line) px-5 py-2 text-sm text-(--color-ink) hover:border-(--color-vermilion)"
        >
          フィードに戻る
        </Link>
      </div>
    </div>
  );
}
