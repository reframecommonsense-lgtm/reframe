import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { OfficialBadge } from "@/components/post-card/OfficialBadge";
import { StrikeThrough } from "@/components/post-card/StrikeThrough";
import { ReactionButton } from "@/components/post-card/ReactionButton";
import { ShareButtons } from "@/components/post-card/ShareButtons";
import { DeletePostButton } from "@/components/post-card/DeletePostButton";
import { ReportButton } from "@/components/post-card/ReportButton";
import { CommentsSection } from "@/components/comments/CommentsSection";
import { CATEGORIES, ANONYMOUS_DISPLAY_NAME, SITE_URL } from "@/lib/constants";
import { formatRelativeTime } from "@/lib/format";
import { getPostById } from "@/lib/posts";
import { getUserReactedPostIds } from "@/lib/reactions";
import { getCommentsByPostId } from "@/lib/comments";
import { buildShareIntentUrl } from "@/lib/share";
import { getCurrentUserId } from "@/lib/auth";

function categoryLabel(value: string): string {
  return CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

function postSummary(post: Awaited<ReturnType<typeof getPostById>>): string {
  if (!post) return "Reframe";
  return post.type === "reframe"
    ? `${post.before_text} → ${post.after_text}`
    : (post.title ?? "Reframe");
}

interface PostDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PostDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const post = await getPostById(id);
  const title = postSummary(post);
  const pageUrl = `${SITE_URL}/r/${id}`;

  return {
    title: `${title} | Reframe`,
    description: post?.body ?? title,
    openGraph: {
      title,
      description: post?.body ?? title,
      url: pageUrl,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: post?.body ?? title,
    },
  };
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { id } = await params;
  const post = await getPostById(id);

  if (!post) notFound();

  const [reactedIds, comments, currentUserId] = await Promise.all([
    getUserReactedPostIds([post.id]),
    getCommentsByPostId(post.id),
    getCurrentUserId(),
  ]);

  const authorName = post.profiles?.display_name ?? ANONYMOUS_DISPLAY_NAME;

  return (
    <article className="mx-auto max-w-2xl px-4 py-10">
      {post.type === "reframe" ? (
        <div className="flex flex-col gap-4">
          <p className="font-mincho text-2xl text-(--color-ink-faded)">
            <StrikeThrough>{post.before_text}</StrikeThrough>
          </p>
          <p className="font-gothic text-3xl font-bold text-(--color-ink)">
            {post.after_text}
          </p>
        </div>
      ) : (
        <h1 className="font-gothic text-3xl font-bold text-(--color-ink)">
          {post.title}
        </h1>
      )}

      {post.body && (
        <p className="mt-6 whitespace-pre-line text-(length:--text-base) text-(--color-ink)">
          {post.body}
        </p>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-(--color-line) pt-4 text-sm text-(--color-ink-faded)">
        <span className="rounded-full border border-(--color-line) px-2 py-0.5 text-xs">
          {categoryLabel(post.category)}
        </span>
        <span className="inline-flex items-center gap-1">
          {post.profiles?.is_official && <OfficialBadge />}
          {authorName}
        </span>
        <span>{formatRelativeTime(post.created_at)}</span>
        <span className="ml-auto flex items-center gap-4">
          <ReactionButton
            postId={post.id}
            initialCount={post.reaction_count}
            initialReacted={reactedIds.has(post.id)}
          />
          <span className="inline-flex items-center gap-1 text-xs">
            <MessageCircle className="h-4 w-4" />
            {post.comment_count}
          </span>
          <ReportButton target="post" postId={post.id} />
        </span>
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <ShareButtons
          shareIntentUrl={buildShareIntentUrl(post, SITE_URL)}
          pageUrl={`${SITE_URL}/r/${post.id}`}
        />
        {currentUserId === post.author_id && (
          <DeletePostButton postId={post.id} />
        )}
      </div>

      <CommentsSection postId={post.id} initialComments={comments} />
    </article>
  );
}
