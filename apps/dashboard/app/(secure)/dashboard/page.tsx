import DashboardCard from "@/components/cards/dashboardCard";
import Container from "@/components/layout/container";
import DashboardsEmptyState from "@/components/home/dashboardsEmptyState";
import { dashboardInterface } from "@/lib/database/dashboard";
import { connection } from "next/server";
import { Suspense } from "react";

const DashboardGrid = async () => {
  await connection();
  const dashboards = await dashboardInterface.getMany();

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
      <Suspense>
        <DashboardGrid />
      </Suspense>
    </Container>
  );
};

export default Page;

