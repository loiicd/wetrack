import DashboardCard from "@/components/cards/dashboardCard";
import Container from "@/components/layout/container";
import DashboardsEmptyState from "@/components/home/dashboardsEmptyState";
import { dashboardInterface } from "@/lib/database/dashboard";
import { auth } from "@clerk/nextjs/server";
import { connection } from "next/server";
import { Suspense } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const DashboardGrid = async () => {
  await connection();
  const { orgId } = await auth();
  const dashboards = await dashboardInterface.getMany(orgId ?? undefined);

  if (dashboards.length === 0) {
    return <DashboardsEmptyState />;
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {dashboards.map((dashboard) => (
        <DashboardCard key={dashboard.id} dashboard={dashboard} />
      ))}
    </div>
  );
};

const Page = () => {
  return (
    <Container>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dashboards</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Alle Dashboards deiner Organisation.
            </p>
          </div>
          <Link href="/dashboard/create">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Neues Dashboard
            </Button>
          </Link>
        </div>
        <Suspense>
          <DashboardGrid />
        </Suspense>
      </div>
    </Container>
  );
};

export default Page;
