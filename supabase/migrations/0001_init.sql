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
