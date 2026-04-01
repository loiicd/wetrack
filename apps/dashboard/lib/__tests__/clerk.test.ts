import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------
const mockClerkClient = vi.hoisted(() => ({
  users: {
    getOrganizationMembershipList: vi.fn(),
    getUser: vi.fn(),
  },
  organizations: {
    getOrganizationMembershipList: vi.fn(),
    updateOrganizationMembership: vi.fn(),
    deleteOrganizationMembership: vi.fn(),
    createOrganizationInvitation: vi.fn(),
    getOrganization: vi.fn(),
  },
}));

vi.mock("@/lib/clerk/clerkClient", () => ({
  default: vi.fn().mockResolvedValue(mockClerkClient),
}));

import { membership } from "../clerk/membership";
import organizationInterface from "../clerk/organization";
import { userInterface } from "../clerk/user";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("membership", () => {
  describe("get (user memberships)", () => {
    it("returns membership list for a user", async () => {
      const data = [{ id: "m1" }, { id: "m2" }];
      mockClerkClient.users.getOrganizationMembershipList.mockResolvedValue({ data });

      const result = await membership.get("user_123");

      expect(mockClerkClient.users.getOrganizationMembershipList).toHaveBeenCalledWith({
        userId: "user_123",
        limit: 10,
      });
      expect(result).toEqual(data);
    });
  });

  describe("getByOrganization", () => {
    it("returns membership list for an organization", async () => {
      const data = [{ id: "m1", role: "org:admin" }];
      mockClerkClient.organizations.getOrganizationMembershipList.mockResolvedValue({ data });

      const result = await membership.getByOrganization("org_123");

      expect(mockClerkClient.organizations.getOrganizationMembershipList).toHaveBeenCalledWith({
        organizationId: "org_123",
        limit: 10,
      });
      expect(result).toEqual(data);
    });
  });

  describe("updateRole", () => {
    it("calls updateOrganizationMembership with correct args", async () => {
      mockClerkClient.organizations.updateOrganizationMembership.mockResolvedValue({});

      await membership.updateRole("org_123", "user_456", "org:admin");

      expect(mockClerkClient.organizations.updateOrganizationMembership).toHaveBeenCalledWith({
        organizationId: "org_123",
        userId: "user_456",
        role: "org:admin",
      });
    });
  });

  describe("delete", () => {
    it("calls deleteOrganizationMembership with correct args", async () => {
      mockClerkClient.organizations.deleteOrganizationMembership.mockResolvedValue({});

      await membership.delete("org_123", "user_456");

      expect(mockClerkClient.organizations.deleteOrganizationMembership).toHaveBeenCalledWith({
        organizationId: "org_123",
        userId: "user_456",
      });
    });
  });

  describe("invite", () => {
    it("creates an organization invitation with correct args", async () => {
      mockClerkClient.organizations.createOrganizationInvitation.mockResolvedValue({});

      await membership.invite("org_123", "new@example.com", "org:member", "user_inviter");

      expect(mockClerkClient.organizations.createOrganizationInvitation).toHaveBeenCalledWith({
        organizationId: "org_123",
        emailAddress: "new@example.com",
        role: "org:member",
        inviterUserId: "user_inviter",
      });
    });
  });
});

describe("organizationInterface", () => {
  describe("get", () => {
    it("returns organization data", async () => {
      const orgData = { id: "org_123", name: "Acme Corp", imageUrl: "https://img.clerk.com/org.png" };
      mockClerkClient.organizations.getOrganization.mockResolvedValue(orgData);

      const result = await organizationInterface.get("org_123");

      expect(mockClerkClient.organizations.getOrganization).toHaveBeenCalledWith({
        organizationId: "org_123",
      });
      expect(result).toEqual(orgData);
    });

    it("propagates Clerk API errors", async () => {
      mockClerkClient.organizations.getOrganization.mockRejectedValue(
        new Error("Organization not found"),
      );

      await expect(organizationInterface.get("invalid")).rejects.toThrow("Organization not found");
    });
  });
});

describe("userInterface", () => {
  describe("get", () => {
    it("returns user data for a given userId", async () => {
      const userData = { id: "user_123", firstName: "Alice" };
      mockClerkClient.users.getUser.mockResolvedValue(userData);

      const result = await userInterface.get("user_123");

      expect(mockClerkClient.users.getUser).toHaveBeenCalledWith("user_123");
      expect(result).toEqual(userData);
    });

    it("propagates errors from Clerk API", async () => {
      mockClerkClient.users.getUser.mockRejectedValue(new Error("User not found"));

      await expect(userInterface.get("bad-id")).rejects.toThrow("User not found");
    });
  });
});
