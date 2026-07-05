"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { TypeSelector } from "./TypeSelector";
import { LivePreview } from "./LivePreview";
import { CATEGORIES, LIMITS } from "@/lib/constants";
import { ensureAnonymousSession } from "@/lib/supabase/client";
import { createPost, editPost } from "@/lib/actions/posts";
import type { PostType } from "@/lib/types";

type Step = "type" | "input" | "category";

export interface EditingPost {
  id: string;
  type: PostType;
  beforeText?: string;
  afterText?: string;
  title?: string;
  body?: string;
  category: string;
  sourceTitle?: string;
  sourceUrl?: string;
}

interface PostFormProps {
  editingPost?: EditingPost;
}

export function PostForm({ editingPost }: PostFormProps) {
  const router = useRouter();
  const isEditing = Boolean(editingPost);
  const [step, setStep] = useState<Step>(editingPost ? "input" : "type");
  const [type, setType] = useState<PostType | null>(editingPost?.type ?? null);
  const [beforeText, setBeforeText] = useState(editingPost?.beforeText ?? "");
  const [afterText, setAfterText] = useState(editingPost?.afterText ?? "");
  const [title, setTitle] = useState(editingPost?.title ?? "");
  const [body, setBody] = useState(editingPost?.body ?? "");
  const [sourceTitle, setSourceTitle] = useState(
    editingPost?.sourceTitle ?? "",
  );
  const [sourceUrl, setSourceUrl] = useState(editingPost?.sourceUrl ?? "");
  const [category, setCategory] = useState(editingPost?.category ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function selectType(next: PostType) {
    setType(next);
    setStep("input");
  }

  function goToCategory() {
    setError(null);
    if (type === "reframe" && (!beforeText.trim() || !afterText.trim())) {
      setError("一般的な見方とリフレームした見方の両方を入力してください。");
      return;
    }
    if (type === "frame" && (!title.trim() || !body.trim())) {
      setError("タイトルと本文を入力してください。");
      return;
    }
    setStep("category");
  }

  function submit() {
    if (!type || !category) return;
    setError(null);

    startTransition(async () => {
      try {
        await ensureAnonymousSession();
      } catch {
        setError("セッションの確立に失敗しました。時間をおいて再度お試しください。");
        return;
      }

      const input =
        type === "reframe"
          ? {
              type: "reframe" as const,
              beforeText,
              afterText,
              body,
              category,
              sourceTitle,
              sourceUrl,
            }
          : {
              type: "frame" as const,
              title,
              body,
              category,
              sourceTitle,
              sourceUrl,
            };

      if (isEditing && editingPost) {
        const result = await editPost(editingPost.id, input);
        if (!result.success) {
          setError(result.error ?? "更新に失敗しました。");
          return;
        }
        router.push(`/r/${editingPost.id}`);
        return;
      }

      const result = await createPost(input);
      if (!result.success) {
        setError(result.error ?? "投稿に失敗しました。");
        return;
      }
      router.push(`/r/${result.postId}`);
    });
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      {step === "type" && <TypeSelector onSelect={selectType} />}

      {step === "input" && type && (
        <div className="flex flex-col gap-6">
          {type === "reframe" ? (
            <>
              <Field
                label={`一般的な見方（〜${LIMITS.beforeText}字）`}
                value={beforeText}
                max={LIMITS.beforeText}
                onChange={setBeforeText}
                placeholder="世間でよく言われること・当たり前とされていること"
              />
              <Field
                label={`リフレームした見方（〜${LIMITS.afterText}字）`}
                value={afterText}
                max={LIMITS.afterText}
                onChange={setAfterText}
                placeholder="自分はこう見ている・こう考えられる"
              />
              <Field
                label={`解説（任意・〜${LIMITS.body}字）`}
                value={body}
                max={LIMITS.body}
                onChange={setBody}
                textarea
                placeholder="補足があれば"
              />
            </>
          ) : (
            <>
              <Field
                label={`タイトル（〜${LIMITS.title}字）`}
                value={title}
                max={LIMITS.title}
                onChange={setTitle}
                placeholder="紹介したい思考法のタイトル"
              />
              <Field
                label={`本文（〜${LIMITS.body}字）`}
                value={body}
                max={LIMITS.body}
                onChange={setBody}
                textarea
                placeholder="思考法の内容"
              />
            </>
          )}

          <div className="flex flex-col gap-4 rounded-lg border border-(--color-line) p-4">
            <p className="text-xs text-(--color-ink-faded)">
              引用元（任意・他の記事などを参考にした場合）
            </p>
            <Field
              label={`引用元タイトル（〜${LIMITS.sourceTitle}字）`}
              value={sourceTitle}
              max={LIMITS.sourceTitle}
              onChange={setSourceTitle}
              placeholder="引用した記事のタイトル"
            />
            <label className="flex flex-col gap-1.5">
              <span className="text-sm text-(--color-ink-faded)">
                引用元URL
              </span>
              <input
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://..."
                className="rounded-lg border border-(--color-line) bg-transparent px-3 py-2 text-(length:--text-base) outline-none focus:border-(--color-vermilion)"
              />
            </label>
          </div>

          <LivePreview
            type={type}
            beforeText={beforeText}
            afterText={afterText}
            title={title}
            body={body}
          />

          {error && <p className="text-sm text-(--color-vermilion)">{error}</p>}

          <div className="flex justify-between">
            {isEditing ? (
              <span />
            ) : (
              <button
                type="button"
                onClick={() => setStep("type")}
                className="text-sm text-(--color-ink-faded)"
              >
                戻る
              </button>
            )}
            <button
              type="button"
              onClick={goToCategory}
              className="rounded-full bg-(--color-ink) px-6 py-2 text-sm text-(--color-paper)"
            >
              次へ
            </button>
          </div>
        </div>
      )}

      {step === "category" && (
        <div className="flex flex-col gap-6">
          <p className="text-sm text-(--color-ink-faded)">
            カテゴリを1つ選んでください
          </p>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setCategory(c.value)}
                className={`rounded-full border px-4 py-2 text-sm ${
                  category === c.value
                    ? "border-(--color-vermilion) bg-(--color-vermilion) text-(--color-paper)"
                    : "border-(--color-line) text-(--color-ink-faded)"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {error && <p className="text-sm text-(--color-vermilion)">{error}</p>}

          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setStep("input")}
              className="text-sm text-(--color-ink-faded)"
            >
              戻る
            </button>
            <button
              type="button"
              disabled={!category || isPending}
              onClick={submit}
              className="rounded-full bg-(--color-vermilion) px-6 py-2 text-sm text-(--color-paper) disabled:opacity-40"
            >
              {isPending
                ? isEditing
                  ? "更新中…"
                  : "投稿中…"
                : isEditing
                  ? "更新する"
                  : "投稿する"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

interface FieldProps {
  label: string;
  value: string;
  max: number;
  onChange: (value: string) => void;
  placeholder?: string;
  textarea?: boolean;
}

function Field({ label, value, max, onChange, placeholder, textarea }: FieldProps) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="flex items-center justify-between text-sm text-(--color-ink-faded)">
        <span>{label}</span>
        <span className={value.length > max ? "text-(--color-vermilion)" : ""}>
          {value.length}/{max}
        </span>
      </span>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={4}
          className="rounded-lg border border-(--color-line) bg-transparent px-3 py-2 text-(length:--text-base) outline-none focus:border-(--color-vermilion)"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="rounded-lg border border-(--color-line) bg-transparent px-3 py-2 text-(length:--text-base) outline-none focus:border-(--color-vermilion)"
        />
      )}
    </label>
  );
}
