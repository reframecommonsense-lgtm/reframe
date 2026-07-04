import Link from "next/link";
import { CATEGORIES } from "@/lib/constants";
import type { FeedTab } from "@/lib/posts";

interface CategoryFilterProps {
  active?: string;
  tab: FeedTab;
}

export function CategoryFilter({ active, tab }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2 px-4 py-3">
      <Link
        href={`/?tab=${tab}`}
        className={`rounded-full border px-3 py-1 text-xs ${
          !active
            ? "border-(--color-vermilion) text-(--color-vermilion)"
            : "border-(--color-line) text-(--color-ink-faded)"
        }`}
      >
        すべて
      </Link>
      {CATEGORIES.map((category) => (
        <Link
          key={category.value}
          href={`/?tab=${tab}&cat=${category.value}`}
          className={`rounded-full border px-3 py-1 text-xs ${
            active === category.value
              ? "border-(--color-vermilion) text-(--color-vermilion)"
              : "border-(--color-line) text-(--color-ink-faded)"
          }`}
        >
          {category.label}
        </Link>
      ))}
    </div>
  );
}
