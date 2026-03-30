import { ReactNode } from "react";

import { cn } from "@/lib/utils";

type FeatureCardProps = {
  icon: ReactNode;
  title: string;
  description: string;
  className?: string;
};

export function FeatureCard({
  icon,
  title,
  description,
  className,
}: FeatureCardProps) {
  return (
    <article
      className={cn(
        "group border-border/70 bg-card/65 hover:bg-card relative overflow-hidden rounded-2xl border p-6 shadow-sm transition-all duration-300 hover:-translate-y-1",
        className,
      )}
    >
      <div className="pointer-events-none absolute -top-8 right-0 h-24 w-24 rounded-full bg-chart-2/12 blur-2xl" />
      <div className="mb-4 inline-flex size-11 items-center justify-center rounded-xl border border-border/70 bg-background/70 text-chart-2">
        {icon}
      </div>
      <h3 className="font-display mb-2 text-lg leading-tight font-semibold">
        {title}
      </h3>
      <p className="text-muted-foreground text-sm leading-relaxed">
        {description}
      </p>
    </article>
  );
}
