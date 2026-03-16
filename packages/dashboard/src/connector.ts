import { zodToJsonSchema } from "zod-to-json-schema";
import type { ZodSchema } from "zod/v3";
import type { RestConnectorConfig } from "../types/connector";

export class Connector {
  key: string;
  stackId?: string;
  config: RestConnectorConfig;

  constructor(key: string, config: RestConnectorConfig) {
    this.key = key;
    this.config = config;
  }

  async synthesize() {
    return {
      key: this.key,
      stackId: this.stackId,
      type: this.config.type,
      responseSchema: await this.zodToJsonSchema(this.config.responseSchema),
    };
  }

  private async zodToJsonSchema(zodSchema: ZodSchema<any>): Promise<any> {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore – zod-to-json-schema triggers "type instantiation too deep" for complex schemas
    return zodToJsonSchema(zodSchema, "responseSchema");
  }
}
