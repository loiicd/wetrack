export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export const withErrorHandling = async <T>(
  action: () => Promise<T>,
): Promise<ActionResult<T>> => {
  try {
    const data = await action();
    return { success: true, data };
  } catch (err) {
    const error = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error };
  }
};
