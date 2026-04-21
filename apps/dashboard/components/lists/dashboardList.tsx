import { dashboardInterface } from "@/lib/database/dashboard";
import { auth } from "@clerk/nextjs/server";
import { Card, CardContent } from "@/components/ui/card";
import DashboardListItem from "./dashboardListItem";

type Props = {
  orgId: string;
};

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

  return (
    <div className="flex flex-col gap-4">
      {dashboards.map((dashboard) => (
        <DashboardListItem key={dashboard.id} dashboard={dashboard} />
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
