/*
  Warnings:

  - You are about to drop the column `image` on the `Playlist` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Playlist" DROP COLUMN "image",
ADD COLUMN     "coverId" TEXT;

-- AlterTable
ALTER TABLE "Track" ADD COLUMN     "coverId" TEXT;

-- CreateTable
CREATE TABLE "Cover" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "dominantColor" TEXT NOT NULL,

    CONSTRAINT "Cover_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Track" ADD CONSTRAINT "Track_coverId_fkey" FOREIGN KEY ("coverId") REFERENCES "Cover"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Playlist" ADD CONSTRAINT "Playlist_coverId_fkey" FOREIGN KEY ("coverId") REFERENCES "Cover"("id") ON DELETE CASCADE ON UPDATE CASCADE;
