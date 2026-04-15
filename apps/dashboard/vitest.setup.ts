import { vi } from "vitest";

// Provide a lightweight mocked Prisma-like client for tests so DB calls don't try to connect.
// Mock only the methods the codebase uses (extend as needed).

const mockFilter = {
  findMany: vi.fn().mockResolvedValue([]),
  upsert: vi.fn().mockResolvedValue({}),
  deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
};

const mockPrisma = {
  filter: mockFilter,
  // Minimal $transaction mock: if passed an array of functions, run them and return results
  $transaction: vi.fn().mockImplementation(async (work: any) => {
    if (Array.isArray(work)) {
      return Promise.all(work.map((w) => (typeof w === "function" ? w(mockPrisma) : w)));
    }
    if (typeof work === "function") return work(mockPrisma);
    return work;
  }),
};

vi.mock("@/lib/database/prisma", () => ({
  default: mockPrisma,
}));

// If other tests import prisma from different paths, extend mocks here as needed.
