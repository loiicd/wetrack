/*
  Warnings:

  - You are about to drop the column `dataSourceId` on the `Chart` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[stackId,key]` on the table `Chart` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stackId,key]` on the table `Dashboard` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stackId,key]` on the table `DataSource` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stackId,key]` on the table `Query` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[key,environment]` on the table `Stack` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `config` to the `Chart` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dashboardId` to the `Chart` table without a default value. This is not possible if the table is not empty.
  - Added the required column `label` to the `Chart` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Chart` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ChartType" AS ENUM ('BAR', 'LINE', 'STAT', 'CLOCK');

-- CreateEnum
CREATE TYPE "QueryType" AS ENUM ('JSONPATH', 'SQL');

-- DropForeignKey
ALTER TABLE "Chart" DROP CONSTRAINT "Chart_dataSourceId_fkey";

-- DropForeignKey
ALTER TABLE "Query" DROP CONSTRAINT "Query_dataSourceId_fkey";

-- DropIndex
DROP INDEX "Dashboard_stackId_key_idx";

-- AlterTable
ALTER TABLE "Chart" DROP COLUMN "dataSourceId",
ADD COLUMN     "config" JSONB NOT NULL,
ADD COLUMN     "dashboardId" TEXT NOT NULL,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "label" TEXT NOT NULL,
ADD COLUMN     "layoutH" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "layoutW" INTEGER NOT NULL DEFAULT 6,
ADD COLUMN     "layoutX" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "layoutY" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "queryId" TEXT,
ADD COLUMN     "type" "ChartType" NOT NULL;

-- AlterTable
ALTER TABLE "Query" ADD COLUMN     "sourceQueryId" TEXT,
ADD COLUMN     "sql" TEXT,
ADD COLUMN     "type" "QueryType" NOT NULL DEFAULT 'JSONPATH',
ALTER COLUMN "dataSourceId" DROP NOT NULL,
ALTER COLUMN "jsonPath" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Chart_stackId_key_key" ON "Chart"("stackId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "Dashboard_stackId_key_key" ON "Dashboard"("stackId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "DataSource_stackId_key_key" ON "DataSource"("stackId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "Query_stackId_key_key" ON "Query"("stackId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "Stack_key_environment_key" ON "Stack"("key", "environment");

-- AddForeignKey
ALTER TABLE "Chart" ADD CONSTRAINT "Chart_dashboardId_fkey" FOREIGN KEY ("dashboardId") REFERENCES "Dashboard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chart" ADD CONSTRAINT "Chart_queryId_fkey" FOREIGN KEY ("queryId") REFERENCES "Query"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Query" ADD CONSTRAINT "Query_dataSourceId_fkey" FOREIGN KEY ("dataSourceId") REFERENCES "DataSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Query" ADD CONSTRAINT "Query_sourceQueryId_fkey" FOREIGN KEY ("sourceQueryId") REFERENCES "Query"("id") ON DELETE SET NULL ON UPDATE CASCADE;
