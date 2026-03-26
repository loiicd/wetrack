import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import BillingClient from "./billing-client";

const BillingPage = async () => {
  const { orgId } = await auth();
  if (!orgId) return notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-2xl font-semibold tracking-tight">Billing & Plans</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Verwalte dein Abonnement und deinen Plan.
        </p>
      </div>
      <BillingClient />
    </div>
  );
};

export default BillingPage;
