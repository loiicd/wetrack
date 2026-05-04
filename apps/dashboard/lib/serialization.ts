/**
 * Deterministically serializes a value to JSON for use in cache keys.
 *
 * Objects are serialized with keys sorted alphabetically, so two objects with
 * the same entries in different insertion orders produce identical output.
 * Arrays are serialized as-is (element order is preserved).
 *
 * @param obj - The value to serialize. `undefined` returns `""`.
 * @returns A stable JSON string, or `String(obj)` if serialization fails.
 */
export function stableSerialize(obj: unknown): string {
  if (obj === undefined) return "";
  try {
    return JSON.stringify(obj, (_key, value) => {
      if (value && typeof value === "object" && !Array.isArray(value)) {
        return Object.keys(value)
          .sort()
          .reduce((acc, k) => {
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
