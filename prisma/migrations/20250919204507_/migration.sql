/*
  Warnings:

  - A unique constraint covering the columns `[ssn]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phone]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "phone" TEXT,
ADD COLUMN     "ssn" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_ssn_key" ON "public"."User"("ssn");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "public"."User"("phone");
