import Link from "next/link";

export function Header() {
  return (
    <header className="border-b border-(--color-line)">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
        <Link
          href="/"
          className="font-mincho text-lg tracking-wide text-(--color-ink)"
        >
          Reframe
        </Link>
        <nav className="flex items-center gap-5 text-sm text-(--color-ink-faded)">
          <Link href="/about" className="hover:text-(--color-ink)">
            about
          </Link>
          <Link href="/mine" className="hover:text-(--color-ink)">
            マイ投稿
          </Link>
          <Link href="/settings" className="hover:text-(--color-ink)">
            設定
          </Link>
          <Link
            href="/post"
            className="rounded-full border border-(--color-vermilion) px-3 py-1.5 text-(--color-vermilion) hover:bg-(--color-vermilion) hover:text-(--color-paper)"
          >
            投稿する
          </Link>
        </nav>
      </div>
    </header>
  );
}
