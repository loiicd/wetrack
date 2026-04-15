import { describe, it, expect, vi, beforeEach } from "vitest";

// Hoisted mocks
vi.mock("@clerk/nextjs/server", () => ({ auth: vi.fn() }));
vi.mock("@/lib/auth/authorization", () => ({ authorization: vi.fn() }));

import { auth } from "@clerk/nextjs/server";
import { authorization } from "@/lib/auth/authorization";
import { withAuth } from "@/lib/auth/withAuth";

beforeEach(() => vi.clearAllMocks());

describe("withAuth", () => {
  it("throws when orgId is missing", async () => {
    vi.mocked(auth).mockResolvedValue({
      userId: "user_1",
      isAuthenticated: true,
      orgId: null,
    } as never);
    vi.mocked(authorization).mockResolvedValue(true as never);

    await expect(
      withAuth("org:member", async () => "ok"),
    ).rejects.toThrow("Organization ID is required");
  });

  it("returns action result when authorized and orgId present", async () => {
    vi.mocked(auth).mockResolvedValue({
      userId: "user_abc",
      isAuthenticated: true,
      orgId: "org_123",
    } as never);
    vi.mocked(authorization).mockResolvedValue(true as never);

    const result = await withAuth("org:admin", async (userId, orgId) => {
      return { userId, orgId };
    });

    expect(result).toEqual({ userId: "user_abc", orgId: "org_123" });
  });
});
