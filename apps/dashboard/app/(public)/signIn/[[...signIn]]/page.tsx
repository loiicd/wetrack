import Container from "@/components/layout/container";
import { SignIn } from "@clerk/nextjs";

export const dynamic = "force-dynamic";

const Page = () => {
  return (
    <Container>
      <SignIn />
    </Container>
  );
};

export default Page;
