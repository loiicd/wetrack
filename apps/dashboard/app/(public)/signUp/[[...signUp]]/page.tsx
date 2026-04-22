import Container from "@/components/layout/container";
import { SignUp } from "@clerk/nextjs";

const Page = () => {
  return (
    <Container>
      <SignUp />
    </Container>
  );
};

export default Page;
