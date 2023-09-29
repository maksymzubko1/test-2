-- CreateTable
CREATE TABLE "AnalyzeData" (
    "type" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "id" SERIAL NOT NULL,
    "itemId" TEXT NOT NULL,
    "actionCount" INTEGER NOT NULL,
    "event" TEXT NOT NULL,

    CONSTRAINT "AnalyzeData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AnalyzeData_shop_idx" ON "AnalyzeData"("shop");

-- AddForeignKey
ALTER TABLE "AnalyzeData" ADD CONSTRAINT "AnalyzeData_shop_fkey" FOREIGN KEY ("shop") REFERENCES "Shop"("shop") ON DELETE CASCADE ON UPDATE CASCADE;
