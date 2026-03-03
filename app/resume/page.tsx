export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { Printer } from "lucide-react";
import { Container } from "@/components/layout";
import { MdxContent } from "@/components/mdx/MdxContent";
import { getResume } from "@/lib/data/resume";
import { PrintButton } from "./PrintButton";

export const metadata: Metadata = {
  title: "Resume",
  description: "Professional experience, skills, and education.",
};

export default async function ResumePage() {
  const resume = await getResume();

  return (
    <Container className="py-16">
      <div className="mb-10 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
            Resume
          </h1>
          <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400">
            My professional experience, skills, and education.
          </p>
        </div>
        <PrintButton />
      </div>

      <div className="resume-content mx-auto max-w-3xl rounded-xl border border-neutral-200 bg-white p-8 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 sm:p-12 print:border-0 print:shadow-none print:p-0">
        {resume ? (
          <MdxContent source={resume.content} />
        ) : (
          <p className="text-neutral-500 dark:text-neutral-400">
            Resume content will be available soon.
          </p>
        )}
      </div>
    </Container>
  );
}
