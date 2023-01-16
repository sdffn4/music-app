/*
  Warnings:

  - Made the column `coverId` on table `Playlist` required. This step will fail if there are existing NULL values in that column.
  - Made the column `coverId` on table `Track` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Playlist" ALTER COLUMN "coverId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Track" ALTER COLUMN "coverId" SET NOT NULL;
