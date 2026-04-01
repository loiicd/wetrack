import { Suspense } from "react";
import Container from "@/components/layout/container";
import { HeroSection } from "@/components/home/heroSection";
import { RecentDashboards } from "@/components/home/recentDashboards";
import { StatsSection } from "@/components/home/statsSection";
import { WorkflowTimeline } from "@/components/home/workflowTimeline";
import { auth } from "@clerk/nextjs/server";
import { dashboardInterface } from "@/lib/database/dashboard";
import { stackInterface } from "@/lib/database/stack";
import { dataSourceInterface } from "@/lib/database/dataSource";
import { queryInterface } from "@/lib/database/query";

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

async function getRecentDashboards(orgId?: string) {
  try {
    const dashboards = await dashboardInterface.getMany(orgId);
    // Sort by updatedAt descending and take first 6
    const recent = dashboards
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      )
      .slice(0, 6);
    return recent;
  } catch (error) {
    console.error("Failed to fetch dashboards:", error);
    return [];
  }
}

const Page = async () => {
  const { orgId } = await auth();
  
  const [stats, dashboards] = await Promise.all([
    getStatsData(orgId ?? undefined),
    getRecentDashboards(orgId ?? undefined),
  ]);

  return (
    <Container>
      <div className="space-y-8">
        <HeroSection />

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

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">
              Zuletzt aktualisierte Dashboards
            </h2>
          </div>
          <Suspense fallback={<div>Laden...</div>}>
            <RecentDashboards dashboards={dashboards} />
          </Suspense>
        </div>

        <WorkflowTimeline />
      </div>
    </Container>
  );
};

export default Page;
