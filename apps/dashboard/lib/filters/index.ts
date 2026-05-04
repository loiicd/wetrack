/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * A filter record as returned by the database, with the JSON `config` blob
 * merged into the top level so callers can access `field`, `targets`, `inject`, etc.
 */
export type NormalizedFilter = {
  id: string;
  key: string;
  type: string;
  label?: string | null;
  version?: number;
  stackId?: string;
  field?: string;
  targets?: Array<{ type: string; key: string }>;
  inject?: { location: string; key: string };
  [key: string]: any;
};

/**
 * Accepts raw DB filter records (where metadata lives in a `.config` JSON blob)
 * and returns normalized filters with `config` merged into the top level.
 * No caller needs to know about the DB storage detail.
 */
export function normalizeFilters(rawFilters: any[]): NormalizedFilter[] {
  return (rawFilters || []).map((f: any) => ({ ...f, ...(f.config || {}) }));
}

export function getValueByPath(obj: any, path: string) {
  if (!obj || typeof obj !== "object") return undefined;
  return path.split(".").reduce((acc: any, p) => (acc && acc[p] !== undefined ? acc[p] : undefined), obj);
}

export function extractFilterValue(filter: any, ctx: Record<string, any> | undefined, fallbackDate?: { from?: string; to?: string }) {
  const k = filter.key;
  if (!ctx) return undefined;
  if (k in ctx) return ctx[k];
  const fromKey1 = `${k}_from`;
  const toKey1 = `${k}_to`;
  const fromKey2 = `${k}.from`;
  const toKey2 = `${k}.to`;
  if (fromKey1 in ctx || toKey1 in ctx) {
    return { from: ctx[fromKey1], to: ctx[toKey1] };
  }
  if (fromKey2 in ctx || toKey2 in ctx) {
    return { from: ctx[fromKey2], to: ctx[toKey2] };
  }
  if (filter.type === "date_range" && fallbackDate) {
    return { from: fallbackDate.from, to: fallbackDate.to };
  }
  return undefined;
}

export function applyFiltersToArray(filters: any[], data: any[], ctx?: Record<string, any>) {
  if (!filters || !filters.length) return data;
  // If there is exactly one date_range filter and user used generic dateFrom/dateTo keys, allow fallback
  const dateFilters = filters.filter((f) => f.type === "date_range");
  const fallbackDate = dateFilters.length === 1 && ctx && (ctx.dateFrom || ctx.dateTo)
    ? { from: ctx.dateFrom, to: ctx.dateTo }
    : undefined;

  return data.filter((row) => {
    for (const filter of filters) {
      const val = extractFilterValue(filter, ctx, fallbackDate);
      if (val === undefined || val === null || val === "") continue; // no filter value provided

      const rowValue = getValueByPath(row, filter.field);
      if (filter.type === "date_range") {
        const from = val.from ? new Date(val.from).getTime() : undefined;
        const to = val.to ? new Date(val.to).getTime() : undefined;
        const rv = rowValue ? new Date(rowValue).getTime() : undefined;
        if (rv === undefined || Number.isNaN(rv)) return false;
        if (from !== undefined && rv < from) return false;
        if (to !== undefined && rv > to) return false;
      } else if (filter.type === "number_range") {
        const from = val.from !== undefined ? Number(val.from) : undefined;
        const to = val.to !== undefined ? Number(val.to) : undefined;
        const rv = rowValue !== undefined ? Number(rowValue) : undefined;
        if (rv === undefined || Number.isNaN(rv)) return false;
        if (from !== undefined && rv < from) return false;
        if (to !== undefined && rv > to) return false;
      } else if (filter.type === "select") {
        if (Array.isArray(val)) {
          if (!val.includes(rowValue)) return false;
        } else {
          if (rowValue !== val) return false;
        }
      } else if (filter.type === "string") {
        if (typeof rowValue === "string") {
          if (!String(rowValue).includes(String(val))) return false;
        } else {
          if (rowValue !== val) return false;
        }
      }
    }
    return true;
  });
}
