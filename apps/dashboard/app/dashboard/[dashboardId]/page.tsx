import { dashboardInterface } from "@/lib/database/dashboard";
import { notFound } from "next/navigation";
import { Suspense } from "react";

const DashboardContent = async ({
  params,
}: {
  params: PageProps<"/dashboard/[dashboardId]">["params"];
}) => {
  const { dashboardId } = await params;

  const dashboard = await dashboardInterface.getById(dashboardId);

  if (!dashboard) {
    return notFound();
  }

  return <div>{dashboard.name}</div>;
};

const Page = (props: PageProps<"/dashboard/[dashboardId]">) => {
  return (
    <Suspense fallback={<div>Loading dashboard…</div>}>
      <DashboardContent params={props.params} />
    </Suspense>
  );
};

export default Page;
