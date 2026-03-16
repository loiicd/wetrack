export type ChartLayout = {
  x: number;
  y: number;
  w: number;
  h: number;
};

export type BarChartConfig = {
  /** Feldname der Kategorie-Achse (X bei vertical, Y bei horizontal) */
  categoryField: string;
  /** Ein oder mehrere Wert-Felder – ermöglicht gruppierte/gestapelte Bars */
  valueFields: string[];
  /** Ausrichtung der Bars: vertical = Balken nach oben, horizontal = nach rechts */
  orientation: "vertical" | "horizontal";
  /** Bars stapeln statt gruppieren */
  stacked?: boolean;
  /** Wert-Labels direkt an den Bars anzeigen */
  showLabels?: boolean;
  /** Tooltip bei Hover anzeigen */
  showTooltip?: boolean;
  /** Farben pro Serie (CSS-Farbe oder var(--...)) */
  colors?: string[];
};

export type LineChartConfig = {
  /** Feldname der X-Achse (Kategorie / Zeit) */
  xField: string;
  /** Ein oder mehrere Wert-Felder – eine Linie pro Feld */
  valueFields: string[];
  /** Datenpunkte mit Dot markieren */
  showDots?: boolean;
  /** Fläche unter der Linie füllen */
  filled?: boolean;
  /** Tooltip bei Hover anzeigen */
  showTooltip?: boolean;
  /** Achsen-Labels anzeigen */
  showLabels?: boolean;
  /** Farben pro Serie */
  colors?: string[];
};

export type StatCardConfig = {
  /** Feldname des anzuzeigenden Werts */
  valueField: string;
  /** Optionale Einheit, z.B. "€", "%", "Stk." */
  unit?: string;
  /** Farbe des Werts (CSS-Farbe oder var(--...)) */
  color?: string;
  /** Anzahl Dezimalstellen für numerische Werte */
  decimals?: number;
};

export type BarChartDefinition = {
  key: string;
  dashboard: string;
  query: string;
  label: string;
  description?: string;
  type: "bar";
  config: BarChartConfig;
  layout?: ChartLayout;
};

export type LineChartDefinition = {
  key: string;
  dashboard: string;
  query: string;
  label: string;
  description?: string;
  type: "line";
  config: LineChartConfig;
  layout?: ChartLayout;
};

export type StatChartDefinition = {
  key: string;
  dashboard: string;
  query: string;
  label: string;
  description?: string;
  type: "stat";
  config: StatCardConfig;
  layout?: ChartLayout;
};

export type ChartDefinition =
  | BarChartDefinition
  | LineChartDefinition
  | StatChartDefinition;

export type ChartTypeConfig =
  | { type: "bar"; config: BarChartConfig }
  | { type: "line"; config: LineChartConfig }
  | { type: "stat"; config: StatCardConfig };

export type ChartMeta = {
  dashboard: string;
  query: string;
  label: string;
  description?: string;
  layout?: ChartLayout;
};

/** Vollständige Chart-Konfiguration (ohne key) */
export type ChartConfig = ChartMeta & ChartTypeConfig;
