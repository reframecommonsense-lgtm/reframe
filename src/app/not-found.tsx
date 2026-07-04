import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-4 py-24 text-center">
      <p className="font-mincho text-5xl text-(--color-vermilion)">404</p>
      <p className="text-(--color-ink-faded)">
        このページは見当たりませんでした。朱を入れる前に消えてしまったようです。
      </p>
      <Link
        href="/"
        className="rounded-full border border-(--color-line) px-5 py-2 text-sm text-(--color-ink) hover:border-(--color-vermilion)"
      >
        フィードに戻る
      </Link>
    </div>
  );
}
