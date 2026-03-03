import Link from "next/link";
import { Container } from "@/components/layout";

export default function NotFound() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <h1 className="text-6xl font-bold text-neutral-200 dark:text-neutral-800">
        404
      </h1>
      <h2 className="mt-4 text-xl font-semibold text-neutral-900 dark:text-white">
        Page Not Found
      </h2>
      <p className="mt-2 text-neutral-500 dark:text-neutral-400">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center rounded-lg bg-accent-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-700"
      >
        Go Home
      </Link>
    </Container>
  );
}
