import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PostForm } from "@/components/admin/PostForm";

interface EditPostPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id } = await params;

  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      tags: { select: { id: true, name: true, slug: true } },
    },
  });

  if (!post) notFound();

  return (
    <PostForm
      mode="edit"
      initialData={{
        id: post.id,
        title: post.title,
        content: post.content,
        excerpt: post.excerpt ?? "",
        coverImage: post.coverImage ?? "",
        published: post.published,
        tagIds: post.tags.map((t) => t.id),
      }}
    />
  );
}
