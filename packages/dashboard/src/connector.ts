import { zodToJsonSchema } from "zod-to-json-schema";
import type { ZodSchema } from "zod/v3";
import type { RestConnectorConfig } from "../types/connector";

export class Connector {
  name: string;
  stackId?: string;
  config: RestConnectorConfig;

  constructor(name: string, config: RestConnectorConfig) {
    this.name = name;
    this.config = config;
  }

  async synthesize() {
    return {
      name: this.name,
      stackId: this.stackId,
      type: this.config.type,
      responseSchema: await this.zodToJsonSchema(this.config.responseSchema),
    };
  }

  private async zodToJsonSchema(zodSchema: ZodSchema<any>): Promise<any> {
    return zodToJsonSchema(zodSchema, "responseSchema");
  }
}
