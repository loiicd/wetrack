import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
}));

import { auth } from "@clerk/nextjs/server";
import { testAuth } from "../auth/testAuth";

beforeEach(() => vi.clearAllMocks());

describe("testAuth", () => {
  it("returns userId and orgId when authenticated", async () => {
    vi.mocked(auth).mockResolvedValue({
      userId: "user_abc",
      orgId: "org_xyz",
      isAuthenticated: true,
    } as never);

    const result = await testAuth();
    expect(result).toEqual({ userId: "user_abc", orgId: "org_xyz" });
  });

  it("throws when not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue({
      userId: null,
      orgId: null,
      isAuthenticated: false,
    } as never);

    await expect(testAuth()).rejects.toThrow("Unauthorized");
  });

  it("throws when userId is missing", async () => {
    vi.mocked(auth).mockResolvedValue({
      userId: null,
      orgId: "org_xyz",
      isAuthenticated: true,
    } as never);

    await expect(testAuth()).rejects.toThrow("Unauthorized");
  });

  it("throws when orgId is missing", async () => {
    vi.mocked(auth).mockResolvedValue({
      userId: "user_abc",
      orgId: null,
      isAuthenticated: true,
    } as never);

    await expect(testAuth()).rejects.toThrow("Unauthorized");
  });
});
