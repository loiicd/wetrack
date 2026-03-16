import type { DataSourceConfig, DataSourceDefinition } from "../types/datasource";

export class DataSource {
  key: string;
  stackId?: string;
  dataSourceConfig: DataSourceConfig;

  constructor(key: string, dataSourceConfig: DataSourceConfig) {
    this.key = key;
    this.dataSourceConfig = dataSourceConfig;
  }

  synthesize(): DataSourceDefinition {
    return {
      key: this.key,
      ...this.dataSourceConfig,
    };
  }

  static fromJSON(json: DataSourceDefinition): DataSource {
    const { key, ...dataSourceConfig } = json;
    return new DataSource(key, dataSourceConfig as DataSourceConfig);
  }
}
