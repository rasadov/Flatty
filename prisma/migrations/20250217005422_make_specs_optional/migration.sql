-- AlterTable
ALTER TABLE "Property" ALTER COLUMN "specs" DROP NOT NULL,
ALTER COLUMN "specs" SET DEFAULT '{}';
