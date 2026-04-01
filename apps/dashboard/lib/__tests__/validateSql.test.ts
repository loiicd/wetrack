import { describe, it, expect } from "vitest";
import { validateSql } from "../sql/validateSql";

describe("validateSql", () => {
  describe("allows valid SELECT statements", () => {
    it("accepts a basic SELECT", () => {
      expect(() => validateSql("SELECT * FROM ?")).not.toThrow();
    });

    it("accepts SELECT with WHERE", () => {
      expect(() =>
        validateSql("SELECT id, name FROM ? WHERE active = 1"),
      ).not.toThrow();
    });

    it("accepts SELECT with GROUP BY and ORDER BY", () => {
      expect(() =>
        validateSql(
          "SELECT product, SUM(revenue) AS total FROM ? GROUP BY product ORDER BY total DESC",
        ),
      ).not.toThrow();
    });

    it("accepts SELECT with LIMIT", () => {
      expect(() =>
        validateSql("SELECT * FROM ? LIMIT 10"),
      ).not.toThrow();
    });

    it("accepts SELECT with JOIN", () => {
      expect(() =>
        validateSql("SELECT a.id, b.name FROM ? a JOIN ? b ON a.id = b.id"),
      ).not.toThrow();
    });

    it("accepts multiple ? placeholders", () => {
      expect(() =>
        validateSql("SELECT * FROM ? WHERE id IN (SELECT id FROM ?)"),
      ).not.toThrow();
    });
  });

  describe("blocks dangerous SQL statements", () => {
    it("rejects INSERT", () => {
      expect(() =>
        validateSql("INSERT INTO ? (name) VALUES ('test')"),
      ).toThrow("not allowed");
    });

    it("rejects UPDATE", () => {
      expect(() =>
        validateSql("UPDATE ? SET name = 'x' WHERE id = 1"),
      ).toThrow("not allowed");
    });

    it("rejects DELETE", () => {
      expect(() => validateSql("DELETE FROM ? WHERE id = 1")).toThrow(
        "not allowed",
      );
    });

    it("rejects DROP TABLE", () => {
      expect(() => validateSql("DROP TABLE users")).toThrow("not allowed");
    });

    it("rejects CREATE TABLE", () => {
      expect(() =>
        validateSql("CREATE TABLE x (id INT)"),
      ).toThrow("not allowed");
    });
  });

  describe("handles invalid SQL syntax", () => {
    it("throws on completely invalid SQL", () => {
      expect(() => validateSql("THIS IS NOT SQL AT ALL !!!")).toThrow();
    });
  });
});
