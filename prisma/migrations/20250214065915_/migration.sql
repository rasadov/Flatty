/*
  Warnings:

  - You are about to drop the column `dealType` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `propertyType` on the `Property` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Property" DROP COLUMN "dealType",
DROP COLUMN "propertyType";
