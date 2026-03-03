import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProjectForm } from "@/components/admin/ProjectForm";

export const dynamic = "force-dynamic";

interface EditProjectPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProjectPage({
  params,
}: EditProjectPageProps) {
  const { id } = await params;

  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) notFound();

  return (
    <ProjectForm
      mode="edit"
      initialData={{
        id: project.id,
        title: project.title,
        description: project.description,
        content: project.content,
        coverImage: project.coverImage ?? "",
        githubUrl: project.githubUrl ?? "",
        liveUrl: project.liveUrl ?? "",
        techStack: project.techStack.join(", "),
        featured: project.featured,
        sortOrder: project.sortOrder,
      }}
    />
  );
}
