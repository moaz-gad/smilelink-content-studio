-- CreateTable
CREATE TABLE "Channel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Channel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ContentPieceChannels" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ContentPieceChannels_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Channel_name_key" ON "Channel"("name");

-- CreateIndex
CREATE INDEX "_ContentPieceChannels_B_index" ON "_ContentPieceChannels"("B");

-- AddForeignKey
ALTER TABLE "_ContentPieceChannels" ADD CONSTRAINT "_ContentPieceChannels_A_fkey" FOREIGN KEY ("A") REFERENCES "Channel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ContentPieceChannels" ADD CONSTRAINT "_ContentPieceChannels_B_fkey" FOREIGN KEY ("B") REFERENCES "ContentPiece"("id") ON DELETE CASCADE ON UPDATE CASCADE;
