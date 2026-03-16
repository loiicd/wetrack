import type { DashboardConfig, DashboardDefinition } from "../types/dashboard";
import type { DashboardKey } from "../types/keys";

export class Dashboard {
  key: DashboardKey;
  dashboardConfig: DashboardConfig;

  constructor(key: string, dashboardConfig: DashboardConfig) {
    this.key = key as DashboardKey;
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
