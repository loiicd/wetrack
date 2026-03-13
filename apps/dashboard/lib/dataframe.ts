import type { DataFrame, DataFrameFieldType } from "@/types/dataframe";

const inferType = (value: unknown): DataFrameFieldType => {
  if (typeof value === "number") return "number";
  if (typeof value === "boolean") return "boolean";
  if (typeof value === "string") {
    // ISO-Datum-Erkennung
    if (/^\d{4}-\d{2}-\d{2}(T[\d:.Z+-]+)?$/.test(value)) return "time";
    return "string";
  }
  return "string";
};

/**
 * Konvertiert ein Array von Objekten (Query-Ergebnis) in ein DataFrame.
 * Alle Keys des ersten Objekts werden als Felder übernommen.
 */
export const toDataFrame = (
  data: unknown,
  fieldNames?: string[],
): DataFrame => {
  if (!Array.isArray(data) || data.length === 0) {
    return { fields: [] };
  }

  const first = data[0];
  if (typeof first !== "object" || first === null) {
    return { fields: [] };
  }

  const keys = fieldNames ?? Object.keys(first as Record<string, unknown>);

  const fields = keys.map((key) => {
    const values = data.map((row) => {
      if (typeof row === "object" && row !== null) {
        return (row as Record<string, unknown>)[key] ?? null;
      }
      return null;
    });

    const firstNonNull = values.find((v) => v !== null && v !== undefined);
    return {
      name: key,
      type: inferType(firstNonNull),
      values,
    };
  });

  return { fields };
};
