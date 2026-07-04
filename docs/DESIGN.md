# Reframe 基本設計書

> **一言で**: 世界の見え方が変わる、脳のOSアップデート装置。
> 世間の凝り固まった「〜すべき」「失敗＝悪」という常識（呪い）に朱を入れ、
> 物事の枠組みを180度ひっくり返す「リフレーミング」を投稿・発見・シェアするUGCサイト。

この文書は実装担当（Sonnet）が迷わず着手できることを目的とした基本設計書。
仕様の細部で迷った場合は「§1 プロダクト原則」に立ち返って判断すること。

---

## 1. プロダクト原則（迷ったらここに帰る）

1. **ギャップが商品** — Before（呪い）と After（リフレーム）の落差こそが価値。UI・シェア画像・アニメーション、すべてこのギャップを最大化する方向に設計する。
2. **敷居ゼロ** — 匿名で読める・匿名で投稿できる・匿名でリアクションできる。会員登録を求める画面を極力出さない。
3. **綺麗事お断り** — 名言集ではない。「なるほど、そう見るのか」という認知の反転がないものは Reframe ではない。文言・トーンも説教臭さを排除する。
4. **シェアで完結する美しさ** — 投稿1件が X/Threads にそのまま貼れるカードとして成立すること。OGP画像は本文と同等に重要な成果物。
5. **脱・量産AIサイト** — テンプレ的なSaaSランディング風UIは全面禁止。§5のデザインシステム（校正・朱入れメタファー）に従う。

### 決定済みの製品判断（ユーザー承認済み・変更には確認必要）

| 論点 | 決定 |
|---|---|
| 投稿形式 | テンプレ型（Before→After）＋ 自由記述型（フレームワーク紹介）の2タイプ併用 |
| 認証 | 匿名投稿も許可（Supabase匿名認証で実現） |
| 初期戦略 | UGC一本勝負がコンテンツの主軸。ただし運営アカウントは `is_official` バッジで区別表示する |
| リアクション | 1種類のみ。**言葉でラベリングしない**（ハート等の無言アイコン1つ。感情の解像度はコメントで補う） |
| コメント | あり（Xのリプ相当・1階層のみ、返信のネストなし）。MVPに含む |

---

## 2. 機能仕様

### 2.1 MVP（Phase 1）に含むもの

- **投稿**（2タイプ）
  - `reframe` 型: Before（〜120字）→ After（〜120字）＋ 解説（任意・〜2000字）
  - `frame` 型: タイトル（〜60字）＋ 本文（〜2000字）。イーロンマスクの思考法紹介のような自由記述
  - カテゴリ1つ必須（固定リスト: 仕事・キャリア / 人間関係 / お金 / 失敗・挑戦 / 生き方 / 学び・思考法）
  - 匿名投稿時の表示名は「名も無き視点」固定
- **公式バッジ**: 運営アカウントの `profiles.is_official = true` を投稿者名の横に表示（アプリからは設定不可。Supabase Studio で運営が手動フラグ立てする運用）
- **リアクション**: ハートアイコン1種、文言ラベルなし。トグル式（付け外し可）。1ユーザー1投稿1回
- **コメント**: 投稿1件につき1階層のフラットなコメント欄（返信への返信＝ネストはしない）。匿名投稿可。文字数上限あり
- **フィード**: 「急上昇」（ホットスコア順）/「新着」/「殿堂」（歴代リアクション数順）の3タブ ＋ カテゴリ絞り込み
- **投稿詳細ページ** `/r/[id]`: シェアの着地点。OGP画像自動生成。コメント一覧＋投稿フォーム
- **Xシェア**: intent リンク（本文プリセット済み）＋ URLコピー
- **匿名→本登録の昇格**: X / Google ログインで匿名アカウントを引き継ぎ（`linkIdentity`）
- **ユーザーページ** `/u/[handle]`: 本登録ユーザーのみ。投稿一覧
- **通報**: 各投稿・各コメントに通報ボタン。閾値超えで自動非表示
- **Aboutページ**: 世界観の説明（「呪いを解く」マニフェスト）

### 2.2 MVPに含まないもの（Phase 2 以降）

- コメントへの返信（ネスト化）
- フォロー / 通知
- 検索（Phase 2 で Postgres 全文検索 or pg_trgm）
- 週間ランキングの自動X投稿ボット
- 管理画面（MVP期は Supabase Studio で直接運用）
- 多言語対応

### 2.3 投稿のライフサイクル

```
published（公開）──通報が閾値(5件)到達──▶ hidden（自動非表示・運営確認待ち）
      │                                        │
      └── 作者が削除 ──▶ removed             運営が Studio で published に戻す or removed
```

論理削除のみ。物理削除はしない（status カラムで管理）。

---

## 3. 技術選定

| レイヤ | 採用 | 理由 |
|---|---|---|
| フレームワーク | **Next.js 15（App Router）+ TypeScript** | Vercel 最適・RSC でフィードを高速化・OGP画像生成が標準機能 |
| スタイリング | **Tailwind CSS v4** | デザイントークンをCSS変数で一元管理しやすい |
| DB / 認証 | **Supabase**（Postgres + Auth + RLS） | 匿名認証 → ソーシャル昇格が標準サポート |
| Supabase SDK | `@supabase/supabase-js` + `@supabase/ssr` | App Router での cookie ベースセッション管理 |
| OGP画像 | **next/og**（ImageResponse, Edge） | 投稿ごとの Before→After カードを動的生成 |
| アイコン | **Lucide React** | 絵文字禁止ルールに準拠 |
| フォント | `next/font/google`: **Shippori Mincho**（明朝）+ **Zen Kaku Gothic New**（ゴシック） | §5 のタイポグラフィ設計に必須 |
| ホスティング | Vercel（GitHub 連携で自動デプロイ） | 指定インフラ |
| フォーム検証 | **Zod**（クライアント＋サーバー両方） | 境界での入力検証 |

**追加ライブラリはこれ以外入れない**（状態管理ライブラリ不要。サーバー状態は RSC + Server Actions で完結させる）。

### 環境変数

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=   # サーバー専用。クライアントに漏らさない
NEXT_PUBLIC_SITE_URL=        # 例: https://reframe.example.com（OGP絶対URL用）
```

---

## 4. 画面設計

### 4.1 ルーティング

| パス | 内容 | レンダリング |
|---|---|---|
| `/` | フィード（急上昇/新着/殿堂タブ、カテゴリフィルタ） | RSC + searchParams（`?tab=hot&cat=work`）。URLが状態 |
| `/r/[id]` | 投稿詳細。シェア着地点 | RSC。`generateMetadata` で OGP |
| `/r/[id]/opengraph-image` | 動的OGP画像 | Edge / ImageResponse |
| `/post` | 投稿フォーム（タイプ選択→入力→プレビュー） | Client Component |
| `/u/[handle]` | ユーザーページ | RSC |
| `/about` | マニフェスト | 静的 |
| `/settings` | 表示名・アカウント昇格 | Client |

### 4.2 主要画面の要素

**トップ `/`**
- ヒーロー: 初訪問者向けの1画面。サイトの代表的リフレームを1つ、§5の「朱入れアニメーション」付きで見せる（説明文より実物で世界観を伝える）。2回目以降はフィード直行で邪魔しない（localStorage フラグ）
- フィード: 1カラム、カード型。無限スクロールは MVP では不要（「もっと見る」ボタンでページング、`?page=`）
- 右下固定の投稿ボタン（モバイルは FAB）

**投稿カード（フィード内・共通コンポーネント）**
- `reframe` 型: Before テキスト（明朝・グレー・朱の取り消し線）→ 縦方向の矢印/朱記号 → After テキスト（ゴシック太字・墨色）
- `frame` 型: タイトル（ゴシック太字）＋ 本文冒頭3行
- 下部: カテゴリチップ / 投稿者名（`is_official` なら名前の右に公式バッジ） / 相対時刻 / リアクションボタン＋数 / コメント数アイコン＋数 / シェア
- カード全体クリックで詳細へ（コメント数タップで詳細ページのコメント欄に直接ジャンプ）

**投稿詳細 `/r/[id]`**
- カードの拡大版 ＋ 解説全文
- シェアセクション: 「Xでシェア」「URLコピー」を目立たせる（このページの主目的）
- コメントセクション（本文下）: 投稿フォーム（匿名可）＋ 新着順の一覧。各コメントに投稿者名・相対時刻・通報ボタン
- 同カテゴリの「急上昇」を下部に3件（回遊）

**投稿フォーム `/post`**
- Step 1: タイプ選択（「常識をひっくり返す」= reframe / 「思考法を紹介する」= frame）
- Step 2: 入力。文字数カウンタをリアルタイム表示。reframe 型は Before/After を実際のカードと同じ見た目でライブプレビュー
- Step 3: カテゴリ選択 → 投稿
- 匿名セッションはページ到達時に自動確立（ユーザーには何も求めない）。投稿後に一度だけ「アカウント登録すると投稿を管理できます」を控えめに提示

### 4.3 シェア設計（バズの生命線）

**X intent の本文テンプレート**（`reframe` 型）:

```
「{before}」

　→「{after}」

#Reframe
{site_url}/r/{id}
```

`frame` 型は `{title}` ＋ URL。文字数超過時は before/after を末尾省略（…）してURLを優先。

**OGP画像（1200×630）**: §5 のデザイン言語で描く。
- 上半分: Before テキスト（明朝・薄墨色）に朱色の取り消し線
- 中央: 朱色の校正記号風の矢印
- 下半分: After テキスト（ゴシック太字・大きく）
- 右下: ロゴ「Reframe」＋ ドメイン
- 実装注意: ImageResponse（satori）は日本語フォントの埋め込みが必要。Noto Sans JP / Noto Serif JP の **サブセット済み woff/ttf を `src/assets/fonts/` に同梱**し `fetch` せずローカル読み込みする（Edge の fetch サイズ制限とレイテンシ回避）。太さは各1ウェイトに絞る

---

## 5. デザインシステム — 「朱入れ」

### コンセプト

**編集者が原稿に朱を入れるように、世間の常識に朱を入れる。**
校正・活版印刷のビジュアル言語をサイト全体のメタファーにする。取り消し線・校正記号・朱色がブランドモチーフ。量産AIサイト風（グラデーション紫、ガラスモーフィズム、絵文字、テンプレheroレイアウト）は全面禁止。

### デザイントークン（`src/styles/tokens.css`）

```css
:root {
  /* 紙と墨と朱。色数はこの3系統で完結させる */
  --color-paper:   oklch(96.5% 0.008 90);   /* 生成りの紙 */
  --color-ink:     oklch(22% 0.01 270);      /* 墨 */
  --color-ink-faded: oklch(55% 0.01 270);    /* 薄墨（Before用） */
  --color-vermilion: oklch(58% 0.21 30);     /* 朱（アクセント・リアクション・取り消し線） */
  --color-line:    oklch(85% 0.01 90);       /* 罫線 */

  --font-mincho: var(--font-shippori), serif;      /* Before・引用・見出しアクセント */
  --font-gothic: var(--font-zen-kaku), sans-serif; /* After・本文・UI */

  --text-base: clamp(1rem, 0.95rem + 0.3vw, 1.0625rem);
  --text-card-before: clamp(1rem, 0.9rem + 0.5vw, 1.25rem);
  --text-card-after: clamp(1.25rem, 1.1rem + 0.9vw, 1.75rem);

  --space-section: clamp(3rem, 2rem + 4vw, 6rem);
  --duration-strike: 600ms;                  /* 朱入れアニメーション */
  --ease-brush: cubic-bezier(0.22, 1, 0.36, 1);
}
```

### ビジュアルルール

1. **Before は明朝・薄墨、After はゴシック太字・墨**。書体のコントラスト自体が「古い世界→新しい世界」を語る
2. **朱の取り消し線**: カードがビューポートに入ったら Before に左→右へ線が引かれるアニメーション（`clip-path` か `transform: scaleX` で compositor-friendly に。`prefers-reduced-motion` では即時表示）
3. リアクションボタンは朱色のハートアイコン（Lucide `heart`）。文言ラベルは付けない — 感情の名付けはユーザーに委ねず、ニュアンスはコメントで表現してもらう設計。押下時は輪郭のみ→朱で塗りつぶしへのトランジション（スタンプを押す動き）
4. 公式バッジは朱色の小さな印章（判子）風アイコン。金バッジや✓チェックマークのような「量産SaaS認証済み」感を出さず、校正メタファーに寄せる（例: 朱肉の丸印にシンプルな文字）
5. コメントは吹き出しではなく、罫線区切りの短冊状リスト（投稿カードと同じ組版言語で統一。チャットUI風の丸バブルは使わない）
6. 背景は紙色一色。カードは紙の上に**罫線1本区切り**（影・角丸カード乱立を避け、印刷物の組版らしく）
7. 絵文字は UI・OGP画像とも一切使わない
8. モバイルファースト。カード型UIは375px幅で崩れないことを常に確認

---

## 6. フォルダ構成

```
reframe/
├── docs/
│   └── DESIGN.md                  # 本書
├── supabase/
│   └── migrations/
│       └── 0001_init.sql          # §7 のSQL
├── public/
├── src/
│   ├── app/
│   │   ├── layout.tsx             # フォント読込・共通ヘッダー/フッター
│   │   ├── page.tsx               # フィード
│   │   ├── about/page.tsx
│   │   ├── post/page.tsx
│   │   ├── settings/page.tsx
│   │   ├── u/[handle]/page.tsx
│   │   ├── r/[id]/
│   │   │   ├── page.tsx
│   │   │   └── opengraph-image.tsx
│   │   └── auth/callback/route.ts # OAuth コールバック
│   ├── components/
│   │   ├── post-card/             # PostCard.tsx, StrikeThrough.tsx, ReactionButton.tsx, ShareButtons.tsx, OfficialBadge.tsx
│   │   ├── comments/               # CommentList.tsx, CommentForm.tsx, CommentItem.tsx
│   │   ├── feed/                  # FeedTabs.tsx, CategoryFilter.tsx, LoadMore.tsx
│   │   ├── post-form/             # PostForm.tsx, TypeSelector.tsx, LivePreview.tsx
│   │   └── ui/                    # Button.tsx, Chip.tsx, TextArea.tsx（汎用のみ）
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts          # ブラウザ用（匿名セッション自動確立を含む）
│   │   │   ├── server.ts          # RSC/Server Action 用（@supabase/ssr）
│   │   │   └── middleware.ts      # セッションリフレッシュ
│   │   ├── actions/               # Server Actions: posts.ts, reactions.ts, comments.ts, reports.ts, profile.ts
│   │   ├── validation.ts          # Zod スキーマ（文字数上限は §7 と一致させる）
│   │   ├── share.ts               # Xシェアテキスト組み立て
│   │   └── constants.ts           # カテゴリ定義・上限値（コメント500字等）
│   ├── assets/fonts/              # OGP用サブセットフォント
│   └── styles/
│       ├── tokens.css
│       └── globals.css
├── middleware.ts                   # Supabase セッション + IPレート制限
└── .env.local
```

---

## 7. DB設計（Supabase / Postgres）

そのまま `supabase/migrations/0001_init.sql` に使える形で記す。

```sql
-- ============================================================
-- Reframe 初期スキーマ
-- 前提: Supabase Auth の匿名サインインを有効化すること
--   (Dashboard > Authentication > Sign In / Up > Anonymous Sign-ins: ON)
--   X(Twitter) / Google プロバイダも有効化
-- ============================================================

-- ---------- profiles ----------
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  handle        text unique,                 -- 本登録時に設定。匿名中は null
  display_name  text not null default '名も無き視点',
  avatar_url    text,
  is_anonymous  boolean not null default true,
  is_official   boolean not null default false,  -- 公式バッジ。Studio / service role からのみ変更可（下部の column privilege 参照）
  created_at    timestamptz not null default now()
);

-- auth.users 作成時に自動で profile を生やす
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, is_anonymous)
  values (new.id, coalesce(new.is_anonymous, true));
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 匿名→本登録昇格時に is_anonymous を同期
create or replace function public.handle_user_updated()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.profiles
     set is_anonymous = coalesce(new.is_anonymous, false)
   where id = new.id;
  return new;
end $$;

create trigger on_auth_user_updated
  after update on auth.users
  for each row when (old.is_anonymous is distinct from new.is_anonymous)
  execute function public.handle_user_updated();

-- ---------- posts ----------
create type public.post_type as enum ('reframe', 'frame');
create type public.post_status as enum ('published', 'hidden', 'removed');

create table public.posts (
  id             uuid primary key default gen_random_uuid(),
  author_id      uuid not null references public.profiles(id),
  type           public.post_type not null,
  -- reframe 型
  before_text    text check (char_length(before_text) <= 120),
  after_text     text check (char_length(after_text) <= 120),
  -- frame 型
  title          text check (char_length(title) <= 60),
  -- 共通（reframe では任意の解説、frame では本文=必須）
  body           text check (char_length(body) <= 2000),
  category       text not null check (category in
                   ('work','relationship','money','challenge','life','learning')),
  status         public.post_status not null default 'published',
  reaction_count integer not null default 0,
  comment_count  integer not null default 0,
  report_count   integer not null default 0,
  created_at     timestamptz not null default now(),
  -- 型ごとの必須フィールド整合性
  constraint reframe_fields check (
    (type = 'reframe' and before_text is not null and after_text is not null and title is null)
    or
    (type = 'frame' and title is not null and body is not null
       and before_text is null and after_text is null)
  )
);

create index posts_feed_idx    on public.posts (status, created_at desc);
create index posts_cat_idx     on public.posts (status, category, created_at desc);
create index posts_author_idx  on public.posts (author_id, created_at desc);
create index posts_top_idx     on public.posts (status, reaction_count desc);

-- ---------- reactions ----------
create table public.reactions (
  post_id    uuid not null references public.posts(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)              -- 1ユーザー1投稿1回を構造で保証
);

create or replace function public.sync_reaction_count()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    update public.posts set reaction_count = reaction_count + 1 where id = new.post_id;
  elsif tg_op = 'DELETE' then
    update public.posts set reaction_count = greatest(reaction_count - 1, 0) where id = old.post_id;
  end if;
  return null;
end $$;

create trigger on_reaction_change
  after insert or delete on public.reactions
  for each row execute function public.sync_reaction_count();

-- ---------- comments ----------
-- 1階層のみ（Xのリプ相当）。返信への返信はスキーマ上サポートしない
create table public.comments (
  id           uuid primary key default gen_random_uuid(),
  post_id      uuid not null references public.posts(id) on delete cascade,
  author_id    uuid not null references public.profiles(id),
  body         text not null check (char_length(body) between 1 and 500),
  status       public.post_status not null default 'published', -- posts と同じ状態遷移を流用
  report_count integer not null default 0,
  created_at   timestamptz not null default now()
);

create index comments_post_idx   on public.comments (post_id, created_at asc);
create index comments_author_idx on public.comments (author_id, created_at desc);

-- posts.comment_count を同期（コメントは論理削除のみ・物理削除しないため INSERT/UPDATE で追従）
create or replace function public.sync_comment_count()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' and new.status = 'published' then
    update public.posts set comment_count = comment_count + 1 where id = new.post_id;
  elsif tg_op = 'UPDATE' and old.status = 'published' and new.status <> 'published' then
    update public.posts set comment_count = greatest(comment_count - 1, 0) where id = new.post_id;
  elsif tg_op = 'UPDATE' and old.status <> 'published' and new.status = 'published' then
    update public.posts set comment_count = comment_count + 1 where id = new.post_id;
  end if;
  return null;
end $$;

create trigger on_comment_change
  after insert or update on public.comments
  for each row execute function public.sync_comment_count();

-- コメントのレート制限（投稿より緩め）
create or replace function public.check_comment_rate_limit()
returns trigger language plpgsql security definer set search_path = public as $$
declare recent_count int; last_comment timestamptz;
begin
  select count(*), max(created_at) into recent_count, last_comment
    from public.comments
   where author_id = new.author_id and created_at > now() - interval '24 hours';
  if recent_count >= 50 then
    raise exception 'RATE_LIMIT_DAILY';        -- 1日50件まで
  end if;
  if last_comment is not null and last_comment > now() - interval '5 seconds' then
    raise exception 'RATE_LIMIT_INTERVAL';     -- 投稿間隔5秒
  end if;
  return new;
end $$;

create trigger before_comment_insert
  before insert on public.comments
  for each row execute function public.check_comment_rate_limit();

-- コメント通報（投稿の reports とは別テーブル。対象が異なるため FK を分けて素直に持つ）
create table public.comment_reports (
  id          uuid primary key default gen_random_uuid(),
  comment_id  uuid not null references public.comments(id) on delete cascade,
  reporter_id uuid not null references public.profiles(id),
  reason      text not null check (reason in ('spam','abuse','offtopic','other')),
  created_at  timestamptz not null default now(),
  unique (comment_id, reporter_id)
);

create or replace function public.sync_comment_report_count()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.comments set report_count = report_count + 1 where id = new.comment_id;
  update public.comments set status = 'hidden'
   where id = new.comment_id and report_count >= 5 and status = 'published';
  return null;
end $$;

create trigger on_comment_report_created
  after insert on public.comment_reports
  for each row execute function public.sync_comment_report_count();

-- ---------- reports ----------
create table public.reports (
  id          uuid primary key default gen_random_uuid(),
  post_id     uuid not null references public.posts(id) on delete cascade,
  reporter_id uuid not null references public.profiles(id),
  reason      text not null check (reason in ('spam','abuse','offtopic','other')),
  created_at  timestamptz not null default now(),
  unique (post_id, reporter_id)                -- 同一人物の連続通報を防止
);

create or replace function public.sync_report_count()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.posts set report_count = report_count + 1 where id = new.post_id;
  -- 通報5件で自動非表示（運営が Studio で確認して戻す）
  update public.posts set status = 'hidden'
   where id = new.post_id and report_count >= 5 and status = 'published';
  return null;
end $$;

create trigger on_report_created
  after insert on public.reports
  for each row execute function public.sync_report_count();

-- ---------- 投稿レート制限（匿名投稿対策の第1層） ----------
create or replace function public.check_post_rate_limit()
returns trigger language plpgsql security definer set search_path = public as $$
declare recent_count int; last_post timestamptz;
begin
  select count(*), max(created_at) into recent_count, last_post
    from public.posts
   where author_id = new.author_id and created_at > now() - interval '24 hours';
  if recent_count >= 10 then
    raise exception 'RATE_LIMIT_DAILY';        -- 1日10件まで
  end if;
  if last_post is not null and last_post > now() - interval '60 seconds' then
    raise exception 'RATE_LIMIT_INTERVAL';     -- 投稿間隔60秒
  end if;
  return new;
end $$;

create trigger before_post_insert
  before insert on public.posts
  for each row execute function public.check_post_rate_limit();

-- ---------- ホットスコア（急上昇フィード） ----------
-- HN方式: score = reactions / (経過時間h + 2)^1.5
create or replace function public.hot_posts(
  p_category text default null,
  p_limit int default 20,
  p_offset int default 0
) returns setof public.posts
language sql stable set search_path = public as $$
  select * from public.posts
   where status = 'published'
     and created_at > now() - interval '14 days'   -- 走査範囲を限定
     and (p_category is null or category = p_category)
   order by reaction_count / power(extract(epoch from now() - created_at) / 3600 + 2, 1.5) desc,
            created_at desc
   limit p_limit offset p_offset;
$$;

-- ---------- RLS ----------
alter table public.profiles       enable row level security;
alter table public.posts          enable row level security;
alter table public.reactions      enable row level security;
alter table public.comments       enable row level security;
alter table public.comment_reports enable row level security;
alter table public.reports        enable row level security;

-- profiles: 全員読める / 本人のみ更新
create policy "profiles_select" on public.profiles for select using (true);
create policy "profiles_update" on public.profiles for update
  using (auth.uid() = id) with check (auth.uid() = id);

-- 重要: 上のポリシーだけでは「本人が自分の is_official を true に書き換える」自己昇格を
-- 防げない（RLS の using/check は行単位でカラム単位の制御はできないため）。
-- カラム権限で is_official を authenticated ロールの UPDATE 対象から明示的に外す。
revoke update on public.profiles from authenticated;
grant update (handle, display_name, avatar_url) on public.profiles to authenticated;
-- is_official は service role（Supabase Studio の SQL Editor 等）からのみ変更する運用

-- posts: published は全員 / 自分の投稿は status 問わず読める
create policy "posts_select" on public.posts for select
  using (status = 'published' or author_id = auth.uid());
create policy "posts_insert" on public.posts for insert
  with check (auth.uid() = author_id);
-- 更新は本人のみ。かつ status は published→removed（自己削除）方向のみ許可
create policy "posts_update" on public.posts for update
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id and status in ('published','removed'));

-- reactions: 全員読める / 本人分のみ付け外し
create policy "reactions_select" on public.reactions for select using (true);
create policy "reactions_insert" on public.reactions for insert
  with check (auth.uid() = user_id);
create policy "reactions_delete" on public.reactions for delete
  using (auth.uid() = user_id);

-- comments: published は全員 / 自分のコメントは status 問わず読める
create policy "comments_select" on public.comments for select
  using (status = 'published' or author_id = auth.uid());
create policy "comments_insert" on public.comments for insert
  with check (auth.uid() = author_id);
-- 更新は本人のみ・自己削除（removed）方向のみ許可。本文編集は不可（削除して投稿し直す運用）
create policy "comments_update" on public.comments for update
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id and status = 'removed');

-- comment_reports: 挿入のみ
create policy "comment_reports_insert" on public.comment_reports for insert
  with check (auth.uid() = reporter_id);

-- reports: 挿入のみ（読み取りは運営が Studio で）
create policy "reports_insert" on public.reports for insert
  with check (auth.uid() = reporter_id);
```

### 設計上の注意（実装者向け）

- **reaction_count / comment_count / report_count は非正規化カラム**。整合性はトリガーで担保しており、アプリ側から直接 update しない
- **posts の update ポリシー**は本文編集も許すが、UIでは「削除のみ」提供で開始してよい（編集は Phase 2）。**comments の update ポリシーは削除（`status='removed'`）のみ**に絞っており、本文編集自体を許さない
- **`is_official` はアプリの Server Action から絶対に更新できない**（column privilege で `authenticated` ロールから UPDATE 権限を剥奪済み）。公式アカウントの認定は運営が Supabase Studio の SQL Editor から `update profiles set is_official = true where handle = '...'` を直接実行する運用。管理画面は作らない
- 匿名ユーザーの `auth.users` 行は溜まり続けるが、MVP では放置で問題ない（Supabase 側で定期クリーンアップは Phase 2）
- クライアントからの書き込みはすべて **Server Actions 経由**にし、Zod でバリデーションしてから Supabase に投げる（RLS は最後の砦であり第1の防御はサーバー側検証）

---

## 8. 認証・スパム対策の全体像

### 匿名認証フロー

```
初訪問 ──▶ セッションなし ──▶ 閲覧は普通に可能（認証不要）
投稿/リアクション操作時 ──▶ セッション無ければ supabase.auth.signInAnonymously() を裏で実行
                              （ユーザーには何も見せない・求めない）
「アカウント登録」選択時 ──▶ linkIdentity({ provider: 'twitter' | 'google' })
                              匿名時代の投稿・リアクションがそのまま引き継がれる
                              ──▶ /settings で handle と display_name を設定
```

- 匿名セッションは localStorage 保持。ブラウザを変えると別人になる（許容する仕様）
- `signInAnonymously` は**操作時に遅延実行**（ページロード時に全訪問者へ発行するとユーザー数が汚れる）

### スパム対策（多層防御）

| 層 | 対策 | 実装場所 |
|---|---|---|
| 1 | 投稿レート制限（10件/日・間隔60秒）／コメントレート制限（50件/日・間隔5秒） | DBトリガー（§7） |
| 2 | IPベースのAPI叩きすぎ防止 | `middleware.ts`（Vercel、簡易メモリ or upstash不使用の軽量実装で可） |
| 3 | Zod による文字数・形式検証 | Server Actions |
| 4 | 投稿・コメントとも通報5件で自動 hidden | DBトリガー（§7） |
| 5 | Supabase Auth の匿名サインインレート制限 | Supabase 標準（IP毎に制限あり・設定確認） |

NGワードフィルタは MVP では入れない（通報運用で回す。過剰実装しない）。

---

## 9. データアクセス設計

- **読み取り**: RSC から `server.ts` の Supabase クライアントで直接クエリ。フィードは `hot_posts()` RPC / 新着・殿堂は通常 select。`revalidate = 60`（フィードは1分キャッシュで十分）
- **書き込み**: すべて Server Actions（`lib/actions/*.ts`）。処理の型:
  1. Zod でパース（失敗なら即エラー返却）
  2. セッション取得（無ければ匿名サインインをクライアント側で済ませてから呼ぶ）
  3. Supabase へ insert / delete
  4. `revalidatePath` で該当ページ再検証
- **リアクション・コメント投稿は楽観的更新**: クライアントで即反映（カウント±1 / リストへ追加）→ Server Action → 失敗時ロールバック＋トースト
- エラーメッセージは日本語でユーザーフレンドリーに（`RATE_LIMIT_DAILY` → 「投稿は1日10件までです」等のマッピングを `constants.ts` に）

---

## 10. 実装フェーズ（Sonnet 向けタスク分解）

各マイルストーンは独立して動作確認可能。**M1→M6 の順に実装し、各完了時に `tsc --noEmit` を通し、commit → push すること。**

- **M1: 土台** — Next.js 15 + Tailwind v4 + フォント + tokens.css + 共通レイアウト（ヘッダー/フッター）。Supabase プロジェクト接続、`0001_init.sql` 適用、client/server/middleware の3クライアント整備
- **M2: 投稿と表示** — PostForm（2タイプ・ライブプレビュー・匿名自動サインイン）、Server Action `createPost`、PostCard（`is_official` バッジ表示含む）、フィード3タブ＋カテゴリフィルタ、`/r/[id]` 詳細
- **M3: リアクション・コメント・朱入れ** — ReactionButton（楽観的更新・ハートアイコン）、CommentList/CommentForm（Server Action `createComment`）、取り消し線アニメーション（IntersectionObserver + prefers-reduced-motion 対応）
- **M4: シェア** — opengraph-image.tsx（サブセットフォント同梱）、Xシェア intent、URLコピー、generateMetadata
- **M5: アカウント** — linkIdentity（X/Google）、/settings、/u/[handle]、自己削除
- **M6: 仕上げ** — 投稿・コメントの通報UI、About/マニフェストページ、ヒーロー、404/エラーページ、モバイル最終確認、Vercel デプロイ

### 検証方針（コスト配慮・Windows環境）

- 型: `tsc --noEmit` を各マイルストーンで必須
- UI確認: `preview_inspect`（CSS実測）/ `preview_snapshot`（構造）を使用。**`preview_screenshot` はタイムアウトするため使用しない**
- OGP画像: ローカルで `/r/[id]/opengraph-image` を直接開いて確認

---

## 11. 運用メモ（人間側の作業）

実装前にユーザー（taiyu）側で必要な作業:

1. Supabase プロジェクト作成 → URL / anon key / service role key を `.env.local` へ
2. Supabase Dashboard: Anonymous Sign-ins を ON
3. X Developer Portal / Google Cloud Console で OAuth アプリ作成 → Supabase の Auth Provider に設定（**M5 まで不要。M1〜M4 は匿名認証のみで進められる**）
4. GitHub リポジトリ作成 → Vercel 連携
5. ドメイン決定（OGP・シェアURLに影響。未定なら `*.vercel.app` で開始可）
