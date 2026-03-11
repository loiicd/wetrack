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
    return {
      name: this.name,
      stackId: this.stackId,
      dataSource: this.config.dataSource,
      jsonPath: this.config.jsonPath,
    };
  }
}
