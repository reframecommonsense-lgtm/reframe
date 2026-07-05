"use client";

import { useEffect, useState } from "react";
import type { Post } from "@/lib/types";

const STORAGE_KEY = "reframe_seen_hero";

interface HeroProps {
  post: Post;
}

export function Hero({ post }: HeroProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const seen = window.localStorage.getItem(STORAGE_KEY);
    if (!seen) {
      // localStorage はサーバーで読めないため、初回訪問判定はマウント後にしか行えない。
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisible(true);
      window.localStorage.setItem(STORAGE_KEY, "1");
    }
  }, []);

  if (!visible || post.type !== "reframe") return null;

  return (
    <section className="border-b border-(--color-line) px-4 py-16 text-center">
      <p className="mb-6 text-xs tracking-widest text-(--color-ink-faded)">
        REFRAME — 世界の見え方が変わる
      </p>
      <p className="font-mincho text-2xl text-(--color-ink-faded) sm:text-3xl">
        {post.before_text}
      </p>
      <p className="mt-6 font-gothic text-3xl font-bold text-(--color-ink) sm:text-4xl">
        {post.after_text}
      </p>
    </section>
  );
}
