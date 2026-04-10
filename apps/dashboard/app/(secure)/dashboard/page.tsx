import Container from "@/components/layout/container";
import { Suspense } from "react";
import DashboardList from "@/components/lists/dashboardList";
import { getPageAuth } from "@/lib/auth/getPageAuth";

const Page = async () => {
  const { orgId } = await getPageAuth();

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
        </div>
        <Suspense fallback={<DashboardList.skeleton />}>
          <DashboardList orgId={orgId} />
        </Suspense>
      </div>
    </Container>
  );
};

export default Page;
