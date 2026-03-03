import { Container } from "@/components/layout";

export default function Loading() {
  return (
    <Container className="py-16">
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-48 rounded bg-neutral-200 dark:bg-neutral-800" />
        <div className="h-4 w-96 rounded bg-neutral-200 dark:bg-neutral-800" />
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-64 rounded-xl border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900"
            />
          ))}
        </div>
      </div>
    </Container>
  );
}
