import { JSONPath } from "jsonpath-plus";
import alasql from "@/lib/vendors/alasql";
import { queryInterface } from "../database/query";
import { getChartData } from "./getChartData";
import { validateSql } from "../sql/validateSql";
import { unstable_cache } from "next/cache";
import { filterInterface } from "../database/filter";

function stableSerialize(obj: unknown): string {
  if (obj === undefined) return "";
  try {
    return JSON.stringify(obj, (_key, value) => {
      if (value && typeof value === "object" && !Array.isArray(value)) {
        return Object.keys(value)
          .sort()
          .reduce((acc, k) => {
            // @ts-ignore
            acc[k] = value[k];
            return acc;
          }, {} as Record<string, unknown>);
      }
      return value;
    });
  } catch (e) {
    return String(obj);
  }
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

const executeQuery = async (queryId: string, filterContext?: Record<string, any>): Promise<unknown> => {
  const query = await queryInterface.getById(queryId);

  if (!query) {
    throw new Error("Query not found");
  }

  let sourceData: unknown;
  if (query.dataSourceId) {
    sourceData = await getChartData(query.dataSourceId, filterContext);
  } else if (query.sourceQueryId) {
    sourceData = await getQueryData(query.sourceQueryId, filterContext);
  } else {
    throw new Error(
      `Query '${query.key}' hat weder eine DataSource noch eine Source-Query.`,
    );
  }

  // Load filters for this stack and select those that target this query
  const filters = await filterInterface.getByStackId(query.stackId as string);
  // Normalize filters: merge stored JSON `config` into the top-level object so callers can access `field`, `targets`, etc.
  const normalizedFilters = (filters || []).map((f: any) => ({ ...(f || {}), ...(f.config || {}) }));
  const applicableFilters = normalizedFilters.filter((f: any) =>
    Array.isArray(f.targets)
      ? f.targets.some((t: any) => t.type === "query" && t.key === query.key)
      : false,
  );

  // Apply filters to sourceData when it's an array
  let filteredSource = sourceData;
  if (Array.isArray(sourceData) && applicableFilters.length > 0) {
    filteredSource = applyFiltersToArray(applicableFilters, sourceData, filterContext);
  }

  if (query.type === "JSONPATH") {
    if (!query.jsonPath) {
      throw new Error(`JSONPath-Query '${query.key}' hat keinen jsonPath.`);
    }
    return JSONPath({ path: query.jsonPath, json: filteredSource as object });
  }

  if (query.type === "SQL") {
    if (!query.sql) {
      throw new Error(`SQL-Query '${query.key}' hat kein sql.`);
    }
    validateSql(query.sql);
    const data = Array.isArray(filteredSource) ? filteredSource : [filteredSource];
    return alasql(query.sql, [data]);
  }

  throw new Error(`Unbekannter Query-Typ: ${query.type}`);
};

export const getQueryData = async (queryId: string, filterContext?: Record<string, any>): Promise<unknown> => {
  const cachedExecute = unstable_cache(
    () => executeQuery(queryId, filterContext),
    [`query:${queryId}`, `filters:${stableSerialize(filterContext)}`],
    {
      revalidate: 60,
      tags: [`query:${queryId}`],
    },
  );
  return cachedExecute();
};
