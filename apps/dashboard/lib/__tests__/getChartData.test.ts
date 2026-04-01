import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Mocks – declared before SUT imports
// ---------------------------------------------------------------------------
vi.mock("@/lib/database/dataSource", () => ({
  dataSourceInterface: { getById: vi.fn() },
}));
vi.mock("@/lib/database/credential", () => ({
  credentialInterface: { getByLabel: vi.fn() },
}));
vi.mock("@/lib/vault/encryption", () => ({
  decryptSecret: vi.fn(),
}));
// next/cache: make unstable_cache a pass-through so we test real logic
vi.mock("next/cache", () => ({
  unstable_cache: (fn: () => unknown) => fn,
}));

import { dataSourceInterface } from "../database/dataSource";
import { credentialInterface } from "../database/credential";
import { decryptSecret } from "../vault/encryption";
import { getChartData } from "../workflows/getChartData";

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

  describe("credential injection", () => {
    const dsWithCred = mockDs({ config: { url: "https://api.example.com/data", method: "get", credential: "my-key" } });

    it("injects Bearer token for 'bearer' credential type", async () => {
      vi.mocked(dataSourceInterface.getById).mockResolvedValue(dsWithCred as never);
      vi.mocked(credentialInterface.getByLabel).mockResolvedValue({
        type: "bearer", encryptedValue: "enc", headerName: null,
      } as never);
      vi.mocked(decryptSecret).mockResolvedValue("secret-token");
      mockFetch({ ok: true });

      await getChartData("ds1");

      const fetchCall = vi.mocked(global.fetch).mock.calls[0];
      expect((fetchCall[1] as RequestInit).headers).toMatchObject({
        Authorization: "Bearer secret-token",
      });
    });

    it("injects X-Api-Key for 'api-key' credential type", async () => {
      vi.mocked(dataSourceInterface.getById).mockResolvedValue(dsWithCred as never);
      vi.mocked(credentialInterface.getByLabel).mockResolvedValue({
        type: "api-key", encryptedValue: "enc", headerName: null,
      } as never);
      vi.mocked(decryptSecret).mockResolvedValue("apikey123");
      mockFetch({ ok: true });

      await getChartData("ds1");

      const fetchCall = vi.mocked(global.fetch).mock.calls[0];
      expect((fetchCall[1] as RequestInit).headers).toMatchObject({ "X-Api-Key": "apikey123" });
    });

    it("injects Basic auth for 'basic' credential type", async () => {
      vi.mocked(dataSourceInterface.getById).mockResolvedValue(dsWithCred as never);
      vi.mocked(credentialInterface.getByLabel).mockResolvedValue({
        type: "basic", encryptedValue: "enc", headerName: null,
      } as never);
      vi.mocked(decryptSecret).mockResolvedValue("user:pass");
      mockFetch({ ok: true });

      await getChartData("ds1");

      const fetchCall = vi.mocked(global.fetch).mock.calls[0];
      const expected = `Basic ${Buffer.from("user:pass").toString("base64")}`;
      expect((fetchCall[1] as RequestInit).headers).toMatchObject({ Authorization: expected });
    });

    it("injects custom header for 'header' credential type", async () => {
      vi.mocked(dataSourceInterface.getById).mockResolvedValue(dsWithCred as never);
      vi.mocked(credentialInterface.getByLabel).mockResolvedValue({
        type: "header", encryptedValue: "enc", headerName: "X-Custom-Key",
      } as never);
      vi.mocked(decryptSecret).mockResolvedValue("custom-value");
      mockFetch({ ok: true });

      await getChartData("ds1");

      const fetchCall = vi.mocked(global.fetch).mock.calls[0];
      expect((fetchCall[1] as RequestInit).headers).toMatchObject({ "X-Custom-Key": "custom-value" });
    });

    it("throws when 'header' credential has no headerName", async () => {
      vi.mocked(dataSourceInterface.getById).mockResolvedValue(dsWithCred as never);
      vi.mocked(credentialInterface.getByLabel).mockResolvedValue({
        type: "header", encryptedValue: "enc", headerName: null,
      } as never);
      vi.mocked(decryptSecret).mockResolvedValue("v");

      await expect(getChartData("ds1")).rejects.toThrow("no headerName");
    });

    it("throws when credential not found in vault", async () => {
      vi.mocked(dataSourceInterface.getById).mockResolvedValue(dsWithCred as never);
      vi.mocked(credentialInterface.getByLabel).mockResolvedValue(null);

      await expect(getChartData("ds1")).rejects.toThrow("not found in vault");
    });

    it("throws for unknown credential type", async () => {
      vi.mocked(dataSourceInterface.getById).mockResolvedValue(dsWithCred as never);
      vi.mocked(credentialInterface.getByLabel).mockResolvedValue({
        type: "unknown-type", encryptedValue: "enc", headerName: null,
      } as never);
      vi.mocked(decryptSecret).mockResolvedValue("v");

      await expect(getChartData("ds1")).rejects.toThrow("Unknown credential type");
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
