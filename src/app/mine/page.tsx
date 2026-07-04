import Link from "next/link";
import { getPostsByCurrentUser } from "@/lib/posts";
import { CATEGORIES } from "@/lib/constants";
import { formatRelativeTime } from "@/lib/format";

function categoryLabel(value: string): string {
  return CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

const STATUS_LABEL: Record<string, string> = {
  hidden: "通報により非表示",
};

export default async function MinePage() {
  const posts = await getPostsByCurrentUser();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 font-gothic text-2xl font-bold text-(--color-ink)">
        マイ投稿
      </h1>

      {posts.length === 0 ? (
        <p className="text-sm text-(--color-ink-faded)">
          まだ投稿がありません。
        </p>
      ) : (
        <ul>
          {posts.map((post) => (
            <li
              key={post.id}
              className="flex flex-col gap-2 border-b border-(--color-line) py-4"
            >
              <Link href={`/r/${post.id}`} className="block">
                {post.type === "reframe" ? (
                  <p className="font-gothic font-bold text-(--color-ink)">
                    {post.before_text} → {post.after_text}
                  </p>
                ) : (
                  <p className="font-gothic font-bold text-(--color-ink)">
                    {post.title}
                  </p>
                )}
              </Link>
              <div className="flex flex-wrap items-center gap-3 text-xs text-(--color-ink-faded)">
                <span className="rounded-full border border-(--color-line) px-2 py-0.5">
                  {categoryLabel(post.category)}
                </span>
                {STATUS_LABEL[post.status] && (
                  <span className="text-(--color-vermilion)">
                    {STATUS_LABEL[post.status]}
                  </span>
                )}
                <span>{formatRelativeTime(post.created_at)}</span>
                <Link href={`/r/${post.id}/edit`} className="ml-auto underline">
                  編集する
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
