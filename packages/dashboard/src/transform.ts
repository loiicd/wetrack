import type { TransformConfig, TransformDefinition } from "../types/transform";

export class Transform {
  key: string;
  stackId?: string;
  config: TransformConfig;

  constructor(key: string, config: TransformConfig) {
    this.key = key;
    this.config = config;
  }

  synthesize(): TransformDefinition {
    return {
      key: this.key,
      query: this.config.query,
      function: this.config.function,
      field: this.config.field,
      groupByField: this.config.groupByField,
    };
  }

  static fromJSON(json: TransformDefinition): Transform {
    const { key, ...config } = json;
    return new Transform(key, config as TransformConfig);
  }
}
