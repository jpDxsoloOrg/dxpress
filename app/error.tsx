"use client";

import { Container } from "@/components/layout";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <h1 className="text-4xl font-bold text-neutral-900 dark:text-white">
        Something went wrong
      </h1>
      <p className="mt-2 text-neutral-500 dark:text-neutral-400">
        An unexpected error occurred. Please try again.
      </p>
      <button
        onClick={reset}
        className="mt-8 inline-flex items-center rounded-lg bg-accent-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-700"
      >
        Try Again
      </button>
    </Container>
  );
}
