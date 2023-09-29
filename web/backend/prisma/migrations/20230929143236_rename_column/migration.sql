/*
  Warnings:

  - You are about to drop the column `timestamp` on the `AnalyzeData` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AnalyzeData" DROP COLUMN "timestamp",
ADD COLUMN     "lastTimestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
