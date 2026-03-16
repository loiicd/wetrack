export type DashboardConfig = {
  label: string;
  description?: string;
};

export type DashboardDefinition = DashboardConfig & {
  key: string;
};
