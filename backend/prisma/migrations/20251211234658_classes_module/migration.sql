-- CreateEnum
CREATE TYPE "ClassSkillLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ALL_LEVELS');

-- CreateEnum
CREATE TYPE "ClassAccessType" AS ENUM ('INCLUDED_IN_MEMBERSHIP', 'PAID_DROPIN', 'EITHER');

-- CreateEnum
CREATE TYPE "ClassSessionStatus" AS ENUM ('SCHEDULED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ClassAttendanceStatus" AS ENUM ('REGISTERED', 'ATTENDED', 'NO_SHOW', 'CANCELLED_BY_STAFF', 'CANCELLED_BY_MEMBER');

-- CreateTable
CREATE TABLE "ClassTemplate" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "room" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "program" TEXT,
    "skillLevel" "ClassSkillLevel" NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "daysOfWeek" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "maxParticipants" INTEGER NOT NULL,
    "accessType" "ClassAccessType" NOT NULL,
    "dropInPriceCents" INTEGER,
    "currency" TEXT,
    "minAge" INTEGER,
    "maxAge" INTEGER,
    "ageLabel" TEXT,
    "membersOnly" BOOLEAN NOT NULL DEFAULT false,
    "prerequisiteLabel" TEXT,
    "primaryInstructorUserId" TEXT NOT NULL,
    "instructorDisplayName" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClassTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassTemplateRequiredPlan" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "membershipPlanId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "ClassTemplateRequiredPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassSession" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "room" TEXT,
    "startDateTime" TIMESTAMP(3) NOT NULL,
    "endDateTime" TIMESTAMP(3) NOT NULL,
    "maxParticipants" INTEGER NOT NULL,
    "instructorUserId" TEXT,
    "instructorDisplayName" TEXT,
    "status" "ClassSessionStatus" NOT NULL DEFAULT 'SCHEDULED',
    "cancelReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClassSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassSessionRosterEntry" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "customerProfileId" TEXT NOT NULL,
    "status" "ClassAttendanceStatus" NOT NULL DEFAULT 'REGISTERED',
    "note" TEXT,
    "createdByUserId" TEXT,
    "updatedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClassSessionRosterEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClassTemplateRequiredPlan_templateId_membershipPlanId_key" ON "ClassTemplateRequiredPlan"("templateId", "membershipPlanId");

-- AddForeignKey
ALTER TABLE "ClassTemplate" ADD CONSTRAINT "ClassTemplate_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassTemplate" ADD CONSTRAINT "ClassTemplate_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassTemplate" ADD CONSTRAINT "ClassTemplate_primaryInstructorUserId_fkey" FOREIGN KEY ("primaryInstructorUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassTemplateRequiredPlan" ADD CONSTRAINT "ClassTemplateRequiredPlan_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ClassTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassTemplateRequiredPlan" ADD CONSTRAINT "ClassTemplateRequiredPlan_membershipPlanId_fkey" FOREIGN KEY ("membershipPlanId") REFERENCES "MembershipPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassTemplateRequiredPlan" ADD CONSTRAINT "ClassTemplateRequiredPlan_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassSession" ADD CONSTRAINT "ClassSession_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ClassTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassSession" ADD CONSTRAINT "ClassSession_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassSession" ADD CONSTRAINT "ClassSession_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassSession" ADD CONSTRAINT "ClassSession_instructorUserId_fkey" FOREIGN KEY ("instructorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassSessionRosterEntry" ADD CONSTRAINT "ClassSessionRosterEntry_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ClassSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassSessionRosterEntry" ADD CONSTRAINT "ClassSessionRosterEntry_customerProfileId_fkey" FOREIGN KEY ("customerProfileId") REFERENCES "CustomerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassSessionRosterEntry" ADD CONSTRAINT "ClassSessionRosterEntry_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassSessionRosterEntry" ADD CONSTRAINT "ClassSessionRosterEntry_updatedByUserId_fkey" FOREIGN KEY ("updatedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
