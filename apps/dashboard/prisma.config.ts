import "dotenv/config";
import { defineConfig } from "prisma/config";

const datasourceUrl =
  process.env.DATABASE_URL ??
  process.env.POSTGRES_PRISMA_URL ??
  process.env.POSTGRES_URL;

// Neon/Vercel provide a direct (non-pooled) URL which supports advisory locks
// required by Prisma migrations. Pooled connections via pgbouncer do not.
const directUrl =
  process.env.DIRECT_URL ??
  process.env.DATABASE_URL_UNPOOLED ??
  process.env.POSTGRES_URL_NON_POOLING ??
  datasourceUrl;

if (!datasourceUrl) {
  throw new Error(
    "Cannot resolve database URL. Set DATABASE_URL, POSTGRES_PRISMA_URL, or POSTGRES_URL.",
  );
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: directUrl,
  },
});
