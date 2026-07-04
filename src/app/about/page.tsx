import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | Reframe",
  description: "Reframeが何をする場所なのか。呪いを解くという話。",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="font-mincho text-3xl text-(--color-ink)">
        呪いを解く。
      </h1>

      <div className="mt-10 flex flex-col gap-8 text-(length:--text-base) leading-relaxed text-(--color-ink)">
        <p>
          「〜すべき」。「失敗は悪」。「普通はこうする」。
          <br />
          気づけば刷り込まれている常識という名の呪いが、世の中にはいくつも転がっている。
        </p>

        <p>
          Reframe は、その呪いに朱を入れる場所だ。
          <br />
          名言集ではない。正論でも、綺麗事でもない。
          <br />
          「なるほど、そう見えるのか」という認知の反転がないものは、ここには置かない。
        </p>

        <p>
          名乗らなくていい。うまく書けなくていい。
          <br />
          誰かが書いた一行が、別の誰かの世界の見え方を変える。それだけで十分価値がある。
        </p>

        <p className="font-mincho text-(--color-ink-faded)">
          校正する。反転する。朱を入れる。
        </p>
      </div>
    </div>
  );
}
