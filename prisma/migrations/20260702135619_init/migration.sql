-- CreateEnum
CREATE TYPE "Role" AS ENUM ('MARKETING_MANAGER', 'SOCIAL_MEDIA_MANAGER', 'GRAPHIC_DESIGNER', 'VIDEOGRAPHER');

-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('REEL', 'CAROUSEL', 'SINGLE_POST', 'STORY');

-- CreateEnum
CREATE TYPE "Format" AS ENUM ('DESIGN', 'VIDEO');

-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('PLANNED', 'ASSIGNED', 'IN_PROGRESS', 'SUBMITTED', 'APPROVED', 'NEEDS_REVISION');

-- CreateEnum
CREATE TYPE "ReviewDecision" AS ENUM ('APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonthlyDirection" (
    "id" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "theme" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MonthlyDirection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentPiece" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "contentType" "ContentType" NOT NULL,
    "format" "Format" NOT NULL,
    "caption" TEXT NOT NULL,
    "brief" TEXT NOT NULL,
    "scheduledDate" DATE NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'PLANNED',
    "monthlyDirectionId" TEXT NOT NULL,
    "assignedToId" TEXT,
    "creativeLink" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentPiece_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewLog" (
    "id" TEXT NOT NULL,
    "contentPieceId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "decision" "ReviewDecision" NOT NULL,
    "comment" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReviewLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyDirection_month_key" ON "MonthlyDirection"("month");

-- CreateIndex
CREATE INDEX "MonthlyDirection_createdById_idx" ON "MonthlyDirection"("createdById");

-- CreateIndex
CREATE INDEX "ContentPiece_monthlyDirectionId_idx" ON "ContentPiece"("monthlyDirectionId");

-- CreateIndex
CREATE INDEX "ContentPiece_assignedToId_idx" ON "ContentPiece"("assignedToId");

-- CreateIndex
CREATE INDEX "ContentPiece_status_idx" ON "ContentPiece"("status");

-- CreateIndex
CREATE INDEX "ContentPiece_scheduledDate_idx" ON "ContentPiece"("scheduledDate");

-- CreateIndex
CREATE INDEX "ReviewLog_contentPieceId_idx" ON "ReviewLog"("contentPieceId");

-- CreateIndex
CREATE INDEX "ReviewLog_reviewerId_idx" ON "ReviewLog"("reviewerId");

-- AddForeignKey
ALTER TABLE "MonthlyDirection" ADD CONSTRAINT "MonthlyDirection_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentPiece" ADD CONSTRAINT "ContentPiece_monthlyDirectionId_fkey" FOREIGN KEY ("monthlyDirectionId") REFERENCES "MonthlyDirection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentPiece" ADD CONSTRAINT "ContentPiece_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentPiece" ADD CONSTRAINT "ContentPiece_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewLog" ADD CONSTRAINT "ReviewLog_contentPieceId_fkey" FOREIGN KEY ("contentPieceId") REFERENCES "ContentPiece"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewLog" ADD CONSTRAINT "ReviewLog_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
