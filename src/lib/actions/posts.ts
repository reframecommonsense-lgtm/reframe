"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createPostSchema, type CreatePostInput } from "@/lib/validation";
import { RATE_LIMIT_MESSAGES } from "@/lib/constants";

export interface CreatePostResult {
  success: boolean;
  postId?: string;
  error?: string;
}

export async function createPost(
  input: CreatePostInput,
): Promise<CreatePostResult> {
  const parsed = createPostSchema.safeParse(input);
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

  const data = parsed.data;
  const row =
    data.type === "reframe"
      ? {
          author_id: user.id,
          type: "reframe" as const,
          before_text: data.beforeText,
          after_text: data.afterText,
          body: data.body || null,
          category: data.category,
        }
      : {
          author_id: user.id,
          type: "frame" as const,
          title: data.title,
          body: data.body,
          category: data.category,
        };

  const { data: inserted, error } = await supabase
    .from("posts")
    .insert(row as Record<string, unknown>)
    .select("id")
    .single();

  if (error) {
    return {
      success: false,
      error:
        RATE_LIMIT_MESSAGES[error.message] ??
        "投稿に失敗しました。しばらくしてからお試しください。",
    };
  }

  revalidatePath("/");
  return { success: true, postId: inserted.id };
}

export interface EditPostResult {
  success: boolean;
  error?: string;
}

export async function editPost(
  postId: string,
  input: CreatePostInput,
): Promise<EditPostResult> {
  const parsed = createPostSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "入力内容を確認してください。" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "セッションが確立できませんでした。" };
  }

  const data = parsed.data;
  const row =
    data.type === "reframe"
      ? {
          before_text: data.beforeText,
          after_text: data.afterText,
          body: data.body || null,
          category: data.category,
        }
      : {
          title: data.title,
          body: data.body,
          category: data.category,
        };

  const { error } = await supabase
    .from("posts")
    .update(row as Record<string, unknown>)
    .eq("id", postId)
    .eq("author_id", user.id);

  if (error) {
    return { success: false, error: "更新に失敗しました。" };
  }

  revalidatePath(`/r/${postId}`);
  revalidatePath("/");
  return { success: true };
}

export interface DeletePostResult {
  success: boolean;
  error?: string;
}

export async function deletePost(postId: string): Promise<DeletePostResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "セッションが確立できませんでした。" };
  }

  const { error } = await supabase
    .from("posts")
    .update({ status: "removed" })
    .eq("id", postId)
    .eq("author_id", user.id);

  if (error) {
    return { success: false, error: "削除に失敗しました。" };
  }

  revalidatePath(`/r/${postId}`);
  revalidatePath("/");
  return { success: true };
}
