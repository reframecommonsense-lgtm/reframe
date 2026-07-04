import Link from "next/link";
import type { FeedTab } from "@/lib/posts";

const TABS: { value: FeedTab; label: string }[] = [
  { value: "hot", label: "急上昇" },
  { value: "new", label: "新着" },
  { value: "top", label: "殿堂" },
];

interface FeedTabsProps {
  active: FeedTab;
  category?: string;
}

export function FeedTabs({ active, category }: FeedTabsProps) {
  return (
    <div className="flex border-b border-(--color-line)">
      {TABS.map((tab) => {
        const params = new URLSearchParams({ tab: tab.value });
        if (category) params.set("cat", category);
        const isActive = active === tab.value;

        return (
          <Link
            key={tab.value}
            href={`/?${params.toString()}`}
            className={`px-4 py-3 text-sm font-bold ${
              isActive
                ? "border-b-2 border-(--color-vermilion) text-(--color-ink)"
                : "text-(--color-ink-faded)"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
