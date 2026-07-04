"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface ShareButtonsProps {
  shareIntentUrl: string;
  pageUrl: string;
}

export function ShareButtons({ shareIntentUrl, pageUrl }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(pageUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // クリップボードAPIが使えない環境では何もしない
    }
  }

  return (
    <div className="flex flex-wrap gap-3">
      <a
        href={shareIntentUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-full bg-(--color-ink) px-5 py-2 text-sm text-(--color-paper)"
      >
        Xでシェア
      </a>
      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex items-center gap-2 rounded-full border border-(--color-line) px-5 py-2 text-sm text-(--color-ink-faded)"
      >
        {copied ? (
          <Check className="h-4 w-4" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
        {copied ? "コピーしました" : "URLコピー"}
      </button>
    </div>
  );
}
