import { zodToJsonSchema } from "zod-to-json-schema";
import type { ZodSchema } from "zod/v3";
import z from "zod/v3";

export class Connector {
  name: string;
  stackId?: string;
  config: {
    type: "api";
    url: string;
    method: "get" | "post" | "put";
    headers?: Record<string, string>;
    body?: any;
    responseSchema: ZodSchema<any>;
  };

  constructor(
    name: string,
    config: {
      type: "api";
      responseSchema: ZodSchema<any>;
      url: string;
      method: "get" | "post" | "put";
      headers?: Record<string, string>;
      body?: any;
    },
  ) {
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
