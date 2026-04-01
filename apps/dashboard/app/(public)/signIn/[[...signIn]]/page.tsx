import { Suspense } from "react";
import { SignInForm } from "@/components/auth/SignInForm";

const Page = () => {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  );
};

export default Page;
