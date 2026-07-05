export const CATEGORIES = [
  { value: "work", label: "仕事・キャリア" },
  { value: "relationship", label: "人間関係" },
  { value: "money", label: "お金" },
  { value: "challenge", label: "失敗・挑戦" },
  { value: "life", label: "生き方" },
  { value: "learning", label: "学び・思考法" },
] as const;

export type Category = (typeof CATEGORIES)[number]["value"];

export const LIMITS = {
  beforeText: 120,
  afterText: 120,
  title: 60,
  body: 2000,
  comment: 500,
  handleMin: 3,
  handleMax: 20,
  displayName: 30,
  sourceTitle: 100,
} as const;

export const ANONYMOUS_DISPLAY_NAME = "名も無き視点";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const RATE_LIMIT_MESSAGES: Record<string, string> = {
  RATE_LIMIT_DAILY: "本日の上限に達しました。日をまたいでからお試しください。",
  RATE_LIMIT_INTERVAL: "少し間隔を空けてからお試しください。",
};
