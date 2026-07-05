import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getPostById } from "@/lib/posts";

export const alt = "Reframe";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const COLOR_PAPER = "#f6f3ee";
const COLOR_INK = "#181b1f";
const COLOR_INK_FADED = "#6e7178";
const COLOR_VERMILION = "#df2f1c";

export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getPostById(id);

  const [mincho, gothicBold] = await Promise.all([
    readFile(
      join(process.cwd(), "src/assets/fonts/ShipporiMincho-Regular.ttf"),
    ),
    readFile(
      join(process.cwd(), "src/assets/fonts/ZenKakuGothicNew-Bold.ttf"),
    ),
  ]);

  const beforeText = post?.type === "reframe" ? post.before_text ?? "" : "";
  const mainText =
    post?.type === "reframe"
      ? post.after_text ?? ""
      : post?.title ?? "Reframe";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          backgroundColor: COLOR_PAPER,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          {beforeText && (
            <div
              style={{
                display: "flex",
                fontFamily: "Shippori Mincho",
                fontSize: 40,
                color: COLOR_INK_FADED,
              }}
            >
              {beforeText}
            </div>
          )}
          {beforeText && (
            <div style={{ display: "flex", fontSize: 40, color: COLOR_VERMILION }}>
              ↓
            </div>
          )}
          <div
            style={{
              display: "flex",
              fontFamily: "Zen Kaku Gothic New",
              fontWeight: 700,
              fontSize: 60,
              color: COLOR_INK,
              lineHeight: 1.4,
            }}
          >
            {mainText}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            fontFamily: "Zen Kaku Gothic New",
            fontWeight: 700,
            fontSize: 28,
            color: COLOR_VERMILION,
          }}
        >
          Reframe
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Shippori Mincho", data: mincho, style: "normal", weight: 400 },
        {
          name: "Zen Kaku Gothic New",
          data: gothicBold,
          style: "normal",
          weight: 700,
        },
      ],
    },
  );
}
