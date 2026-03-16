import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";

type Props = {
  title?: string | null;
  description?: string | null;
  children: ReactNode;
  /** Card-Border, -Hintergrund und -Schatten anzeigen (default: true) */
  showCard?: boolean;
  /** Zusätzliche Klassen für das äußere Element */
  className?: string;
  /** Zusätzliche Klassen für den Inhaltsbereich (überschreibt/ergänzt Standard-Padding) */
  contentClassName?: string;
  /** Zusätzliche Klassen für den Titel */
  titleClassName?: string;
};

const ChartWrapper = ({
  title,
  description,
  children,
  showCard = true,
  className,
  contentClassName,
  titleClassName,
}: Props) => {
  const hasHeader = title || description;

  if (!showCard) {
    return (
      <div className={cn("flex h-full flex-col", className)}>
        {hasHeader && (
          <div className="flex flex-col space-y-1.5 p-6 pb-0">
            {title && (
              <p
                className={cn(
                  "font-semibold leading-none tracking-tight",
                  titleClassName,
                )}
              >
                {title}
              </p>
            )}
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        )}
        <div
          className={cn(
            "flex-1",
            hasHeader ? "p-6 pt-0" : "p-6",
            contentClassName,
          )}
        >
          {children}
        </div>
      </div>
    );
  }

  return (
    <Card className={cn("flex h-full flex-col", className)}>
      {hasHeader && (
        <CardHeader>
          {title && <CardTitle className={titleClassName}>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent
        className={cn("flex-1", !hasHeader && "pt-6", contentClassName)}
      >
        {children}
      </CardContent>
    </Card>
  );
};

export default ChartWrapper;
