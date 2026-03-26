import z from "zod";

export const RestApiConfigSchema = z.object({
  url: z.string(),
  method: z.enum(["get", "post", "put"]),
  headers: z.record(z.string(), z.string()).optional(),
  body: z.any().optional(),
  /** Label of a Credential Vault entry to inject as an HTTP auth header */
  credential: z.string().optional(),
});

export type RestApiConfig = z.infer<typeof RestApiConfigSchema>;
