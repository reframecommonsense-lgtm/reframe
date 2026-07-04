"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createCommentSchema, type CreateCommentInput } from "@/lib/validation";
import { RATE_LIMIT_MESSAGES, ANONYMOUS_DISPLAY_NAME } from "@/lib/constants";
import type { Comment } from "@/lib/types";

export interface CreateCommentResult {
  success: boolean;
  comment?: Comment;
  error?: string;
}

export async function createComment(
  input: CreateCommentInput,
): Promise<CreateCommentResult> {
  const parsed = createCommentSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "入力内容を確認してください。" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: "セッションが確立できませんでした。ページを再読み込みしてください。",
    };
  }

  const { data: inserted, error } = await supabase
    .from("comments")
    .insert({
      post_id: parsed.data.postId,
      author_id: user.id,
      body: parsed.data.body,
    })
    .select(
      "id, body, created_at, profiles!comments_author_id_fkey(display_name, is_official)",
    )
    .single();

  if (error) {
    return {
      success: false,
      error:
        RATE_LIMIT_MESSAGES[error.message] ?? "コメントの投稿に失敗しました。",
    };
  }

  revalidatePath(`/r/${parsed.data.postId}`);

  const profile = (
    Array.isArray(inserted.profiles) ? inserted.profiles[0] : inserted.profiles
  ) as { display_name: string; is_official: boolean } | null;

  return {
    success: true,
    comment: {
      id: inserted.id,
      body: inserted.body,
      created_at: inserted.created_at,
      author_display_name: profile?.display_name ?? ANONYMOUS_DISPLAY_NAME,
      author_is_official: profile?.is_official ?? false,
    },
  };
}
