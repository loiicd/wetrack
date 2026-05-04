import type { ChartType } from "@/generated/prisma/enums";

/**
 * Maps every SDK chart-type string (what the CLI sends) to the corresponding
 * DB enum value.  This is the single source of truth for that translation.
 *
 * If an unknown type arrives the function throws loudly, so a new type never
 * slips through silently with a wrong default.
 */
const SDK_TO_DB: Record<string, ChartType> = {
  cartesian: "CARTESIAN",
  stat: "STAT",
  clock: "CLOCK",
};

export function mapSdkChartType(sdkType: string): ChartType {
  const dbType = SDK_TO_DB[sdkType];
  if (!dbType) {
    throw new Error(
      `Unknown chart type '${sdkType}'. Supported SDK types: ${Object.keys(SDK_TO_DB).join(", ")}.`,
    );
  }
  return dbType;
}

/**
 * DB enum values that all render as a Cartesian chart.
 * Includes legacy BAR and LINE entries that were stored before the SDK
 * consolidated them into "cartesian".
 */
export const CARTESIAN_DB_TYPES = new Set<ChartType>([
  "CARTESIAN",
  "BAR",  // legacy – no longer emitted by SDK but may exist in older DB rows
  "LINE", // legacy – no longer emitted by SDK but may exist in older DB rows
]);

/**
 * Maps a DB chart-type enum value back to the SDK-facing string (used by the
 * GET /api/dashboard endpoint when returning stored stacks to the CLI).
 */
const DB_TO_SDK: Record<ChartType, string> = {
  CARTESIAN: "cartesian",
  BAR: "cartesian", // legacy – normalise on read
  LINE: "cartesian", // legacy – normalise on read
  STAT: "stat",
  CLOCK: "clock",
};

export function mapDbChartType(dbType: ChartType): string {
  return DB_TO_SDK[dbType];
}
