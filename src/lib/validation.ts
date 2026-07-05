import { z } from "zod";
import { CATEGORIES, LIMITS } from "./constants";

const categoryValues = CATEGORIES.map((c) => c.value) as [string, ...string[]];
const categorySchema = z.enum(categoryValues);

const sourceFields = {
  sourceTitle: z
    .string()
    .trim()
    .max(LIMITS.sourceTitle)
    .optional()
    .or(z.literal("")),
  sourceUrl: z
    .string()
    .trim()
    .url("正しいURLの形式で入力してください")
    .optional()
    .or(z.literal("")),
};

export const createPostSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("reframe"),
    beforeText: z.string().trim().min(1).max(LIMITS.beforeText),
    afterText: z.string().trim().min(1).max(LIMITS.afterText),
    body: z.string().trim().max(LIMITS.body).optional(),
    category: categorySchema,
    ...sourceFields,
  }),
  z.object({
    type: z.literal("frame"),
    title: z.string().trim().min(1).max(LIMITS.title),
    body: z.string().trim().min(1).max(LIMITS.body),
    category: categorySchema,
    ...sourceFields,
  }),
]);

export type CreatePostInput = z.infer<typeof createPostSchema>;

export const createCommentSchema = z.object({
  postId: z.string().uuid(),
  body: z.string().trim().min(1).max(LIMITS.comment),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;

export const updateProfileSchema = z.object({
  handle: z
    .string()
    .trim()
    .min(LIMITS.handleMin, `${LIMITS.handleMin}文字以上で入力してください`)
    .max(LIMITS.handleMax, `${LIMITS.handleMax}文字以内で入力してください`)
    .regex(/^[a-zA-Z0-9_]+$/, "英数字とアンダースコアのみ使用できます"),
  displayName: z
    .string()
    .trim()
    .min(1, "表示名を入力してください")
    .max(LIMITS.displayName, `${LIMITS.displayName}文字以内で入力してください`),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
