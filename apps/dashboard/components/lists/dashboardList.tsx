import { dashboardInterface } from "@/lib/database/dashboard";
import { auth } from "@clerk/nextjs/server";
import DashboardListItem from "./dashboardListItem";

type Props = {
  orgId: string;
};

const DashboardList = async ({ orgId }: Props) => {
  const dashboards = await dashboardInterface.getMany(orgId);

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
