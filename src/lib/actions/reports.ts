"use server";

import { createClient } from "@/lib/supabase/server";

export type ReportReason = "spam" | "abuse" | "offtopic" | "other";

export interface CreateReportResult {
  success: boolean;
  error?: string;
}

export async function reportPost(
  postId: string,
  reason: ReportReason,
): Promise<CreateReportResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "セッションが確立できませんでした。" };
  }

  const { error } = await supabase
    .from("reports")
    .insert({ post_id: postId, reporter_id: user.id, reason });

  if (error) {
    return {
      success: false,
      error: error.code === "23505" ? "既に通報済みです。" : "通報に失敗しました。",
    };
  }

  return { success: true };
}

export async function reportComment(
  commentId: string,
  reason: ReportReason,
): Promise<CreateReportResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "セッションが確立できませんでした。" };
  }

  const { error } = await supabase
    .from("comment_reports")
    .insert({ comment_id: commentId, reporter_id: user.id, reason });

  if (error) {
    return {
      success: false,
      error: error.code === "23505" ? "既に通報済みです。" : "通報に失敗しました。",
    };
  }

  return { success: true };
}
