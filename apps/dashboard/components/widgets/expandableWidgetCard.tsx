"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import { ReactNode, useEffect, useId } from "react";
import { useQueryState } from "nuqs";

type ExpandableWidgetCardProps = {
  title?: string | null;
  description?: string | null;
  children: ReactNode;
  widgetQueryKey?: string;
  onExpandedChange?: (expanded: boolean) => void;
  collapsedContentClassName?: string;
  expandedContentClassName?: string;
  openOnCardClick?: boolean;
  className?: string;
};

const springTransition = {
  type: "spring" as const,
  stiffness: 400,
  damping: 25,
  mass: 0.8,
};

const ExpandableWidgetCard = ({
  title,
  description,
  children,
  widgetQueryKey,
  onExpandedChange,
  collapsedContentClassName,
  expandedContentClassName,
  openOnCardClick = false,
  className,
}: ExpandableWidgetCardProps) => {
  const [openWidget, setOpenWidget] = useQueryState("widget", {
    history: "push",
  });
  const id = useId();

  const defaultWidgetKey = title
    ? title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
    : `widget-${id}`;
  const resolvedWidgetKey = widgetQueryKey ?? defaultWidgetKey;
  const active = openWidget === resolvedWidgetKey;

  const headerId = `header-${resolvedWidgetKey}-${id}`;
  const cardId = `card-${resolvedWidgetKey}-${id}`;
  const contentId = `content-${resolvedWidgetKey}-${id}`;
  const buttonId = `button-${resolvedWidgetKey}-${id}`;

  useEffect(() => {
    onExpandedChange?.(active);
  }, [active, onExpandedChange]);

  useEffect(() => {
    if (!active) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") void setOpenWidget(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active, setOpenWidget]);

  return (
    <>
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-white/50 backdrop-blur-md dark:bg-black/50"
            onClick={() => void setOpenWidget(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {active && (
          <div className="fixed inset-0 z-50 grid place-items-center sm:mt-16">
            <motion.div
              layoutId={cardId}
              transition={springTransition}
              className={cn(
                "relative flex h-full w-full max-w-[calc(100vw-2rem)] flex-col overflow-auto bg-card shadow-sm sm:rounded-t-3xl [-ms-overflow-style:none] [-webkit-overflow-scrolling:touch] [scrollbar-width:none]",
                className,
              )}
            >
              <div className="flex items-start justify-between p-8">
                <motion.div
                  layoutId={headerId}
                  transition={springTransition}
                  className="min-w-0"
                >
                  {title && (
                    <h3 className="text-2xl leading-tight font-semibold">
                      {title}
                    </h3>
                  )}
                  {description && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {description}
                    </p>
                  )}
                </motion.div>

                <motion.button
                  aria-label="Schließen"
                  layoutId={buttonId}
                  onClick={() => void setOpenWidget(null)}
                  transition={springTransition}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                  </svg>
                </motion.button>
              </div>

              <motion.div
                layoutId={contentId}
                transition={springTransition}
                className={cn("flex-1 px-8 pb-10 min-h-0", expandedContentClassName)}
              >
                {children}
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {!active && (
        <motion.div
          layoutId={cardId}
          onClick={openOnCardClick ? () => void setOpenWidget(resolvedWidgetKey) : undefined}
          transition={springTransition}
          className={cn(
            "flex h-full flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-sm transition-shadow",
            openOnCardClick ? "cursor-pointer hover:shadow-md" : "",
            className,
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <motion.div
              layoutId={headerId}
              transition={springTransition}
              className="min-w-0"
            >
              {title && (
                <h3 className="text-base leading-snug font-medium">{title}</h3>
              )}
              {description && (
                <p className="mt-1 text-sm text-muted-foreground">{description}</p>
              )}
            </motion.div>

            <motion.button
              aria-label="Öffnen"
              layoutId={buttonId}
              transition={springTransition}
              onClick={(e) => {
                e.stopPropagation();
                void setOpenWidget(resolvedWidgetKey);
              }}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" /><path d="M12 5v14" />
              </svg>
            </motion.button>
          </div>

          <motion.div
            layoutId={contentId}
            transition={springTransition}
            className={cn("min-h-0", collapsedContentClassName)}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </>
  );
};

export default ExpandableWidgetCard;




