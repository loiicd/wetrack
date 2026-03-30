import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: SectionHeadingProps) {
  const centered = align === "center";

  return (
    <div className={cn("space-y-4", centered && "text-center", className)}>
      {eyebrow ? (
        <p className="text-muted-foreground text-xs font-semibold tracking-[0.22em] uppercase">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="font-display text-3xl leading-tight font-semibold md:text-4xl lg:text-5xl">
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            "text-muted-foreground max-w-2xl text-base leading-relaxed md:text-lg",
            centered && "mx-auto",
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
