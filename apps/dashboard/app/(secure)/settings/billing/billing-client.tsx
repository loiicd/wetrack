"use client";

import { PricingTable } from "@clerk/nextjs";

const BillingClient = () => {
  return (
    <div className="rounded-lg border bg-card p-1">
      <PricingTable />
    </div>
  );
};

export default BillingClient;
