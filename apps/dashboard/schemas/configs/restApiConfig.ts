import z from "zod";

export const RestApiConfigSchema = z.object({
  url: z.string(),
  method: z.enum(["get"]),
  headers: z.record(z.string(), z.string()).optional(),
  body: z.any().optional(),
});

export type RestApiConfig = z.infer<typeof RestApiConfigSchema>;
