-- CreateEnum
CREATE TYPE "Environment" AS ENUM ('PRODUCTION', 'STAGING', 'DEVELOPMENT');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('ACTIVE', 'BUILDING', 'INACTIVE');

-- CreateEnum
CREATE TYPE "TransformFunction" AS ENUM ('SUM', 'AVG', 'GROUP_BY');

-- CreateTable
CREATE TABLE "Stack" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "status" "Status" NOT NULL,
    "environment" "Environment" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Stack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dashboard" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "stackId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Dashboard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataSource" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "stackId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DataSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chart" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "stackId" TEXT NOT NULL,
    "dataSourceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Chart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Query" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "stackId" TEXT NOT NULL,
    "dataSourceId" TEXT NOT NULL,
    "jsonPath" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Query_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transform" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "stackId" TEXT NOT NULL,
    "queryId" TEXT NOT NULL,
    "function" "TransformFunction" NOT NULL,
    "field" TEXT NOT NULL,
    "groupByField" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transform_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Credential" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "stackId" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Credential_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Dashboard_stackId_key_idx" ON "Dashboard"("stackId", "key");

-- AddForeignKey
ALTER TABLE "Dashboard" ADD CONSTRAINT "Dashboard_stackId_fkey" FOREIGN KEY ("stackId") REFERENCES "Stack"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataSource" ADD CONSTRAINT "DataSource_stackId_fkey" FOREIGN KEY ("stackId") REFERENCES "Stack"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chart" ADD CONSTRAINT "Chart_stackId_fkey" FOREIGN KEY ("stackId") REFERENCES "Stack"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chart" ADD CONSTRAINT "Chart_dataSourceId_fkey" FOREIGN KEY ("dataSourceId") REFERENCES "DataSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Query" ADD CONSTRAINT "Query_stackId_fkey" FOREIGN KEY ("stackId") REFERENCES "Stack"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Query" ADD CONSTRAINT "Query_dataSourceId_fkey" FOREIGN KEY ("dataSourceId") REFERENCES "DataSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transform" ADD CONSTRAINT "Transform_stackId_fkey" FOREIGN KEY ("stackId") REFERENCES "Stack"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transform" ADD CONSTRAINT "Transform_queryId_fkey" FOREIGN KEY ("queryId") REFERENCES "Query"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Credential" ADD CONSTRAINT "Credential_stackId_fkey" FOREIGN KEY ("stackId") REFERENCES "Stack"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
