"use server";

import { getChartData } from "@/lib/workflows/getChartData";

export const testDataSource = async (dataSourceId: string) => {
  await getChartData(dataSourceId);
};
