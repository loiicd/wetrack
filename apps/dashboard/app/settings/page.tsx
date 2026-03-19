import Container from "@/components/layout/container";
import MemberList from "@/components/memberList";
import { Suspense } from "react";

const Page = async () => {
  return (
    <Container>
      <section className="">
        <div className="container max-w-3xl">
          <Suspense>
            <MemberList />
          </Suspense>
        </div>
      </section>
    </Container>
  );
};

export default Page;
