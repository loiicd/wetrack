import Container from "@/components/layout/container";
import QueryTable from "@/components/table/queryTable";
import { Suspense } from "react";

const Page = () => {
  return (
    <Container>
      <Suspense>
        <QueryTable />
      </Suspense>
    </Container>
  );
};

export default Page;
