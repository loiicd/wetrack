import { dashboardInterface } from "@/lib/database/dashboard";
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";
import Link from "next/link";
import { connection } from "next/server";

const DashboardList = async ({ stackKey }: { stackKey: string }) => {
  await connection();
  const dashboards = await dashboardInterface.getByStackKey(stackKey);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {dashboards.map((dashboard) => (
        <Link key={dashboard.id} href={`/dashboard/${dashboard.id}`}>
          <Card>
            <CardHeader>
              <CardTitle>{dashboard.label}</CardTitle>
              <CardDescription>
                {dashboard.updatedAt.toLocaleDateString("de-DE")}{" "}
                {dashboard.updatedAt.toLocaleTimeString("de-DE")}
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      ))}
    </div>
  );
};

export default DashboardList;
