export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { Container } from "@/components/layout";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { getProjects } from "@/lib/data/projects";

export const metadata: Metadata = {
  title: "Projects",
  description: "A collection of projects and open source work.",
};

export default async function ProjectsPage() {
  const projects = await getProjects();
  const featured = projects.filter((p) => p.featured);
  const other = projects.filter((p) => !p.featured);

  return (
    <Container className="py-16">
      <div className="mb-12">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
          Projects
        </h1>
        <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400">
          A selection of projects I have built, from open source libraries to
          full production applications.
        </p>
      </div>

      {featured.length > 0 && (
        <div className="mb-12">
          <h2 className="mb-6 text-lg font-semibold text-neutral-900 dark:text-white">
            Featured
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {featured.map((project) => (
              <ProjectCard key={project.id} project={project} featured />
            ))}
          </div>
        </div>
      )}

      {other.length > 0 && (
        <div>
          {featured.length > 0 && (
            <h2 className="mb-6 text-lg font-semibold text-neutral-900 dark:text-white">
              More Projects
            </h2>
          )}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {other.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      )}

      {projects.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-neutral-500 dark:text-neutral-400">
            No projects yet. Check back soon.
          </p>
        </div>
      )}
    </Container>
  );
}
