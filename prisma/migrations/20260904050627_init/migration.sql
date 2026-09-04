-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'STAFF');

-- CreateEnum
CREATE TYPE "CaseType" AS ENUM ('REHABILITATION', 'BANKRUPTCY');

-- CreateEnum
CREATE TYPE "CaseStage" AS ENUM ('CONSULTATION', 'INTAKE', 'DOCUMENT_PREP', 'FILED', 'COMMENCEMENT', 'CONFIRMED', 'CLOSED', 'DISCONTINUED');

-- CreateEnum
CREATE TYPE "IncomeItemKind" AS ENUM ('INCOME', 'DEDUCTION');

-- CreateEnum
CREATE TYPE "AssetCategory" AS ENUM ('CASH', 'DEPOSIT', 'INSURANCE', 'VEHICLE', 'LEASE_DEPOSIT', 'BUSINESS_INVENTORY', 'LOAN_RECEIVABLE', 'SALES_RECEIVABLE', 'EXPECTED_SEVERANCE', 'OTHER');

-- CreateTable
CREATE TABLE "Office" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Office_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "officeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'STAFF',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "officeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "residentNo" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "email" TEXT,
    "memo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Case" (
    "id" TEXT NOT NULL,
    "officeId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "caseType" "CaseType" NOT NULL,
    "stage" "CaseStage" NOT NULL DEFAULT 'CONSULTATION',
    "caseNumber" TEXT,
    "court" TEXT,
    "repaymentMonths" INTEGER NOT NULL DEFAULT 36,
    "accumulationMonths" INTEGER NOT NULL DEFAULT 0,
    "incomeAvgMonths" INTEGER NOT NULL DEFAULT 12,
    "exemptAssetAmount" DOUBLE PRECISION,
    "discountRatePercent" DOUBLE PRECISION NOT NULL DEFAULT 5,
    "liquidationBufferPercent" DOUBLE PRECISION NOT NULL DEFAULT 130,
    "finalMonthlyIncomeOverride" DOUBLE PRECISION,
    "finalLivingCostOverride" DOUBLE PRECISION,
    "filedAt" TIMESTAMP(3),
    "memo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Case_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Creditor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "zipCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Creditor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseDebt" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "seq" TEXT NOT NULL,
    "creditorName" TEXT NOT NULL,
    "creditorId" TEXT,
    "debtDateText" TEXT,
    "cause" TEXT,
    "originalAmount" DOUBLE PRECISION,
    "principal" DOUBLE PRECISION,
    "isFutureClaim" BOOLEAN NOT NULL DEFAULT false,
    "otherCost" DOUBLE PRECISION,
    "interest" DOUBLE PRECISION,
    "baseDate" TIMESTAMP(3),
    "claimDate" TIMESTAMP(3),
    "basis" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CaseDebt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseIncomeItem" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "kind" "IncomeItemKind" NOT NULL,
    "category" TEXT NOT NULL,
    "yearMonth" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "CaseIncomeItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseDependent" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "name" TEXT,
    "relationship" TEXT,
    "birthDate" TIMESTAMP(3),

    CONSTRAINT "CaseDependent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedianIncomeStandard" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "householdSize" DOUBLE PRECISION NOT NULL,
    "monthlyAmount" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "MedianIncomeStandard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseAsset" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "category" "AssetCategory" NOT NULL,
    "name" TEXT,
    "accountNo" TEXT,
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "seized" BOOLEAN NOT NULL DEFAULT false,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CaseAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseRealEstate" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "location" TEXT,
    "areaSqm" DOUBLE PRECISION,
    "propertyType" TEXT,
    "ownershipRight" TEXT,
    "ownershipRatio" DOUBLE PRECISION,
    "marketValue" DOUBLE PRECISION,
    "securedDebt" DOUBLE PRECISION,
    "note" TEXT,

    CONSTRAINT "CaseRealEstate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Case_officeId_idx" ON "Case"("officeId");

-- CreateIndex
CREATE INDEX "Case_clientId_idx" ON "Case"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "Creditor_name_key" ON "Creditor"("name");

-- CreateIndex
CREATE INDEX "CaseDebt_caseId_idx" ON "CaseDebt"("caseId");

-- CreateIndex
CREATE INDEX "CaseIncomeItem_caseId_idx" ON "CaseIncomeItem"("caseId");

-- CreateIndex
CREATE UNIQUE INDEX "CaseIncomeItem_caseId_kind_category_yearMonth_key" ON "CaseIncomeItem"("caseId", "kind", "category", "yearMonth");

-- CreateIndex
CREATE INDEX "CaseDependent_caseId_idx" ON "CaseDependent"("caseId");

-- CreateIndex
CREATE UNIQUE INDEX "MedianIncomeStandard_year_householdSize_key" ON "MedianIncomeStandard"("year", "householdSize");

-- CreateIndex
CREATE INDEX "CaseAsset_caseId_idx" ON "CaseAsset"("caseId");

-- CreateIndex
CREATE INDEX "CaseRealEstate_caseId_idx" ON "CaseRealEstate"("caseId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_officeId_fkey" FOREIGN KEY ("officeId") REFERENCES "Office"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_officeId_fkey" FOREIGN KEY ("officeId") REFERENCES "Office"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Case" ADD CONSTRAINT "Case_officeId_fkey" FOREIGN KEY ("officeId") REFERENCES "Office"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Case" ADD CONSTRAINT "Case_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseDebt" ADD CONSTRAINT "CaseDebt_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseDebt" ADD CONSTRAINT "CaseDebt_creditorId_fkey" FOREIGN KEY ("creditorId") REFERENCES "Creditor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseIncomeItem" ADD CONSTRAINT "CaseIncomeItem_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseDependent" ADD CONSTRAINT "CaseDependent_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseAsset" ADD CONSTRAINT "CaseAsset_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseRealEstate" ADD CONSTRAINT "CaseRealEstate_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;
