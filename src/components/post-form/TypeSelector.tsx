"use client";

import type { PostType } from "@/lib/types";

interface TypeSelectorProps {
  onSelect: (type: PostType) => void;
}

export function TypeSelector({ onSelect }: TypeSelectorProps) {
  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={() => onSelect("reframe")}
        className="rounded-lg border border-(--color-line) px-6 py-8 text-left transition-colors hover:border-(--color-vermilion)"
      >
        <p className="font-gothic text-lg font-bold text-(--color-ink)">
          常識をひっくり返す
        </p>
        <p className="mt-1 text-sm text-(--color-ink-faded)">
          Before → After の落差で見せる
        </p>
      </button>
      <button
        type="button"
        onClick={() => onSelect("frame")}
        className="rounded-lg border border-(--color-line) px-6 py-8 text-left transition-colors hover:border-(--color-vermilion)"
      >
        <p className="font-gothic text-lg font-bold text-(--color-ink)">
          思考法を紹介する
        </p>
        <p className="mt-1 text-sm text-(--color-ink-faded)">
          自由記述でフレームワークを共有する
        </p>
      </button>
    </div>
  );
}
