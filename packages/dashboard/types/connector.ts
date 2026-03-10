import type { ZodSchema } from "zod/v3";

export type RestConnectorConfig = {
  type: "api";
  url: string;
  method: "get" | "post" | "put";
  responseSchema: ZodSchema<any>;
  headers?: Record<string, string>;
  body?: any;
};
