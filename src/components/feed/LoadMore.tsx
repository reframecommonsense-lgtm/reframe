import Link from "next/link";
import type { FeedTab } from "@/lib/posts";

interface LoadMoreProps {
  tab: FeedTab;
  category?: string;
  nextPage: number;
}

export function LoadMore({ tab, category, nextPage }: LoadMoreProps) {
  const params = new URLSearchParams({ tab, page: String(nextPage) });
  if (category) params.set("cat", category);

  return (
    <div className="flex justify-center py-8">
      <Link
        href={`/?${params.toString()}`}
        className="rounded-full border border-(--color-line) px-6 py-2 text-sm text-(--color-ink-faded) hover:border-(--color-vermilion) hover:text-(--color-vermilion)"
      >
        もっと見る
      </Link>
    </div>
  );
}
