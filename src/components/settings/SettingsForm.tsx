"use client";

import { useEffect, useState, useTransition } from "react";
import { createClient, ensureAnonymousSession } from "@/lib/supabase/client";
import { updateProfile } from "@/lib/actions/profile";
import { LIMITS } from "@/lib/constants";

interface ProfileState {
  isAnonymous: boolean;
  displayName: string;
  handle: string | null;
}

export function SettingsForm() {
  const [profile, setProfile] = useState<ProfileState | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [handle, setHandle] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    (async () => {
      const session = await ensureAnonymousSession();
      if (!session) return;

      const supabase = createClient();
      const { data } = await supabase
        .from("profiles")
        .select("display_name, handle, is_anonymous")
        .eq("id", session.user.id)
        .maybeSingle();

      if (data) {
        setProfile({
          isAnonymous: data.is_anonymous,
          displayName: data.display_name,
          handle: data.handle,
        });
        setDisplayName(data.display_name);
        setHandle(data.handle ?? "");
      }
    })();
  }, []);

  async function handleLink(provider: "google" | "x") {
    setError(null);
    const supabase = createClient();
    const { error: linkError } = await supabase.auth.linkIdentity({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/settings`,
      },
    });

    if (linkError) {
      setError(
        "ログイン連携に失敗しました。時間をおいて再度お試しください。",
      );
    }
  }

  function handleSave() {
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const result = await updateProfile({ handle, displayName });
      if (!result.success) {
        setError(result.error ?? "更新に失敗しました。");
        return;
      }
      setProfile((prev) => (prev ? { ...prev, displayName, handle } : prev));
      setMessage("保存しました。");
    });
  }

  if (!profile) {
    return <p className="text-sm text-(--color-ink-faded)">読み込み中…</p>;
  }

  if (profile.isAnonymous) {
    return (
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-bold text-(--color-ink-faded)">
          アカウント登録
        </h2>
        <p className="text-sm text-(--color-ink-faded)">
          登録すると投稿・リアクション・コメントの履歴がそのまま引き継がれます。
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => handleLink("google")}
            className="rounded-full border border-(--color-line) px-5 py-2 text-sm text-(--color-ink)"
          >
            Googleで登録
          </button>
          <button
            type="button"
            onClick={() => handleLink("x")}
            className="rounded-full border border-(--color-line) px-5 py-2 text-sm text-(--color-ink)"
          >
            Xで登録
          </button>
        </div>
        {error && <p className="text-sm text-(--color-vermilion)">{error}</p>}
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-sm font-bold text-(--color-ink-faded)">
        プロフィール
      </h2>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm text-(--color-ink-faded)">
          ハンドル（英数字・_、{LIMITS.handleMin}〜{LIMITS.handleMax}字）
        </span>
        <input
          value={handle}
          onChange={(e) => setHandle(e.target.value)}
          className="rounded-lg border border-(--color-line) bg-transparent px-3 py-2 text-(length:--text-base) outline-none focus:border-(--color-vermilion)"
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm text-(--color-ink-faded)">表示名</span>
        <input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="rounded-lg border border-(--color-line) bg-transparent px-3 py-2 text-(length:--text-base) outline-none focus:border-(--color-vermilion)"
        />
      </label>

      {error && <p className="text-sm text-(--color-vermilion)">{error}</p>}
      {message && (
        <p className="text-sm text-(--color-ink-faded)">{message}</p>
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={isPending}
        className="self-start rounded-full bg-(--color-vermilion) px-6 py-2 text-sm text-(--color-paper) disabled:opacity-40"
      >
        {isPending ? "保存中…" : "保存する"}
      </button>

      {profile.handle && (
        <a
          href={`/u/${profile.handle}`}
          className="text-sm text-(--color-vermilion) underline"
        >
          自分のページを見る
        </a>
      )}
    </section>
  );
}
