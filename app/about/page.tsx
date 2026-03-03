export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { Github, Linkedin, Twitter, Mail, MapPin, Briefcase } from "lucide-react";
import { Container } from "@/components/layout";
import { Badge } from "@/components/ui/Badge";
import { getSiteConfig } from "@/lib/data/site-config";

export const metadata: Metadata = {
  title: "About",
  description: "Learn more about me, my background, and how to get in touch.",
};

const expertise = [
  {
    category: "Frontend Development",
    skills: [
      "React & Next.js",
      "TypeScript",
      "Tailwind CSS",
      "Performance Optimization",
      "Accessibility",
      "Responsive Design",
    ],
  },
  {
    category: "Backend Development",
    skills: [
      "Node.js & Express",
      "PostgreSQL",
      "REST & GraphQL APIs",
      "Redis & Caching",
      "Microservices",
      "Serverless",
    ],
  },
  {
    category: "DevOps & Tooling",
    skills: [
      "AWS (Lambda, S3, DynamoDB)",
      "Docker & Containers",
      "CI/CD Pipelines",
      "Terraform",
      "Monitoring & Logging",
      "Git Workflow",
    ],
  },
];

export default async function AboutPage() {
  const config = await getSiteConfig();

  const name = config?.ownerName ?? "Developer";
  const title = config?.ownerTitle ?? "Full-Stack Developer";
  const bio =
    config?.ownerBio ??
    "I am a software engineer passionate about building great products. This portfolio showcases my work and writing.";

  const socialLinks = [
    { name: "GitHub", href: config?.githubUrl, icon: Github },
    { name: "LinkedIn", href: config?.linkedinUrl, icon: Linkedin },
    { name: "Twitter", href: config?.twitterUrl, icon: Twitter },
    {
      name: "Email",
      href: config?.email ? `mailto:${config.email}` : null,
      icon: Mail,
    },
  ].filter((link) => link.href);

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    jobTitle: title,
    description: bio,
    url: process.env.NEXTAUTH_URL || "http://localhost:3000",
    ...(config?.githubUrl && { sameAs: [config.githubUrl, config.linkedinUrl, config.twitterUrl].filter(Boolean) }),
  };

  return (
    <Container className="py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      {/* Profile Section */}
      <section className="mb-16">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start">
          {/* Avatar placeholder */}
          <div className="flex h-32 w-32 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-400 to-accent-600 text-4xl font-bold text-white shadow-lg">
            {name.charAt(0)}
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
              {name}
            </h1>
            <p className="mt-1 text-lg font-medium text-accent-600 dark:text-accent-400">
              {title}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-neutral-500 dark:text-neutral-400">
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                United States
              </span>
              <span className="inline-flex items-center gap-1">
                <Briefcase className="h-4 w-4" />
                Open to opportunities
              </span>
            </div>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-neutral-600 dark:text-neutral-400">
              {bio}
            </p>
          </div>
        </div>
      </section>

      {/* Expertise */}
      <section className="mb-16">
        <h2 className="mb-8 text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Skills & Expertise
        </h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {expertise.map((group) => (
            <div
              key={group.category}
              className="rounded-xl border border-neutral-200 p-6 dark:border-neutral-800"
            >
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-accent-600 dark:text-accent-400">
                {group.category}
              </h3>
              <div className="flex flex-wrap gap-2">
                {group.skills.map((skill) => (
                  <Badge key={skill}>{skill}</Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="mb-16">
        <h2 className="mb-8 text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          What I Value
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Clean Code",
              description:
                "I believe in writing code that is readable, maintainable, and well-tested. Good code communicates intent clearly.",
            },
            {
              title: "Continuous Learning",
              description:
                "Technology evolves rapidly. I stay curious, experiment with new tools, and share what I learn through writing.",
            },
            {
              title: "User-First Design",
              description:
                "Every technical decision should ultimately serve the user. Performance, accessibility, and simplicity matter.",
            },
          ].map((value) => (
            <div key={value.title}>
              <h3 className="mb-2 font-semibold text-neutral-900 dark:text-white">
                {value.title}
              </h3>
              <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Connect */}
      <section>
        <h2 className="mb-6 text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Get in Touch
        </h2>
        <p className="mb-6 max-w-lg text-neutral-600 dark:text-neutral-400">
          Whether you have a project in mind, want to collaborate, or just want
          to say hello, I would love to hear from you.
        </p>
        <div className="flex flex-wrap gap-3">
          {socialLinks.map((link) => (
            <a
              key={link.name}
              href={link.href ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 px-4 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:border-accent-300 hover:bg-accent-50 dark:border-neutral-800 dark:text-neutral-300 dark:hover:border-accent-800 dark:hover:bg-accent-950"
            >
              <link.icon className="h-4 w-4" />
              {link.name}
            </a>
          ))}
        </div>
      </section>
    </Container>
  );
}
