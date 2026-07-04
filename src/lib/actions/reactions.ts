"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface ToggleReactionResult {
  success: boolean;
  reacted?: boolean;
  error?: string;
}

export async function toggleReaction(
  postId: string,
): Promise<ToggleReactionResult> {
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

  const { data: existing } = await supabase
    .from("reactions")
    .select("post_id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("reactions")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", user.id);

    if (error) {
      return { success: false, error: "操作に失敗しました。" };
    }

    revalidatePath(`/r/${postId}`);
    revalidatePath("/");
    return { success: true, reacted: false };
  }

  const { error } = await supabase
    .from("reactions")
    .insert({ post_id: postId, user_id: user.id });

  if (error) {
    return { success: false, error: "操作に失敗しました。" };
  }

  revalidatePath(`/r/${postId}`);
  revalidatePath("/");
  return { success: true, reacted: true };
}
