"use client";

import { APIKeys } from "@clerk/nextjs";

const ApiKeysClient = () => {
  return (
    <div className="rounded-lg border bg-card">
      <APIKeys />
    </div>
  );
};

export default ApiKeysClient;
