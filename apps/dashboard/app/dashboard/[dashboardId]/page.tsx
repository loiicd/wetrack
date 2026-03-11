import ChartGrid from "@/components/chartGrid";
import DashboardBreadcrumb from "@/components/dashbordBreadcrumb";
import Container from "@/components/layout/container";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { dashboardInterface } from "@/lib/database/dashboard";
import { notFound } from "next/navigation";
import { Suspense } from "react";

const DashboardContent = async ({
  props,
}: {
  props: PageProps<"/dashboard/[dashboardId]">;
}) => {
  const { dashboardId } = await props.params;

  const dashboard = await dashboardInterface.getById(dashboardId);

  if (!dashboard) {
    return notFound();
  }

  const widgets = [
    {
      id: "1",
      x: 0,
      y: 0,
      w: 2,
      h: 1,
      content: (
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Widget 1</CardTitle>
          </CardHeader>
        </Card>
      ),
    },
    {
      id: "2",
      x: 2,
      y: 0,
      w: 1,
      h: 2,
      content: (
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Widget 2</CardTitle>
          </CardHeader>
        </Card>
      ),
    },
    {
      id: "3",
      x: 0,
      y: 1,
      w: 2,
      h: 1,
      content: (
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Widget 3</CardTitle>
          </CardHeader>
        </Card>
      ),
    },
    {
      id: "4",
      x: 0,
      y: 2,
      w: 12,
      h: 3,
      content: (
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Widget 4</CardTitle>
          </CardHeader>
        </Card>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <DashboardBreadcrumb />
      <div className="bg-gray-200 p-2 rounded">{dashboard.title}</div>
      <ChartGrid widgets={widgets} />
    </div>
  );
};

const Page = (props: PageProps<"/dashboard/[dashboardId]">) => {
  return (
    <Container>
      <Suspense fallback={<div>Loading dashboard…</div>}>
        <DashboardContent props={props} />
      </Suspense>
    </Container>
  );
};

export default Page;
