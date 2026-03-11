export const Environment = {
  DEVELOPMENT: "DEVELOPMENT",
  STAGING: "STAGING",
  PRODUCTION: "PRODUCTION",
} as const;

export type Environment = (typeof Environment)[keyof typeof Environment];
