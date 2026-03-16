import type { ChartConfig, ChartDefinition } from "../types/chart";

export class Chart {
  key: string;
  stackId?: string;
  chartConfig: ChartConfig;

  constructor(key: string, chartConfig: ChartConfig) {
    this.key = key;
    this.chartConfig = chartConfig;
  }

  synthesize(): ChartDefinition {
    return {
      key: this.key,
      ...this.chartConfig,
    } as ChartDefinition;
  }

  static fromJSON(json: ChartDefinition): Chart {
    const { key, ...chartConfig } = json;
    return new Chart(key, chartConfig as ChartConfig);
  }
}
