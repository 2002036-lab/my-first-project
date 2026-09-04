-- CreateTable
CREATE TABLE "Office" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "officeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'STAFF',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_officeId_fkey" FOREIGN KEY ("officeId") REFERENCES "Office" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "officeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "residentNo" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "email" TEXT,
    "memo" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Client_officeId_fkey" FOREIGN KEY ("officeId") REFERENCES "Office" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Case" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "officeId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "caseType" TEXT NOT NULL,
    "stage" TEXT NOT NULL DEFAULT 'CONSULTATION',
    "caseNumber" TEXT,
    "court" TEXT,
    "repaymentMonths" INTEGER NOT NULL DEFAULT 36,
    "accumulationMonths" INTEGER NOT NULL DEFAULT 0,
    "incomeAvgMonths" INTEGER NOT NULL DEFAULT 12,
    "exemptAssetAmount" REAL,
    "discountRatePercent" REAL NOT NULL DEFAULT 5,
    "liquidationBufferPercent" REAL NOT NULL DEFAULT 130,
    "finalMonthlyIncomeOverride" REAL,
    "finalLivingCostOverride" REAL,
    "filedAt" DATETIME,
    "memo" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Case_officeId_fkey" FOREIGN KEY ("officeId") REFERENCES "Office" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Case_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Creditor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "zipCode" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "CaseDebt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseId" TEXT NOT NULL,
    "seq" TEXT NOT NULL,
    "creditorName" TEXT NOT NULL,
    "creditorId" TEXT,
    "debtDateText" TEXT,
    "cause" TEXT,
    "originalAmount" REAL,
    "principal" REAL,
    "isFutureClaim" BOOLEAN NOT NULL DEFAULT false,
    "otherCost" REAL,
    "interest" REAL,
    "baseDate" DATETIME,
    "claimDate" DATETIME,
    "basis" TEXT,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CaseDebt_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CaseDebt_creditorId_fkey" FOREIGN KEY ("creditorId") REFERENCES "Creditor" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CaseIncomeItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "yearMonth" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    CONSTRAINT "CaseIncomeItem_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CaseDependent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseId" TEXT NOT NULL,
    "name" TEXT,
    "relationship" TEXT,
    "birthDate" DATETIME,
    CONSTRAINT "CaseDependent_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MedianIncomeStandard" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "year" INTEGER NOT NULL,
    "householdSize" REAL NOT NULL,
    "monthlyAmount" REAL NOT NULL
);

-- CreateTable
CREATE TABLE "CaseAsset" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "name" TEXT,
    "accountNo" TEXT,
    "amount" REAL NOT NULL DEFAULT 0,
    "seized" BOOLEAN NOT NULL DEFAULT false,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CaseAsset_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CaseRealEstate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseId" TEXT NOT NULL,
    "location" TEXT,
    "areaSqm" REAL,
    "propertyType" TEXT,
    "ownershipRight" TEXT,
    "ownershipRatio" REAL,
    "marketValue" REAL,
    "securedDebt" REAL,
    "note" TEXT,
    CONSTRAINT "CaseRealEstate_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case" ("id") ON DELETE CASCADE ON UPDATE CASCADE
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
