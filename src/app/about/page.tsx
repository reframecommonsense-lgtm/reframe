import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | Reframe",
  description: "Reframeが何をする場所なのか。見方はひとつじゃないという話。",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="font-mincho text-3xl text-(--color-ink)">
        見方はひとつじゃない。
      </h1>

      <div className="mt-10 flex flex-col gap-8 text-(length:--text-base) leading-relaxed text-(--color-ink)">
        <p>
          「〜すべき」。「失敗は悪」。「普通はこうする」。
          <br />
          気づけば刷り込まれている「当たり前」が、世の中にはいくつも転がっている。
        </p>

        <p>
          Reframe は、その「当たり前」の隣に、もうひとつの見方を並べる場所だ。
          <br />
          どちらが正しいかを決める場所ではない。名言集でも、正論の押し付けでもない。
          <br />
          「なるほど、そう見ることもできるのか」という視点の広がりだけを集める。
        </p>

        <p>
          名乗らなくていい。うまく書けなくていい。
          <br />
          誰かが書いた一行が、別の誰かにとっての「もうひとつの見方」になる。それだけで十分価値がある。
        </p>

        <p className="font-mincho text-(--color-ink-faded)">
          正すのではなく、並べる。決めつけず、増やす。
        </p>
      </div>
    </div>
  );
}
