import Container from "@/components/layout/container";
import DatasourceTable from "@/components/table/datasourceTable";
import { Suspense } from "react";

const Page = () => {
  return (
    <Container>
      <Suspense>
        <DatasourceTable />
      </Suspense>
    </Container>
  );
};

export default Page;
