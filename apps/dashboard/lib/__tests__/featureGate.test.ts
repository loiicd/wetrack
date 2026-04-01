import { describe, it, expect, vi, afterEach } from "vitest";
import { checkFeature } from "../billing/featureGate";

// Mock Clerk auth
vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
}));

import { auth } from "@clerk/nextjs/server";

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
