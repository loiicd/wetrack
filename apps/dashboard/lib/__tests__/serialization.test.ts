import { describe, it, expect } from "vitest";
import { stableSerialize } from "../serialization";

describe("stableSerialize", () => {
  it("returns empty string for undefined", () => {
    expect(stableSerialize(undefined)).toBe("");
  });

  it("serializes a primitive value", () => {
    expect(stableSerialize(42)).toBe("42");
    expect(stableSerialize("hello")).toBe('"hello"');
  });

  it("serializes an array without sorting", () => {
    expect(stableSerialize([3, 1, 2])).toBe("[3,1,2]");
  });

  it("serializes object keys in sorted order", () => {
    expect(stableSerialize({ b: 2, a: 1 })).toBe('{"a":1,"b":2}');
  });

  it("produces the same output for objects with different key order", () => {
    const a = stableSerialize({ z: 26, a: 1, m: 13 });
    const b = stableSerialize({ m: 13, z: 26, a: 1 });
    expect(a).toBe(b);
  });

  it("handles nested objects with sorted keys", () => {
    const result = stableSerialize({ b: { d: 4, c: 3 }, a: 1 });
    expect(result).toBe('{"a":1,"b":{"c":3,"d":4}}');
  });

  it("falls back to String() for non-serializable input", () => {
    const circular: Record<string, unknown> = {};
    circular["self"] = circular;
    const result = stableSerialize(circular);
    expect(typeof result).toBe("string");
    expect(result).not.toBe("");
  });
});
