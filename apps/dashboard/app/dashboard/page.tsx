"use cache";

import DashboardList from "@/components/dashbaordList";
import Container from "@/components/layout/container";
import { cacheLife } from "next/cache";
import { Suspense } from "react";

const Page = async () => {
  cacheLife("weeks");

  return (
    <Container>
      <Suspense>
        <DashboardList stackKey="main-stack" />
      </Suspense>
    </Container>
  );
};

export default Page;
