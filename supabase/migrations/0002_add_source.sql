-- ============================================================
-- 引用元(出典)フィールドの追加
-- Noteなど他所の記事を要約して投稿する際、出典を明示できるようにする
-- ============================================================

alter table public.posts
  add column source_title text check (char_length(source_title) <= 100),
  add column source_url   text check (source_url is null or source_url ~ '^https?://');
