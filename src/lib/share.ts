import type { Post } from "@/lib/types";

const X_INTENT_MAX_LENGTH = 280;
const HASHTAG = "#Reframe";

function truncateToBudget(text: string, maxLength: number): string {
  if (maxLength <= 0) return "";
  if (text.length <= maxLength) return text;
  if (maxLength === 1) return "…";
  return `${text.slice(0, maxLength - 1)}…`;
}

export function buildShareText(post: Post, siteUrl: string): string {
  const url = `${siteUrl}/r/${post.id}`;

  if (post.type === "reframe") {
    const before = post.before_text ?? "";
    const after = post.after_text ?? "";
    const render = (b: string, a: string) =>
      `「${b}」\n\n　→「${a}」\n\n${HASHTAG}\n${url}`;

    const full = render(before, after);
    if (full.length <= X_INTENT_MAX_LENGTH) return full;

    const overhead = render("", "").length;
    const budget = Math.max(X_INTENT_MAX_LENGTH - overhead, 0);
    const beforeBudget = Math.floor(budget / 2);
    return render(
      truncateToBudget(before, beforeBudget),
      truncateToBudget(after, budget - beforeBudget),
    );
  }

  const title = post.title ?? "";
  const render = (t: string) => `${t}\n\n${HASHTAG}\n${url}`;
  const full = render(title);
  if (full.length <= X_INTENT_MAX_LENGTH) return full;

  const overhead = render("").length;
  const budget = Math.max(X_INTENT_MAX_LENGTH - overhead, 0);
  return render(truncateToBudget(title, budget));
}

export function buildShareIntentUrl(post: Post, siteUrl: string): string {
  const params = new URLSearchParams({ text: buildShareText(post, siteUrl) });
  return `https://twitter.com/intent/tweet?${params.toString()}`;
}
