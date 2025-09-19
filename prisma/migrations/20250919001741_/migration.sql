-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('CUSTOMER', 'OPERATOR');

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "role" "public"."Role" NOT NULL DEFAULT 'CUSTOMER';

-- CreateTable
CREATE TABLE "public"."BankCapital" (
    "id" SERIAL NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "BankCapital_pkey" PRIMARY KEY ("id")
);
