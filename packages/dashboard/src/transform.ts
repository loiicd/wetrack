import type { TransformConfig } from "../types/transform";

export class Transform {
  name: string;
  stackId?: string;
  config: TransformConfig;

  constructor(name: string, config: TransformConfig) {
    this.name = name;
    this.config = config;
  }

  synthesize() {
    return {
      name: this.name,
      stackId: this.stackId,
      query: this.config.query,
      function: this.config.function,
      field: this.config.field,
      groupByField: this.config.groupByField,
    };
  }
}
