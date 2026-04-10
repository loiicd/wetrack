import { Suspense } from "react";
import Container from "@/components/layout/container";
import HeroSection from "@/components/sections/heroSection";
import { StatsSection } from "@/components/home/statsSection";
import { WorkflowTimeline } from "@/components/home/workflowTimeline";
import { dashboardInterface } from "@/lib/database/dashboard";
import { stackInterface } from "@/lib/database/stack";
import { dataSourceInterface } from "@/lib/database/dataSource";
import { queryInterface } from "@/lib/database/query";
import { getPageAuth } from "@/lib/auth/getPageAuth";
import DashboardList from "@/components/lists/dashboardList";

async function getStatsData(orgId?: string) {
  try {
    const [dashboards, stacks, dataSources, queries] = await Promise.all([
      dashboardInterface.getMany(orgId),
      stackInterface.getMany(orgId),
      dataSourceInterface.getMany(orgId),
      queryInterface.getMany(orgId),
    ]);

    return {
      totalDashboards: dashboards.length,
      totalDataSources: dataSources.length,
      totalQueries: queries.length,
      activeStacks: stacks.length,
    };
  } catch (error) {
    console.error("Failed to fetch stats:", error);
    return {
      totalDashboards: 0,
      totalDataSources: 0,
      totalQueries: 0,
      activeStacks: 0,
    };
  }
}

const Page = async () => {
  const { orgId, userId } = await getPageAuth();

  const [stats] = await Promise.all([getStatsData(orgId ?? undefined)]);

  return (
    <Container>
      <div className="space-y-8">
        <Suspense>
          <HeroSection userId={userId} />
        </Suspense>

        <div>
          <h2 className="text-2xl font-bold mb-4">Überblick</h2>
          <Suspense
            fallback={
              <div className="text-muted-foreground">
                Daten werden geladen...
              </div>
            }
          >
            <StatsSection stats={stats} />
          </Suspense>
        </div>

        <Suspense fallback={<DashboardList.skeleton />}>
          <DashboardList orgId={orgId} />
        </Suspense>

        <WorkflowTimeline />
      </div>
    </Container>
  );
};

export default Page;
