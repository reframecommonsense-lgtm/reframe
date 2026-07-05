export type PostType = "reframe" | "frame";
export type PostStatus = "published" | "hidden" | "removed";

export interface PostAuthor {
  display_name: string;
  is_official: boolean;
  handle: string | null;
}

export interface PostRow {
  id: string;
  author_id: string;
  type: PostType;
  before_text: string | null;
  after_text: string | null;
  title: string | null;
  body: string | null;
  source_title: string | null;
  source_url: string | null;
  category: string;
  status: PostStatus;
  reaction_count: number;
  comment_count: number;
  report_count: number;
  created_at: string;
}

export interface Post extends PostRow {
  profiles: PostAuthor | null;
}

export interface Comment {
  id: string;
  body: string;
  created_at: string;
  author_display_name: string;
  author_is_official: boolean;
}
