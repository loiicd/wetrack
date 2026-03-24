import { Suspense } from "react";
import { SignIn } from "@clerk/nextjs";

const Page = () => {
  return (
    <Suspense>
      <SignIn />
    </Suspense>
  );
};

export default Page;
