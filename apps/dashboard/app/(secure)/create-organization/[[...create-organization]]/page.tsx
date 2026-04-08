import Container from "@/components/layout/container";
import { CreateOrganization } from "@clerk/nextjs";

const Page = () => {
  return (
    <Container>
      <div className="flex flex-col justify-center items-center">
        <CreateOrganization />
      </div>
    </Container>
  );
};

export default Page;
