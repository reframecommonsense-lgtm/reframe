import { z } from "zod";
import { CATEGORIES, LIMITS } from "./constants";

const categoryValues = CATEGORIES.map((c) => c.value) as [string, ...string[]];
const categorySchema = z.enum(categoryValues);

export const createPostSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("reframe"),
    beforeText: z.string().trim().min(1).max(LIMITS.beforeText),
    afterText: z.string().trim().min(1).max(LIMITS.afterText),
    body: z.string().trim().max(LIMITS.body).optional(),
    category: categorySchema,
  }),
  z.object({
    type: z.literal("frame"),
    title: z.string().trim().min(1).max(LIMITS.title),
    body: z.string().trim().min(1).max(LIMITS.body),
    category: categorySchema,
  }),
]);

export type CreatePostInput = z.infer<typeof createPostSchema>;

export const createCommentSchema = z.object({
  postId: z.string().uuid(),
  body: z.string().trim().min(1).max(LIMITS.comment),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
