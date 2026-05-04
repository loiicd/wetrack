import { describe, it, expect } from "vitest";
import { cn, getInitials, stableSerialize } from "../utils";

describe("cn (className merger)", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes with clsx", () => {
    expect(cn("foo", false && "bar", "baz")).toBe("foo baz");
    expect(cn("foo", true && "bar")).toBe("foo bar");
  });

  it("deduplicates conflicting Tailwind classes (last wins)", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  it("handles undefined and null gracefully", () => {
    expect(cn("foo", undefined, null as never, "bar")).toBe("foo bar");
  });

  it("returns empty string for no args", () => {
    expect(cn()).toBe("");
  });

  it("handles object syntax from clsx", () => {
    expect(cn({ active: true, disabled: false })).toBe("active");
    expect(cn({ "p-2": true, "p-4": false })).toBe("p-2");
  });
});

describe("getInitials", () => {
  it("returns first letter of a single name uppercased", () => {
    expect(getInitials("Alice")).toBe("A");
  });

  it("returns first letters of first two words", () => {
    expect(getInitials("John Doe")).toBe("JD");
  });

  it("only uses first two words for three-word names", () => {
    expect(getInitials("Maria van Dam")).toBe("MV");
  });

  it("handles extra spaces", () => {
    expect(getInitials("  Alice  Bob  ")).toBe("AB");
  });

  it("returns U for empty string", () => {
    expect(getInitials("")).toBe("U");
  });

  it("uppercases lowercase input", () => {
    expect(getInitials("alice bob")).toBe("AB");
  });

  it("handles single character name", () => {
    expect(getInitials("X")).toBe("X");
  });
});

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
