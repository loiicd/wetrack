import type { DashboardConfig } from "../types/dashboard";

export class Dashboard {
  id: string;
  dashboardConfig: DashboardConfig;

  constructor(id: string, dashboardConfig: DashboardConfig) {
    this.id = id;
    this.dashboardConfig = dashboardConfig;
  }

  synthesize() {
    return {
      id: this.id,
      ...this.dashboardConfig,
    };
  }
}
