"use client";

import { useEffect, useState } from "react";
import { Container } from "@/components/layout";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [retryCount, setRetryCount] = useState(0);
  const maxAutoRetries = 3;

  useEffect(() => {
    if (retryCount > 0 && retryCount <= maxAutoRetries) {
      const timeout = setTimeout(() => {
        reset();
      }, retryCount * 1500);
      return () => clearTimeout(timeout);
    }
  }, [retryCount, reset]);

  useEffect(() => {
    // Auto-retry once on first load (handles DB cold starts)
    const timeout = setTimeout(() => {
      setRetryCount(1);
    }, 2000);
    return () => clearTimeout(timeout);
  }, []);

  const isRetrying = retryCount > 0 && retryCount <= maxAutoRetries;

  if (isRetrying) {
    return (
      <Container className="flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-300 border-t-accent-600 dark:border-neutral-700 dark:border-t-accent-400" />
        <p className="mt-4 text-neutral-500 dark:text-neutral-400">
          Loading&hellip;
        </p>
      </Container>
    );
  }

  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <h1 className="text-4xl font-bold text-neutral-900 dark:text-white">
        Something went wrong
      </h1>
      <p className="mt-2 text-neutral-500 dark:text-neutral-400">
        An unexpected error occurred. Please try again.
      </p>
      <button
        onClick={() => {
          setRetryCount(1);
          reset();
        }}
        className="mt-8 inline-flex items-center rounded-lg bg-accent-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-700"
      >
        Try Again
      </button>
    </Container>
  );
}
