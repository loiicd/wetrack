import Container from "@/components/layout/container";
import { SignIn } from "@clerk/nextjs";

const Page = () => {
  return (
    <Container>
      <SignIn />
    </Container>
  );
};

export default Page;
