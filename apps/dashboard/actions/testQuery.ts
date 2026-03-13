"use server";

import { getQueryData } from "@/lib/workflows/getQueryData";

export const testQuery = async (queryId: string) => {
  await getQueryData(queryId);
};
