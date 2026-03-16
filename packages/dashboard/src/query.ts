import type { QueryConfig, QueryDefinition } from "../types/query";
import type { QueryKey } from "../types/keys";

export class Query {
  readonly _entity = "query" as const;
  key: QueryKey;
  config: QueryConfig;

  constructor(key: string, config: QueryConfig) {
    this.key = key as QueryKey;
    this.config = config;
  }

  synthesize(): QueryDefinition {
    const base = {
      key: this.key,
      type: this.config.type,
      dataSource: this.config.dataSource,
      sourceQuery: this.config.sourceQuery,
    };

    if (this.config.type === "jsonpath") {
      return { ...base, type: "jsonpath", jsonPath: this.config.jsonPath };
    } else {
      return { ...base, type: "sql", sql: this.config.sql };
    }
  }

  static fromJSON(json: QueryDefinition): Query {
    const { key, ...config } = json;
    return new Query(key, config as QueryConfig);
  }
}
