import { notFound } from "next/navigation";
import { PostForm } from "@/components/post-form/PostForm";
import { getPostById } from "@/lib/posts";
import { getCurrentUserId } from "@/lib/auth";

interface EditPostPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id } = await params;
  const [post, currentUserId] = await Promise.all([
    getPostById(id),
    getCurrentUserId(),
  ]);

  if (!post || post.author_id !== currentUserId) notFound();

  return (
    <PostForm
      editingPost={{
        id: post.id,
        type: post.type,
        beforeText: post.before_text ?? undefined,
        afterText: post.after_text ?? undefined,
        title: post.title ?? undefined,
        body: post.body ?? undefined,
        category: post.category,
        sourceTitle: post.source_title ?? undefined,
        sourceUrl: post.source_url ?? undefined,
      }}
    />
  );
}
