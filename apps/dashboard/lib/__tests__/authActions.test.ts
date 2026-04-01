import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock all dependencies
vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/clerk/membership", () => ({
  membership: {
    invite: vi.fn(),
    delete: vi.fn(),
    updateRole: vi.fn(),
    getByOrganization: vi.fn(),
  },
}));

vi.mock("@/lib/clerk/clerkClient", () => ({
  default: vi.fn(),
}));

import { auth } from "@clerk/nextjs/server";
import { membership } from "@/lib/clerk/membership";
import { inviteMembership } from "@/actions/membership/invite";
import { deleteMembership } from "@/actions/membership/delete";
import { updateRole } from "@/actions/membership/updateRole";
import { deleteOrganization } from "@/actions/organization/delete";
import clerkClient from "@/lib/clerk/clerkClient";

const mockAuth = (overrides: {
  userId?: string;
  orgId?: string;
  isAuthenticated?: boolean;
  has?: (role: { role: string }) => boolean;
}) => {
  vi.mocked(auth).mockResolvedValue({
    userId: overrides.userId ?? "user_123",
    orgId: overrides.orgId ?? "org_123",
    isAuthenticated: overrides.isAuthenticated ?? true,
    has: overrides.has ?? (() => true),
  } as never);
};

describe("inviteMembership", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth({});
  });

  it("invites a member successfully", async () => {
    vi.mocked(membership.invite).mockResolvedValue(undefined as never);

    const result = await inviteMembership("test@example.com", "org:member");

    expect(result.success).toBe(true);
    expect(membership.invite).toHaveBeenCalledWith(
      "org_123",
      "test@example.com",
      "org:member",
      "user_123",
    );
  });

  it("returns error when unauthorized", async () => {
    mockAuth({ isAuthenticated: false, userId: undefined as never });

    const result = await inviteMembership("test@example.com", "org:member");

    expect(result.success).toBe(false);
    expect((result as { error: string }).error).toBeTruthy();
  });

  it("returns error when not admin", async () => {
    mockAuth({ has: () => false });

    const result = await inviteMembership("test@example.com", "org:member");

    expect(result.success).toBe(false);
    expect((result as { error: string }).error).toContain("Forbidden");
  });

  it("wraps membership.invite error correctly", async () => {
    vi.mocked(membership.invite).mockRejectedValue(
      new Error("Email already invited"),
    );

    const result = await inviteMembership("test@example.com", "org:member");

    expect(result.success).toBe(false);
    expect((result as { error: string }).error).toBe("Email already invited");
  });
});

describe("deleteMembership", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth({});
  });

  it("removes a member successfully", async () => {
    vi.mocked(membership.delete).mockResolvedValue(undefined as never);

    const result = await deleteMembership("user_to_remove");

    expect(result.success).toBe(true);
    expect(membership.delete).toHaveBeenCalledWith("org_123", "user_to_remove");
  });

  it("returns error when not admin", async () => {
    mockAuth({ has: () => false });

    const result = await deleteMembership("user_to_remove");

    expect(result.success).toBe(false);
    expect((result as { error: string }).error).toContain("Forbidden");
  });
});

describe("updateRole", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth({});
  });

  it("updates role successfully for non-last-admin", async () => {
    vi.mocked(membership.getByOrganization).mockResolvedValue([
      {
        role: "org:admin",
        publicUserData: { userId: "other_admin" },
      },
      {
        role: "org:admin",
        publicUserData: { userId: "user_123" },
      },
    ] as never);
    vi.mocked(membership.updateRole).mockResolvedValue(undefined as never);

    const result = await updateRole("user_123", "org:member");

    expect(result.success).toBe(true);
    expect(membership.updateRole).toHaveBeenCalledWith(
      "org_123",
      "user_123",
      "org:member",
    );
  });

  it("blocks downgrading the last admin", async () => {
    vi.mocked(membership.getByOrganization).mockResolvedValue([
      {
        role: "org:admin",
        publicUserData: { userId: "user_123" },
      },
    ] as never);

    const result = await updateRole("user_123", "org:member");

    expect(result.success).toBe(false);
    expect((result as { error: string }).error).toContain("last admin");
    expect(membership.updateRole).not.toHaveBeenCalled();
  });

  it("allows upgrading a member to admin even if only one admin", async () => {
    vi.mocked(membership.updateRole).mockResolvedValue(undefined as never);

    const result = await updateRole("user_456", "org:admin");

    expect(result.success).toBe(true);
    expect(membership.getByOrganization).not.toHaveBeenCalled();
  });
});

describe("deleteOrganization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth({});
  });

  it("deletes the organization successfully", async () => {
    const mockClient = {
      organizations: {
        deleteOrganization: vi.fn().mockResolvedValue(undefined),
      },
    };
    vi.mocked(clerkClient).mockResolvedValue(mockClient as never);

    const result = await deleteOrganization();

    expect(result.success).toBe(true);
    expect(mockClient.organizations.deleteOrganization).toHaveBeenCalledWith(
      "org_123",
    );
  });

  it("returns error when not admin", async () => {
    mockAuth({ has: () => false });

    const result = await deleteOrganization();

    expect(result.success).toBe(false);
    expect((result as { error: string }).error).toContain("Forbidden");
  });

  it("returns error when clerk API fails", async () => {
    const mockClient = {
      organizations: {
        deleteOrganization: vi
          .fn()
          .mockRejectedValue(new Error("Organization not found")),
      },
    };
    vi.mocked(clerkClient).mockResolvedValue(mockClient as never);

    const result = await deleteOrganization();

    expect(result.success).toBe(false);
    expect((result as { error: string }).error).toBe("Organization not found");
  });
});
