export const Status = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  BUILDING: "BUILDING",
} as const;

export type Status = (typeof Status)[keyof typeof Status];
