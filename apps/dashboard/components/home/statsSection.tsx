import { Card } from "@/components/ui/card";
import { BarChart3, Database, GitBranch, Activity } from "lucide-react";

interface StatsData {
  totalDashboards: number;
  totalDataSources: number;
  totalQueries: number;
  activeStacks: number;
}

export function StatsSection({ stats }: { stats: StatsData }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Dashboards
            </p>
            <p className="text-3xl font-bold">{stats.totalDashboards}</p>
          </div>
          <BarChart3 className="w-8 h-8 text-blue-500/50" />
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Datenquellen
            </p>
            <p className="text-3xl font-bold">{stats.totalDataSources}</p>
          </div>
          <Database className="w-8 h-8 text-green-500/50" />
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Queries
            </p>
            <p className="text-3xl font-bold">{stats.totalQueries}</p>
          </div>
          <GitBranch className="w-8 h-8 text-purple-500/50" />
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Aktive Stacks
            </p>
            <p className="text-3xl font-bold">{stats.activeStacks}</p>
          </div>
          <Activity className="w-8 h-8 text-pink-500/50" />
        </div>
      </Card>
    </div>
  );
}
