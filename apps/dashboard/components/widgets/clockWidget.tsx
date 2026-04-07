"use client";

import useClock from "@/hooks/useClock";
import type { TimeZone } from "@/types/timezone";
import NumberFlow from "@number-flow/react";
import ExpandableWidgetCard from "./expandableWidgetCard";

type LabelFormat = "city" | "offset" | "abbreviation" | "full" | "raw";

interface ClockWidgetProps {
  timeZone?: TimeZone;
  label?: string;
  labelFormat?: LabelFormat;
  showHours?: boolean;
  showMinutes?: boolean;
  showSeconds?: boolean;
}

function getLabel(timeZone: TimeZone | undefined, format: LabelFormat, now: Date): string {
  if (!timeZone) return "Local";

  const intl = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat("en-US", { timeZone, ...options });

  switch (format) {
    case "city":
      return timeZone.split("/").pop()!.replace(/_/g, " ");
    case "offset": {
      const parts = intl({ timeZoneName: "shortOffset" }).formatToParts(now);
      const tz = parts.find((p) => p.type === "timeZoneName")?.value ?? "";
      return tz.replace("GMT", "UTC");
    }
    case "abbreviation": {
      const parts = intl({ timeZoneName: "short" }).formatToParts(now);
      return parts.find((p) => p.type === "timeZoneName")?.value ?? timeZone;
    }
    case "full": {
      const city = timeZone.split("/").pop()!.replace(/_/g, " ");
      const parts = intl({ timeZoneName: "short" }).formatToParts(now);
      const abbr = parts.find((p) => p.type === "timeZoneName")?.value ?? "";
      return `${city} (${abbr})`;
    }
    case "raw":
    default:
      return timeZone;
  }
}

function getDate(now: Date, timeZone?: TimeZone): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(now);
}

const Sep = () => (
  <span className="text-foreground/25 font-light select-none leading-none">:</span>
);

const ClockWidget = ({
  timeZone,
  label,
  labelFormat = "full",
  showHours = true,
  showMinutes = true,
  showSeconds = true,
}: ClockWidgetProps) => {
  const now = useClock(timeZone);
  const fmt = { minimumIntegerDigits: 2 };

  const displayLabel = label ?? getLabel(timeZone, labelFormat, now);
  const dateStr = getDate(now, timeZone);

  return (
    <ExpandableWidgetCard
      widgetQueryKey={`clock-${displayLabel}`}
      openOnCardClick
      collapsedContentClassName="flex flex-col justify-center gap-1 @container"
      expandedContentClassName="flex flex-col justify-center gap-3 @container"
    >
      {/* Timezone label */}
      <p className="truncate text-[clamp(0.5rem,1.8cqw,0.65rem)] font-medium tracking-[0.14em] uppercase text-muted-foreground/50">
        {displayLabel}
      </p>

      {/* Time display */}
      <div className="flex items-end gap-2 leading-none">
        <div className="flex items-baseline tabular-nums font-mono font-semibold leading-none text-[clamp(1.5rem,13cqw,6.5rem)]">
          {showHours && <NumberFlow value={now.getHours()} format={fmt} />}
          {showHours && showMinutes && <Sep />}
          {showMinutes && <NumberFlow value={now.getMinutes()} format={fmt} />}
          {!showHours && !showMinutes && showSeconds && (
            <NumberFlow value={now.getSeconds()} format={fmt} />
          )}
        </div>

        {showSeconds && (showHours || showMinutes) && (
          <span className="mb-[0.15em] flex flex-col items-center gap-0">
            <span className="font-mono font-semibold tabular-nums text-[clamp(0.65rem,3.5cqw,1.5rem)] text-foreground/70 leading-none">
              <NumberFlow value={now.getSeconds()} format={fmt} />
            </span>
            <span className="text-[clamp(0.4rem,1.2cqw,0.55rem)] font-medium tracking-widest uppercase text-muted-foreground/40 leading-none mt-0.5">
              sec
            </span>
          </span>
        )}
      </div>

      {/* Date */}
      <p className="text-[clamp(0.55rem,1.6cqw,0.7rem)] text-muted-foreground/50 tabular-nums">
        {dateStr}
      </p>
    </ExpandableWidgetCard>
  );
};

export default ClockWidget;
