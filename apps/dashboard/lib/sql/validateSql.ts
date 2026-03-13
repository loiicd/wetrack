import { Parser } from "node-sql-parser";

const ALLOWED_TYPES = new Set(["select"]);
const parser = new Parser();

/**
 * Validates that a SQL string only contains SELECT statements (with JOINs).
 * Throws if INSERT, UPDATE, DELETE, DROP, CREATE or any other DML/DDL is detected.
 *
 * alasql uses `?` as table placeholder – replaced with `_t` before parsing.
 */
export const validateSql = (sql: string): void => {
  // alasql-Platzhalter ? durch gültigen Tabellennamen ersetzen damit der Parser nicht meckert
  let counter = 0;
  const normalizedSql = sql.replace(/\?/g, () => `_t${counter++}`);

  let ast;
  try {
    ast = parser.astify(normalizedSql, { database: "MySQL" });
  } catch (e) {
    throw new Error(`Invalid SQL syntax: ${(e as Error).message}`);
  }

  const statements = Array.isArray(ast) ? ast : [ast];

  for (const stmt of statements) {
    if (!stmt || typeof stmt !== "object") continue;
    const type = (stmt as { type?: string }).type?.toLowerCase() ?? "unknown";

    if (!ALLOWED_TYPES.has(type)) {
      throw new Error(
        `SQL statement type '${type}' is not allowed. Only SELECT (with JOIN) is permitted.`,
      );
    }
  }
};
