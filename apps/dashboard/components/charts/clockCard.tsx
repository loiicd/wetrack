"use client";

import useClock from "@/hooks/useClock";
import type { TimeZone } from "@/types/timezone";
import { Card, CardContent } from "../ui/card";
import NumberFlow from "@number-flow/react";

type LabelFormat = "city" | "offset" | "abbreviation" | "full" | "raw";

interface ClockCardProps {
  timeZone?: TimeZone;
  label?: string;
  labelFormat?: LabelFormat;
  showHours?: boolean;
  showMinutes?: boolean;
  showSeconds?: boolean;
}

function getLabel(
  timeZone: TimeZone | undefined,
  format: LabelFormat,
  now: Date,
): string {
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
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(now);
}

const Sep = () => (
  <span className="text-foreground/25 font-light select-none leading-none">
    :
  </span>
);

const ClockCard = ({
  timeZone,
  label,
  labelFormat = "full",
  showHours = true,
  showMinutes = true,
  showSeconds = true,
}: ClockCardProps) => {
  const now = useClock(timeZone);

  const fmt = { minimumIntegerDigits: 2 };

  const displayLabel = label ?? getLabel(timeZone, labelFormat, now);
  const dateStr = getDate(now, timeZone);

  return (
    <Card className="@container h-full">
      <CardContent className="flex h-full flex-col justify-center gap-1.5 px-5 py-4">
        {/* Label */}
        <p className="truncate text-[clamp(0.55rem,1.8cqw,0.65rem)] font-medium tracking-[0.14em] uppercase text-muted-foreground/50">
          {displayLabel}
        </p>

        {/* Time + Seconds */}
        <div className="flex items-end gap-2 leading-none">
          {/* HH:MM */}
          <div className="flex items-baseline tabular-nums font-mono font-semibold leading-none text-[clamp(2rem,13cqw,6.5rem)]">
            {showHours && <NumberFlow value={now.getHours()} format={fmt} />}
            {showHours && showMinutes && <Sep />}
            {showMinutes && (
              <NumberFlow value={now.getMinutes()} format={fmt} />
            )}
            {!showHours && !showMinutes && showSeconds && (
              <NumberFlow value={now.getSeconds()} format={fmt} />
            )}
          </div>

          {/* Seconds as separate small badge */}
          {showSeconds && (showHours || showMinutes) && (
            <span className="mb-[0.15em] flex flex-col items-center gap-0">
              <span className="font-mono font-semibold tabular-nums text-[clamp(0.75rem,3.5cqw,1.5rem)] text-foreground/70 leading-none">
                <NumberFlow value={now.getSeconds()} format={fmt} />
              </span>
              <span className="text-[clamp(0.45rem,1.2cqw,0.55rem)] font-medium tracking-widest uppercase text-muted-foreground/40 leading-none mt-0.5">
                sec
              </span>
            </span>
          )}
        </div>

        {/* Date */}
        <p className="text-[clamp(0.6rem,1.8cqw,0.7rem)] text-muted-foreground/50 tabular-nums">
          {dateStr}
        </p>
      </CardContent>
    </Card>
  );
};

export default ClockCard;
