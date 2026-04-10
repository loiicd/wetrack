import { Suspense } from "react";
import Container from "@/components/layout/container";
import HeroSection from "@/components/sections/heroSection";
import { getPageAuth } from "@/lib/auth/getPageAuth";
import DashboardList from "@/components/lists/dashboardList";

const Page = async () => {
  const { orgId, userId } = await getPageAuth();

  return (
    <Container>
      <div className="space-y-8">
        <Suspense>
          <HeroSection userId={userId} />
        </Suspense>

        <h1>Dashboards</h1>
        <Suspense fallback={<DashboardList.skeleton />}>
          <DashboardList orgId={orgId} />
        </Suspense>
      </div>
    </Container>
  );
};

export default Page;
