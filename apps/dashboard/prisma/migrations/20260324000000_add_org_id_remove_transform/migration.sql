-- Add orgId to Stack with a default for existing rows
ALTER TABLE "Stack" ADD COLUMN "orgId" TEXT NOT NULL DEFAULT 'system';

-- Drop the old unique index
DROP INDEX "Stack_key_environment_key";

-- Add new unique constraint including orgId
ALTER TABLE "Stack" ADD CONSTRAINT "Stack_key_environment_orgId_key" UNIQUE ("key", "environment", "orgId");

-- Drop Transform table and its dependencies
DROP TABLE IF EXISTS "Transform";

-- Drop TransformFunction enum
DROP TYPE IF EXISTS "TransformFunction";

-- Drop old Credential table (was stack-scoped)
DROP TABLE IF EXISTS "Credential";

-- Create new org-scoped Credential Vault table
CREATE TABLE "Credential" (
  "id"             TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "orgId"          TEXT NOT NULL,
  "label"          TEXT NOT NULL,
  "type"           TEXT NOT NULL,
  "encryptedValue" TEXT NOT NULL,
  "headerName"     TEXT,
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Credential_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Credential_orgId_label_key" UNIQUE ("orgId", "label")
);
