import { Container } from "@/components/layout";

export default function BlogLoading() {
  return (
    <Container className="py-16">
      <div className="animate-pulse">
        <div className="mb-8">
          <div className="h-10 w-32 rounded bg-neutral-200 dark:bg-neutral-800" />
          <div className="mt-4 h-5 w-80 rounded bg-neutral-200 dark:bg-neutral-800" />
        </div>
        <div className="mb-10 flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-8 w-20 rounded-full bg-neutral-200 dark:bg-neutral-800" />
          ))}
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-56 rounded-xl border border-neutral-200 dark:border-neutral-800"
            />
          ))}
        </div>
      </div>
    </Container>
  );
}
