import type {
  DataSourceConfig,
  DataSourceDefinition,
} from "../types/datasource";
import type { DataSourceKey } from "../types/keys";

export class DataSource {
  readonly _entity = "dataSource" as const;
  key: DataSourceKey;
  dataSourceConfig: DataSourceConfig;

  constructor(key: string, dataSourceConfig: DataSourceConfig) {
    this.key = key as DataSourceKey;
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
