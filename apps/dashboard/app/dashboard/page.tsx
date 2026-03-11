import DashboardCard from "@/components/cards/dashboardCard";
import Container from "@/components/layout/container";
import { dashboardInterface } from "@/lib/database/dashboard";

const Page = async () => {
  const dashboards = await dashboardInterface.getMany();

  return (
    <Container>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {dashboards.map((dashboard) => (
          <DashboardCard key={dashboard.id} dashboard={dashboard} />
        ))}
      </div>
    </Container>
  );
};

export default Page;
