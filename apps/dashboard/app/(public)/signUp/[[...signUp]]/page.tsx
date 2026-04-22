import Container from "@/components/layout/container";
import { SignUp } from "@clerk/nextjs";

export const dynamic = "force-dynamic";

const Page = () => {
  return (
    <Container>
      <SignUp />
    </Container>
  );
};

export default Page;
