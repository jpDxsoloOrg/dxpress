import Link from "next/link";
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  href?: string;
  variant?: "default" | "accent" | "outline";
  className?: string;
}

export function Badge({
  children,
  href,
  variant = "default",
  className,
}: BadgeProps) {
  const baseClasses =
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors";

  const variants = {
    default:
      "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
    accent:
      "bg-accent-50 text-accent-700 dark:bg-accent-950 dark:text-accent-300",
    outline:
      "border border-neutral-200 text-neutral-600 dark:border-neutral-700 dark:text-neutral-400",
  };

  const classes = cn(baseClasses, variants[variant], className);

  if (href) {
    return (
      <Link href={href} className={cn(classes, "hover:opacity-80")}>
        {children}
      </Link>
    );
  }

  return <span className={classes}>{children}</span>;
}
