/*
  Warnings:

  - Made the column `description` on table `Playlist` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Playlist" ALTER COLUMN "description" SET NOT NULL;
