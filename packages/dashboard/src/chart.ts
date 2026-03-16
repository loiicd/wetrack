import type { ChartConfig, ChartDefinition } from "../types/chart";
import type { ChartKey } from "../types/keys";

export class Chart {
  key: ChartKey;
  chartConfig: ChartConfig;

  constructor(key: string, chartConfig: ChartConfig) {
    this.key = key as ChartKey;
    this.chartConfig = chartConfig;
  }

  synthesize(): ChartDefinition {
    const { source, ...rest } = this.chartConfig;
    const sourceFields =
      source?._entity === "query"
        ? { query: source.key as string }
        : source?._entity === "dataSource"
          ? { dataSource: source.key as string }
          : {};
    return { key: this.key, ...rest, ...sourceFields } as ChartDefinition;
  }

  static fromJSON(json: ChartDefinition): Chart {
    const { key, query, dataSource, ...rest } = json as ChartDefinition & {
      query?: string;
      dataSource?: string;
    };
    // Beim Deserialisieren aus JSON bauen wir den source-Ref manuell
    // (_entity kann korrekt nicht garantiert werden ohne Registry – daher query bevorzugt)
    const source = query
      ? ({ _entity: "query", key } as never)
      : dataSource
        ? ({ _entity: "dataSource", key: dataSource } as never)
        : undefined;
    return new Chart(key, { ...rest, source } as ChartConfig);
  }
}
