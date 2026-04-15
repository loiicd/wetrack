import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Mocks – declared before SUT imports
// ---------------------------------------------------------------------------
vi.mock("@/lib/database/dataSource", () => ({
  dataSourceInterface: { getById: vi.fn() },
}));

const mockGetSecret = vi.fn();
const mockGetInfisicalClient = vi.fn().mockResolvedValue({
  secrets: () => ({
    getSecret: mockGetSecret,
  }),
});

vi.mock("@/lib/vault/infisical", () => ({
  getInfisicalClient: (...args: unknown[]) => mockGetInfisicalClient(...args),
  getProjectId: () => "test-project",
  getEnvironment: () => "prod",
  getSecretPath: (orgId: string) => `/${orgId}`,
}));

// next/cache: make unstable_cache a pass-through so we test real logic
vi.mock("next/cache", () => ({
  unstable_cache: (fn: () => unknown) => fn,
}));

import { dataSourceInterface } from "../database/dataSource";
import { getChartData } from "../workflows/getChartData";
import { CredentialError } from "../errors/CredentialError";

const mockDs = (overrides: object = {}) => ({
  id: "ds1",
  stack: { orgId: "org1" },
  config: { url: "https://api.example.com/data", method: "get" },
  ...overrides,
});

const mockFetch = (body: unknown, status = 200, contentType = "application/json") => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? "OK" : "Error",
    headers: { get: () => contentType },
    text: () => Promise.resolve(typeof body === "string" ? body : JSON.stringify(body)),
  } as never);
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getChartData", () => {
  it("throws when data source not found", async () => {
    vi.mocked(dataSourceInterface.getById).mockResolvedValue(null);
    await expect(getChartData("missing")).rejects.toThrow("Data source not found");
  });

  it("fetches and returns JSON data successfully", async () => {
    vi.mocked(dataSourceInterface.getById).mockResolvedValue(mockDs() as never);
    mockFetch([{ id: 1, value: 42 }]);

    const result = await getChartData("ds1");
    expect(result).toEqual([{ id: 1, value: 42 }]);
  });

  it("throws when HTTP response is not OK (404)", async () => {
    vi.mocked(dataSourceInterface.getById).mockResolvedValue(mockDs() as never);
    mockFetch({}, 404, "application/json");

    await expect(getChartData("ds1")).rejects.toThrow("DataSource request failed: 404");
  });

  it("throws when response is not JSON", async () => {
    vi.mocked(dataSourceInterface.getById).mockResolvedValue(mockDs() as never);
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => "text/html" },
      text: () => Promise.resolve("<html>"),
    } as never);

    await expect(getChartData("ds1")).rejects.toThrow("non-JSON content-type");
  });

  it("throws when response body exceeds 5 MB", async () => {
    vi.mocked(dataSourceInterface.getById).mockResolvedValue(mockDs() as never);
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => "application/json" },
      text: () => Promise.resolve("x".repeat(5_000_001)),
    } as never);

    await expect(getChartData("ds1")).rejects.toThrow("too large");
  });

  describe("credential injection via Infisical", () => {
    const dsWithCred = mockDs({ config: { url: "https://api.example.com/data", method: "get", credential: "my-key" } });

    it("injects Bearer token for 'bearer' credential type", async () => {
      vi.mocked(dataSourceInterface.getById).mockResolvedValue(dsWithCred as never);
      mockGetSecret.mockResolvedValue({
        secretValue: "secret-token",
        secretComment: JSON.stringify({ type: "bearer" }),
      });
      mockFetch({ ok: true });

      await getChartData("ds1");

      const fetchCall = vi.mocked(global.fetch).mock.calls[0];
      expect((fetchCall[1] as RequestInit).headers).toMatchObject({
        Authorization: "Bearer secret-token",
      });
    });

    it("injects X-Api-Key for 'api-key' credential type", async () => {
      vi.mocked(dataSourceInterface.getById).mockResolvedValue(dsWithCred as never);
      mockGetSecret.mockResolvedValue({
        secretValue: "apikey123",
        secretComment: JSON.stringify({ type: "api-key" }),
      });
      mockFetch({ ok: true });

      await getChartData("ds1");

      const fetchCall = vi.mocked(global.fetch).mock.calls[0];
      expect((fetchCall[1] as RequestInit).headers).toMatchObject({ "X-Api-Key": "apikey123" });
    });

    it("injects Basic auth for 'basic' credential type", async () => {
      vi.mocked(dataSourceInterface.getById).mockResolvedValue(dsWithCred as never);
      mockGetSecret.mockResolvedValue({
        secretValue: "user:pass",
        secretComment: JSON.stringify({ type: "basic" }),
      });
      mockFetch({ ok: true });

      await getChartData("ds1");

      const fetchCall = vi.mocked(global.fetch).mock.calls[0];
      const expected = `Basic ${Buffer.from("user:pass").toString("base64")}`;
      expect((fetchCall[1] as RequestInit).headers).toMatchObject({ Authorization: expected });
    });

    it("injects custom header for 'header' credential type", async () => {
      vi.mocked(dataSourceInterface.getById).mockResolvedValue(dsWithCred as never);
      mockGetSecret.mockResolvedValue({
        secretValue: "custom-value",
        secretComment: JSON.stringify({ type: "header", headerName: "X-Custom-Key" }),
      });
      mockFetch({ ok: true });

      await getChartData("ds1");

      const fetchCall = vi.mocked(global.fetch).mock.calls[0];
      expect((fetchCall[1] as RequestInit).headers).toMatchObject({ "X-Custom-Key": "custom-value" });
    });

    it("throws CredentialError when 'header' credential has no headerName", async () => {
      vi.mocked(dataSourceInterface.getById).mockResolvedValue(dsWithCred as never);
      mockGetSecret.mockResolvedValue({
        secretValue: "v",
        secretComment: JSON.stringify({ type: "header" }),
      });

      await expect(getChartData("ds1")).rejects.toThrow("no headerName");
      await expect(getChartData("ds1")).rejects.toBeInstanceOf(CredentialError);
    });

    it("throws CredentialError when credential not found in Infisical", async () => {
      vi.mocked(dataSourceInterface.getById).mockResolvedValue(dsWithCred as never);
      mockGetSecret.mockRejectedValue(new Error("Secret not found"));

      await expect(getChartData("ds1")).rejects.toThrow("not found in vault");
      await expect(getChartData("ds1")).rejects.toBeInstanceOf(CredentialError);
    });

    it("throws CredentialError for unknown credential type", async () => {
      vi.mocked(dataSourceInterface.getById).mockResolvedValue(dsWithCred as never);
      mockGetSecret.mockResolvedValue({
        secretValue: "v",
        secretComment: JSON.stringify({ type: "unknown-type" }),
      });

      await expect(getChartData("ds1")).rejects.toThrow("Unknown credential type");
      await expect(getChartData("ds1")).rejects.toBeInstanceOf(CredentialError);
    });

    it("defaults to api-key type when no comment metadata", async () => {
      vi.mocked(dataSourceInterface.getById).mockResolvedValue(dsWithCred as never);
      mockGetSecret.mockResolvedValue({
        secretValue: "my-api-key-value",
        secretComment: "",
      });
      mockFetch({ ok: true });

      await getChartData("ds1");

      const fetchCall = vi.mocked(global.fetch).mock.calls[0];
      expect((fetchCall[1] as RequestInit).headers).toMatchObject({ "X-Api-Key": "my-api-key-value" });
    });
  });

  it("sends body and custom headers for POST requests", async () => {
    vi.mocked(dataSourceInterface.getById).mockResolvedValue({
      ...mockDs(),
      config: {
        url: "https://api.example.com/data",
        method: "post",
        headers: { "X-Custom": "value" },
        body: { filter: "active" },
      },
    } as never);
    mockFetch({ result: "ok" });

    await getChartData("ds1");

    const fetchCall = vi.mocked(global.fetch).mock.calls[0];
    const init = fetchCall[1] as RequestInit;
    expect(init.body).toBe(JSON.stringify({ filter: "active" }));
    expect((init.headers as Record<string, string>)["X-Custom"]).toBe("value");
  });
});
