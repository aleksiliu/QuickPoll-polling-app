/*
  Warnings:

  - A unique constraint covering the columns `[pollId,optionId]` on the table `Vote` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Vote_pollId_optionId_key" ON "Vote"("pollId", "optionId");
