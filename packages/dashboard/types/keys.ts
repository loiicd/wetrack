/** Branded Key-Typen für typsichere Querreferenzen zwischen Stack-Entitäten. */

export type DashboardKey = string & { readonly __brand: "DashboardKey" };
export type DataSourceKey = string & { readonly __brand: "DataSourceKey" };
export type QueryKey = string & { readonly __brand: "QueryKey" };
export type ChartKey = string & { readonly __brand: "ChartKey" };

/**
 * Laufzeit-diskriminierte Referenz auf eine Datenquelle eines Charts.
 * Wird als `source`-Feld in ChartMeta verwendet.
 */
export type ChartSourceRef =
  | { readonly _entity: "query"; readonly key: QueryKey }
  | { readonly _entity: "dataSource"; readonly key: DataSourceKey };
