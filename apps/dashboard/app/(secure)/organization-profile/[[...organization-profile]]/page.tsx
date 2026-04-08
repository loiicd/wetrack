import Container from "@/components/layout/container";
import { OrganizationProfile } from "@clerk/nextjs";

const Page = () => {
  return (
    <Container>
      <div className="flex flex-col justify-center items-center">
        <OrganizationProfile />
      </div>
    </Container>
  );
};

export default Page;
