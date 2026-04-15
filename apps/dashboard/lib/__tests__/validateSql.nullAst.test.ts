import { describe, it, expect, vi } from "vitest";

// Mock BEFORE importing the module under test so Parser.astify returns a non-object
vi.mock("node-sql-parser", () => ({
  Parser: class {
    astify() {
      return [null];
    }
  },
}));

import { validateSql } from "../sql/validateSql";

describe("validateSql (non-object AST nodes)", () => {
  it("skips non-object AST nodes without throwing", () => {
    expect(() => validateSql("SELECT 1 FROM ?")).not.toThrow();
  });
});
