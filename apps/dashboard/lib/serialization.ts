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
