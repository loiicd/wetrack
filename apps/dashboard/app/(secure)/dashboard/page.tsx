import Container from "@/components/layout/container";
import { Suspense } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
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
          <Link href="/dashboard/create">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Neues Dashboard
            </Button>
          </Link>
        </div>
        <Suspense fallback={<DashboardList.skeleton />}>
          <DashboardList orgId={orgId} />
        </Suspense>
      </div>
    </Container>
  );
};

export default Page;
