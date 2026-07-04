"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { updateProfileSchema, type UpdateProfileInput } from "@/lib/validation";

export interface UpdateProfileResult {
  success: boolean;
  error?: string;
}

export async function updateProfile(
  input: UpdateProfileInput,
): Promise<UpdateProfileResult> {
  const parsed = updateProfileSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "入力内容を確認してください。",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "セッションが確立できませんでした。" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      handle: parsed.data.handle,
      display_name: parsed.data.displayName,
    })
    .eq("id", user.id);

  if (error) {
    const message =
      error.code === "23505"
        ? "そのハンドルは既に使われています。"
        : "更新に失敗しました。";
    return { success: false, error: message };
  }

  revalidatePath("/settings");
  revalidatePath(`/u/${parsed.data.handle}`);
  return { success: true };
}
