import type { QueryConfig, QueryDefinition } from "../types/query";

export class Query {
  key: string;
  stackId?: string;
  config: QueryConfig;

  constructor(key: string, config: QueryConfig) {
    this.key = key;
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
