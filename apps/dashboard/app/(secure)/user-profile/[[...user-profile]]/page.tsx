import Container from "@/components/layout/container";
import { UserProfile } from "@clerk/nextjs";

const Page = () => {
  return (
    <Container>
      <div className="flex flex-col justify-center items-center">
        <UserProfile />
      </div>
    </Container>
  );
};

export default Page;
