import type { PostType } from "@/lib/types";

interface LivePreviewProps {
  type: PostType;
  beforeText: string;
  afterText: string;
  title: string;
  body: string;
}

export function LivePreview({
  type,
  beforeText,
  afterText,
  title,
  body,
}: LivePreviewProps) {
  const hasContent = type === "reframe" ? beforeText || afterText : title || body;
  if (!hasContent) return null;

  return (
    <div className="rounded-lg border border-(--color-line) p-4">
      <p className="mb-3 text-xs text-(--color-ink-faded)">プレビュー</p>
      {type === "reframe" ? (
        <div className="flex flex-col gap-2">
          {beforeText && (
            <p className="font-mincho text-(length:--text-card-before) text-(--color-ink-faded) line-through decoration-(--color-vermilion) decoration-2">
              {beforeText}
            </p>
          )}
          {afterText && (
            <p className="font-gothic text-(length:--text-card-after) font-bold text-(--color-ink)">
              {afterText}
            </p>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {title && (
            <p className="font-gothic text-(length:--text-card-after) font-bold text-(--color-ink)">
              {title}
            </p>
          )}
          {body && (
            <p className="line-clamp-3 whitespace-pre-line text-(length:--text-base) text-(--color-ink-faded)">
              {body}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
