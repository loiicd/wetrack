import { useEffect, useMemo, useState } from "react";
import type { TimeZone } from "@/types/timezone";

const useClock = (timeZone?: TimeZone) => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const tick = () => {
      setNow(new Date());
      timeout = setTimeout(tick, 1000 - (Date.now() % 1000));
    };
    tick();
    return () => clearTimeout(timeout);
  }, []);

  const zonedDate = useMemo(() => {
    if (!timeZone) {
      return now;
    }

    try {
      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone,
        hour12: false,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      const parts = formatter.formatToParts(now);
      const dateParts: Record<string, string> = {};
      for (const part of parts) {
        if (part.type !== "literal") {
          dateParts[part.type] = part.value;
        }
      }

      return new Date(
        `${dateParts.year}-${dateParts.month}-${dateParts.day}T${dateParts.hour}:${dateParts.minute}:${dateParts.second}`,
      );
    } catch (error) {
      console.error("Error formatting date with time zone:", error);
      return now;
    }
  }, [now, timeZone]);

  return zonedDate;
};

export default useClock;
