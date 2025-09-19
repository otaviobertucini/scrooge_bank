/*
  Warnings:

  - A unique constraint covering the columns `[token]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "token" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_token_key" ON "public"."User"("token");
