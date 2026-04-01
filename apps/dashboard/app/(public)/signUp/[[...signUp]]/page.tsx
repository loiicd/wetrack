import { Suspense } from "react";
import { SignUpForm } from "@/components/auth/SignUpForm";

const Page = () => {
  return (
    <Suspense>
      <SignUpForm />
    </Suspense>
  );
};

export default Page;
