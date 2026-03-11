/*
  Warnings:

  - You are about to drop the column `title` on the `Dashboard` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Stack` table. All the data in the column will be lost.
  - Added the required column `label` to the `Dashboard` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Chart" ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "Credential" ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "Dashboard" DROP COLUMN "title",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "label" TEXT NOT NULL,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "DataSource" ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "Query" ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "Stack" DROP COLUMN "status",
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "Transform" ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- DropEnum
DROP TYPE "Status";
