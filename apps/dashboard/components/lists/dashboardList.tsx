import { dashboardInterface } from "@/lib/database/dashboard";
import { Card, CardContent } from "@/components/ui/card";
import DashboardListItem from "./dashboardListItem";

type Props = {
  orgId: string;
};

type Environment = "PRODUCTION" | "STAGING" | "DEVELOPMENT";

type GroupedDashboard = {
  key: string;
  label: string;
  description?: string | null;
  environments: { id: string; environment: Environment }[];
  preferredId: string;
};

const ENV_PRIORITY: Environment[] = ["PRODUCTION", "STAGING", "DEVELOPMENT"];

function groupDashboards(
  dashboards: Awaited<ReturnType<typeof dashboardInterface.getMany>>,
): GroupedDashboard[] {
  const groups = new Map<string, GroupedDashboard>();

  for (const d of dashboards) {
    const env = d.stack?.environment as Environment | undefined;
    if (!env) continue;

    if (!groups.has(d.key)) {
      groups.set(d.key, {
        key: d.key,
        label: d.label,
        description: d.description,
        environments: [],
        preferredId: d.id,
      });
    }

    const group = groups.get(d.key)!;
    group.environments.push({ id: d.id, environment: env });
  }

  for (const group of groups.values()) {
    const sorted = [...group.environments].sort(
      (a, b) => ENV_PRIORITY.indexOf(a.environment) - ENV_PRIORITY.indexOf(b.environment),
    );
    group.preferredId = sorted[0].id;
  }

  return Array.from(groups.values());
}

const DashboardList = async ({ orgId }: Props) => {
  const dashboards = await dashboardInterface.getMany(orgId);

  if (dashboards.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center gap-4">
          <p className="text-lg font-semibold">Noch keine Dashboards</p>
          <p className="text-sm text-muted-foreground">Deploy dein erstes Dashboard:</p>
          <pre className="rounded-md bg-muted px-4 py-3 text-sm text-left font-mono">
            {`npm install wetrack-dashboard\nwetrack deploy dashboards/metrics.ts`}
          </pre>
          <a
            href="https://docs.wetrack.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary underline underline-offset-4"
          >
            Zur Dokumentation →
          </a>
        </CardContent>
      </Card>
    );
  }

  const grouped = groupDashboards(dashboards);

  return (
    <div className="flex flex-col gap-4">
      {grouped.map((group) => (
        <DashboardListItem key={group.key} dashboard={group} />
      ))}
    </div>
  );
};

DashboardList.skeleton = () => {
  return (
    <div className="flex flex-col gap-4">
      {[1, 2, 3].map((i) => (
        <DashboardListItem.skeleton key={i} />
      ))}
    </div>
  );
};

export default DashboardList;
