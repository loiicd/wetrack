import { describe, it, expect, vi, afterEach } from "vitest";
import { checkFeature, requireFeature } from "../billing/featureGate";

// Mock Clerk auth
vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
}));

// Mock next/navigation redirect
vi.mock("next/navigation", () => ({
  redirect: vi.fn(() => { throw new Error("NEXT_REDIRECT"); }),
}));

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

describe("checkFeature (billing gate)", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetAllMocks();
  });

  it("returns true when the feature is granted", async () => {
    vi.mocked(auth).mockResolvedValue({
      has: vi.fn().mockReturnValue(true),
    } as never);

    const result = await checkFeature("feature:deploy");
    expect(result).toBe(true);
  });

  it("returns false when the feature is not granted", async () => {
    vi.mocked(auth).mockResolvedValue({
      has: vi.fn().mockReturnValue(false),
    } as never);

    const result = await checkFeature("feature:deploy");
    expect(result).toBe(false);
  });

  it("returns false in production when billing is unavailable", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.mocked(auth).mockRejectedValue(new Error("Billing not configured"));

    const result = await checkFeature("feature:credential_vault");
    expect(result).toBe(false);
  });

  it("returns true in development when billing is unavailable", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.mocked(auth).mockRejectedValue(new Error("Billing not configured"));

    const result = await checkFeature("feature:unlimited_dashboards");
    expect(result).toBe(true);
  });
});

describe("requireFeature", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetAllMocks();
  });

  it("does not redirect when feature is granted", async () => {
    vi.mocked(auth).mockResolvedValue({
      has: vi.fn().mockReturnValue(true),
    } as never);

    await expect(requireFeature("feature:deploy")).resolves.toBeUndefined();
    expect(redirect).not.toHaveBeenCalled();
  });

  it("redirects to billing page when feature is not granted", async () => {
    vi.mocked(auth).mockResolvedValue({
      has: vi.fn().mockReturnValue(false),
    } as never);

    await expect(requireFeature("feature:deploy")).rejects.toThrow("NEXT_REDIRECT");
    expect(redirect).toHaveBeenCalledWith("/settings/billing");
  });
});
