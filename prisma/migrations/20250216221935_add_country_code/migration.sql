/*
  Warnings:

  - Added the required column `totalArea` to the `Property` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "apartmentStories" INTEGER,
ADD COLUMN     "balconies" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "buildingFloors" INTEGER,
ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'apartment',
ADD COLUMN     "complexName" TEXT,
ADD COLUMN     "elevator" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "floor" INTEGER,
ADD COLUMN     "gym" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "installment" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "livingArea" DOUBLE PRECISION,
ADD COLUMN     "livingRooms" INTEGER,
ADD COLUMN     "renovation" TEXT,
ADD COLUMN     "swimmingPool" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "totalArea" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "totalRooms" INTEGER NOT NULL DEFAULT 1;
