import type { DashboardConfig, DashboardDefinition } from "../types/dashboard";

export class Dashboard {
  key: string;
  stackId?: string;
  dashboardConfig: DashboardConfig;

  constructor(key: string, dashboardConfig: DashboardConfig) {
    this.key = key;
    this.dashboardConfig = dashboardConfig;
  }

  synthesize(): DashboardDefinition {
    return {
      key: this.key,
      ...this.dashboardConfig,
    };
  }

  static fromJSON(json: DashboardDefinition): Dashboard {
    const { key, ...dashboardConfig } = json;
    return new Dashboard(key, dashboardConfig);
  }
}
