import z from "zod";

const dashboardSchema = z.object({
  key: z.string(),
  label: z.string(),
  description: z.string().optional(),
});

const dataSourceSchema = z.object({
  key: z.string(),
  type: z.enum(["rest"]),
  config: z.object({
    url: z.string(),
    method: z.enum(["get", "post", "put"]),
    headers: z.record(z.string(), z.string()).optional(),
    body: z.unknown().optional(),
    credential: z.string().optional(),
  }),
});

export const barChartConfigSchema = z.object({
  /** Feldname der Kategorie-Achse (X bei vertical, Y bei horizontal) */
  categoryField: z.string(),
  /** Ein oder mehrere Wert-Felder – ermöglicht gruppierte/gestapelte Bars */
  valueFields: z.array(z.string()).min(1),
  /** Ausrichtung der Bars: vertical = Balken nach oben, horizontal = nach rechts */
  orientation: z.enum(["vertical", "horizontal"]).default("vertical"),
  /** Bars stapeln statt gruppieren */
  stacked: z.boolean().default(false),
  /** Wert-Labels direkt an den Bars anzeigen */
  showLabels: z.boolean().default(false),
  /** Tooltip bei Hover anzeigen */
  showTooltip: z.boolean().default(true),
  /** Farben pro Serie (CSS-Farbe oder var(--...)); Defaults: var(--chart-1) usw. */
  colors: z.array(z.string()).optional(),
  /** Card-Border, -Hintergrund und -Schatten anzeigen (default: true) */
  showCard: z.boolean().default(true),
});

export type BarChartConfig = z.infer<typeof barChartConfigSchema>;

export const lineChartConfigSchema = z.object({
  /** Feldname der X-Achse (Kategorie / Zeit) */
  xField: z.string(),
  /** Ein oder mehrere Wert-Felder – eine Linie pro Feld */
  valueFields: z.array(z.string()).min(1),
  /** Datenpunkte mit Dot markieren */
  showDots: z.boolean().default(true),
  /** Fläche unter der Linie füllen */
  filled: z.boolean().default(false),
  /** Tooltip bei Hover anzeigen */
  showTooltip: z.boolean().default(true),
  /** Achsen-Labels anzeigen */
  showLabels: z.boolean().default(false),
  /** Farben pro Serie */
  colors: z.array(z.string()).optional(),
  /** Card-Border, -Hintergrund und -Schatten anzeigen (default: true) */
  showCard: z.boolean().default(true),
});

export type LineChartConfig = z.infer<typeof lineChartConfigSchema>;

export const statCardConfigSchema = z.object({
  /** Feldname des anzuzeigenden Werts (erstes Element der ersten Zeile) */
  valueField: z.string(),
  /** Optionale Einheit die hinter dem Wert angezeigt wird, z.B. "€", "%", "Stk." */
  unit: z.string().optional(),
  /** Farbe des Werts (CSS-Farbe oder var(--...)) */
  color: z.string().optional(),
  /** Anzahl Dezimalstellen für numerische Werte */
  decimals: z.number().int().min(0).max(10).optional(),
  /** Card-Border, -Hintergrund und -Schatten anzeigen (default: true) */
  showCard: z.boolean().default(true),
});

export type StatCardConfig = z.infer<typeof statCardConfigSchema>;

export const clockCardConfigSchema = z.object({
  /** Zeitzone (IANA), z.B. "Europe/Berlin" – undefined = lokale Zeit */
  timeZone: z.string().optional(),
  /** Überschreibt das automatisch generierte Label */
  label: z.string().optional(),
  /** Format des automatischen Labels */
  labelFormat: z
    .enum(["city", "offset", "abbreviation", "full", "raw"])
    .default("raw"),
  /** Stunden anzeigen */
  showHours: z.boolean().default(true),
  /** Minuten anzeigen */
  showMinutes: z.boolean().default(true),
  /** Sekunden anzeigen */
  showSeconds: z.boolean().default(true),
  /** Card-Border, -Hintergrund und -Schatten anzeigen (default: true) */
  showCard: z.boolean().default(true),
});

export type ClockCardConfig = z.infer<typeof clockCardConfigSchema>;

const chartLayoutSchema = z.object({
  x: z.number().int().min(0),
  y: z.number().int().min(0),
  w: z.number().int().min(1).max(12),
  h: z.number().int().min(1),
});

const chartSchema = z.discriminatedUnion("type", [
  z.object({
    key: z.string(),
    dashboard: z.string(),
    query: z.string().optional(),
    dataSource: z.string().optional(),
    label: z.string(),
    description: z.string().optional(),
    type: z.literal("bar"),
    config: barChartConfigSchema,
    layout: chartLayoutSchema.optional(),
  }),
  z.object({
    key: z.string(),
    dashboard: z.string(),
    query: z.string().optional(),
    dataSource: z.string().optional(),
    label: z.string(),
    description: z.string().optional(),
    type: z.literal("line"),
    config: lineChartConfigSchema,
    layout: chartLayoutSchema.optional(),
  }),
  z.object({
    key: z.string(),
    dashboard: z.string(),
    query: z.string().optional(),
    dataSource: z.string().optional(),
    label: z.string(),
    description: z.string().optional(),
    type: z.literal("stat"),
    config: statCardConfigSchema,
    layout: chartLayoutSchema.optional(),
  }),
  z.object({
    key: z.string(),
    dashboard: z.string(),
    label: z.string(),
    description: z.string().optional(),
    type: z.literal("clock"),
    config: clockCardConfigSchema,
    layout: chartLayoutSchema.optional(),
  }),
]);

const jsonPathQuerySchema = z.object({
  key: z.string(),
  type: z.literal("jsonpath"),
  dataSource: z.string().optional(),
  sourceQuery: z.string().optional(),
  jsonPath: z.string(),
});

const sqlQuerySchema = z.object({
  key: z.string(),
  type: z.literal("sql"),
  dataSource: z.string().optional(),
  sourceQuery: z.string().optional(),
  sql: z.string(),
});

const querySchema = z.discriminatedUnion("type", [
  jsonPathQuerySchema,
  sqlQuerySchema,
]);

export const stackSchema = z.object({
  key: z.string(),
  environment: z.enum(["PRODUCTION", "STAGING", "DEVELOPMENT"]),
  dataSources: z.array(dataSourceSchema).optional(),
  charts: z.array(chartSchema).optional(),
  dashboards: z.array(dashboardSchema).optional(),
  queries: z.array(querySchema).optional(),
});
