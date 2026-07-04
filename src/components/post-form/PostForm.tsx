"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { TypeSelector } from "./TypeSelector";
import { LivePreview } from "./LivePreview";
import { CATEGORIES, LIMITS } from "@/lib/constants";
import { ensureAnonymousSession } from "@/lib/supabase/client";
import { createPost } from "@/lib/actions/posts";
import type { PostType } from "@/lib/types";

type Step = "type" | "input" | "category";

export function PostForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("type");
  const [type, setType] = useState<PostType | null>(null);
  const [beforeText, setBeforeText] = useState("");
  const [afterText, setAfterText] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function selectType(next: PostType) {
    setType(next);
    setStep("input");
  }

  function goToCategory() {
    setError(null);
    if (type === "reframe" && (!beforeText.trim() || !afterText.trim())) {
      setError("BeforeとAfterの両方を入力してください。");
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
          ? { type: "reframe" as const, beforeText, afterText, body, category }
          : { type: "frame" as const, title, body, category };

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
                label={`Before（〜${LIMITS.beforeText}字）`}
                value={beforeText}
                max={LIMITS.beforeText}
                onChange={setBeforeText}
                placeholder="世間で言われている「〜すべき」"
              />
              <Field
                label={`After（〜${LIMITS.afterText}字）`}
                value={afterText}
                max={LIMITS.afterText}
                onChange={setAfterText}
                placeholder="実はこう見える"
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

          <LivePreview
            type={type}
            beforeText={beforeText}
            afterText={afterText}
            title={title}
            body={body}
          />

          {error && <p className="text-sm text-(--color-vermilion)">{error}</p>}

          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setStep("type")}
              className="text-sm text-(--color-ink-faded)"
            >
              戻る
            </button>
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
              {isPending ? "投稿中…" : "投稿する"}
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
