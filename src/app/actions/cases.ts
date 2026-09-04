"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/current-user";
import type { CaseStage, CaseType } from "@prisma/client";

export async function createCaseAction(clientId: string, formData: FormData) {
  const user = await requireUser();

  const caseType = String(formData.get("caseType") || "REHABILITATION") as CaseType;

  const created = await prisma.case.create({
    data: {
      officeId: user.officeId,
      clientId,
      caseType,
      court: emptyToNull(formData.get("court")),
    },
  });

  revalidatePath(`/clients/${clientId}`);
  redirect(`/cases/${created.id}`);
}

export async function updateCaseStageAction(caseId: string, stage: CaseStage) {
  const user = await requireUser();
  await prisma.case.update({
    where: { id: caseId, officeId: user.officeId },
    data: { stage },
  });
  revalidatePath(`/cases/${caseId}`);
}

export async function updateCaseParamsAction(caseId: string, formData: FormData) {
  const user = await requireUser();

  await prisma.case.update({
    where: { id: caseId, officeId: user.officeId },
    data: {
      caseNumber: emptyToNull(formData.get("caseNumber")),
      court: emptyToNull(formData.get("court")),
      repaymentMonths: toInt(formData.get("repaymentMonths"), 36),
      accumulationMonths: toInt(formData.get("accumulationMonths"), 0),
      incomeAvgMonths: toInt(formData.get("incomeAvgMonths"), 12),
      discountRatePercent: toFloat(formData.get("discountRatePercent"), 5),
      liquidationBufferPercent: toFloat(formData.get("liquidationBufferPercent"), 130),
      exemptAssetAmount: toFloatOrNull(formData.get("exemptAssetAmount")),
      finalMonthlyIncomeOverride: toFloatOrNull(formData.get("finalMonthlyIncomeOverride")),
      finalLivingCostOverride: toFloatOrNull(formData.get("finalLivingCostOverride")),
    },
  });

  revalidatePath(`/cases/${caseId}`);
}

// ---- 채무(채무일람표) ----

export async function addDebtAction(caseId: string, formData: FormData) {
  const user = await requireUser();
  await ensureCaseOwnership(caseId, user.officeId);

  const creditorName = String(formData.get("creditorName") || "").trim();
  if (!creditorName) throw new Error("채권자명은 필수입니다.");

  const isFutureClaim = formData.get("isFutureClaim") === "on";

  const baseDate = toDateOrNull(formData.get("baseDate"));
  const claimDate = baseDate ? addDays(baseDate, 1) : null;

  const matchedCreditor = await prisma.creditor.findUnique({ where: { name: creditorName } });

  await prisma.caseDebt.create({
    data: {
      caseId,
      seq: String(formData.get("seq") || "").trim() || "1",
      creditorName,
      creditorId: matchedCreditor?.id,
      debtDateText: emptyToNull(formData.get("debtDateText")),
      cause: emptyToNull(formData.get("cause")),
      originalAmount: toFloatOrNull(formData.get("originalAmount")),
      principal: isFutureClaim ? null : toFloatOrNull(formData.get("principal")),
      isFutureClaim,
      otherCost: toFloatOrNull(formData.get("otherCost")),
      interest: toFloatOrNull(formData.get("interest")),
      baseDate,
      claimDate,
      basis: emptyToNull(formData.get("basis")),
      note: emptyToNull(formData.get("note")),
    },
  });

  revalidatePath(`/cases/${caseId}`);
}

export async function deleteDebtAction(caseId: string, debtId: string) {
  const user = await requireUser();
  await ensureCaseOwnership(caseId, user.officeId);
  await prisma.caseDebt.delete({ where: { id: debtId, caseId } });
  revalidatePath(`/cases/${caseId}`);
}

// ---- 소득/공제 ----

export async function addIncomeItemAction(caseId: string, formData: FormData) {
  const user = await requireUser();
  await ensureCaseOwnership(caseId, user.officeId);

  await prisma.caseIncomeItem.upsert({
    where: {
      caseId_kind_category_yearMonth: {
        caseId,
        kind: String(formData.get("kind")) as "INCOME" | "DEDUCTION",
        category: String(formData.get("category")).trim(),
        yearMonth: String(formData.get("yearMonth")).trim(),
      },
    },
    update: { amount: toFloat(formData.get("amount"), 0) },
    create: {
      caseId,
      kind: String(formData.get("kind")) as "INCOME" | "DEDUCTION",
      category: String(formData.get("category")).trim(),
      yearMonth: String(formData.get("yearMonth")).trim(),
      amount: toFloat(formData.get("amount"), 0),
    },
  });

  revalidatePath(`/cases/${caseId}`);
}

export async function deleteIncomeItemAction(caseId: string, itemId: string) {
  const user = await requireUser();
  await ensureCaseOwnership(caseId, user.officeId);
  await prisma.caseIncomeItem.delete({ where: { id: itemId, caseId } });
  revalidatePath(`/cases/${caseId}`);
}

// ---- 부양가족 ----

export async function addDependentAction(caseId: string, formData: FormData) {
  const user = await requireUser();
  await ensureCaseOwnership(caseId, user.officeId);

  await prisma.caseDependent.create({
    data: {
      caseId,
      name: emptyToNull(formData.get("name")),
      relationship: emptyToNull(formData.get("relationship")),
    },
  });
  revalidatePath(`/cases/${caseId}`);
}

export async function deleteDependentAction(caseId: string, dependentId: string) {
  const user = await requireUser();
  await ensureCaseOwnership(caseId, user.officeId);
  await prisma.caseDependent.delete({ where: { id: dependentId, caseId } });
  revalidatePath(`/cases/${caseId}`);
}

// ---- 재산(자산) ----

export async function addAssetAction(caseId: string, formData: FormData) {
  const user = await requireUser();
  await ensureCaseOwnership(caseId, user.officeId);

  await prisma.caseAsset.create({
    data: {
      caseId,
      category: String(formData.get("category")) as never,
      name: emptyToNull(formData.get("name")),
      accountNo: emptyToNull(formData.get("accountNo")),
      amount: toFloat(formData.get("amount"), 0),
      seized: formData.get("seized") === "on",
      note: emptyToNull(formData.get("note")),
    },
  });
  revalidatePath(`/cases/${caseId}`);
}

export async function deleteAssetAction(caseId: string, assetId: string) {
  const user = await requireUser();
  await ensureCaseOwnership(caseId, user.officeId);
  await prisma.caseAsset.delete({ where: { id: assetId, caseId } });
  revalidatePath(`/cases/${caseId}`);
}

export async function addRealEstateAction(caseId: string, formData: FormData) {
  const user = await requireUser();
  await ensureCaseOwnership(caseId, user.officeId);

  await prisma.caseRealEstate.create({
    data: {
      caseId,
      location: emptyToNull(formData.get("location")),
      areaSqm: toFloatOrNull(formData.get("areaSqm")),
      propertyType: emptyToNull(formData.get("propertyType")),
      ownershipRight: emptyToNull(formData.get("ownershipRight")),
      marketValue: toFloatOrNull(formData.get("marketValue")),
      securedDebt: toFloatOrNull(formData.get("securedDebt")),
      note: emptyToNull(formData.get("note")),
    },
  });
  revalidatePath(`/cases/${caseId}`);
}

export async function deleteRealEstateAction(caseId: string, realEstateId: string) {
  const user = await requireUser();
  await ensureCaseOwnership(caseId, user.officeId);
  await prisma.caseRealEstate.delete({ where: { id: realEstateId, caseId } });
  revalidatePath(`/cases/${caseId}`);
}

// ---- helpers ----

async function ensureCaseOwnership(caseId: string, officeId: string) {
  const found = await prisma.case.findFirst({ where: { id: caseId, officeId } });
  if (!found) throw new Error("사건을 찾을 수 없습니다.");
  return found;
}

function emptyToNull(v: FormDataEntryValue | null): string | null {
  const s = String(v ?? "").trim();
  return s === "" ? null : s;
}

function toFloat(v: FormDataEntryValue | null, fallback: number): number {
  const n = parseFloat(String(v ?? ""));
  return Number.isFinite(n) ? n : fallback;
}

function toFloatOrNull(v: FormDataEntryValue | null): number | null {
  const s = String(v ?? "").trim();
  if (s === "") return null;
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : null;
}

function toInt(v: FormDataEntryValue | null, fallback: number): number {
  const n = parseInt(String(v ?? ""), 10);
  return Number.isFinite(n) ? n : fallback;
}

function toDateOrNull(v: FormDataEntryValue | null): Date | null {
  const s = String(v ?? "").trim();
  if (s === "") return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}
