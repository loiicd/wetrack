import type { QueryConfig } from "../types/query";

export class Query {
  name: string;
  stackId?: string;
  config: QueryConfig;

  constructor(name: string, config: QueryConfig) {
    this.name = name;
    this.config = config;
  }

  synthesize() {
    const base = {
      name: this.name,
      stackId: this.stackId,
      type: this.config.type,
      dataSource: this.config.dataSource,
      sourceQuery: this.config.sourceQuery,
    };

    if (this.config.type === "jsonpath") {
      return { ...base, jsonPath: this.config.jsonPath };
    } else {
      return { ...base, sql: this.config.sql };
    }
  }
}
