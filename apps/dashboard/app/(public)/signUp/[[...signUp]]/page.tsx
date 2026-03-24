import { Suspense } from "react";
import { SignUp } from "@clerk/nextjs";

const Page = () => {
  return (
    <Suspense>
      <SignUp />
    </Suspense>
  );
};

export default Page;
