import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/current-user";
import { calculateRehabilitationPlan } from "@/lib/calc/rehabilitation";
import { lookupMedianIncome } from "@/lib/calc/median-income";
import { buildRehabilitationWorkbook } from "@/lib/export/rehabilitationWorkbook";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await requireUser();

  const caseData = await prisma.case.findFirst({
    where: { id, officeId: user.officeId },
    include: {
      client: true,
      debts: { orderBy: { seq: "asc" }, include: { creditor: true } },
      incomeItems: { orderBy: { yearMonth: "desc" } },
      dependents: true,
      assets: true,
      realEstates: true,
    },
  });

  if (!caseData) {
    return NextResponse.json({ error: "사건을 찾을 수 없습니다." }, { status: 404 });
  }

  let calc = null;
  if (caseData.caseType === "REHABILITATION") {
    const householdSize = 1 + caseData.dependents.length;
    const year = new Date().getFullYear();
    const medianRows = await prisma.medianIncomeStandard.findMany({ where: { year } });
    const standardLivingCost = lookupMedianIncome(medianRows, householdSize);

    calc = calculateRehabilitationPlan({
      debts: caseData.debts,
      incomeItems: caseData.incomeItems,
      assets: caseData.assets,
      realEstates: caseData.realEstates,
      householdSize,
      standardLivingCost,
      repaymentMonths: caseData.repaymentMonths,
      accumulationMonths: caseData.accumulationMonths,
      incomeAvgMonths: caseData.incomeAvgMonths,
      discountRatePercent: caseData.discountRatePercent,
      liquidationBufferPercent: caseData.liquidationBufferPercent,
      exemptAssetAmount: caseData.exemptAssetAmount,
      finalMonthlyIncomeOverride: caseData.finalMonthlyIncomeOverride,
      finalLivingCostOverride: caseData.finalLivingCostOverride,
    });
  }

  const buffer = await buildRehabilitationWorkbook({
    client: caseData.client,
    caseData,
    debts: caseData.debts,
    incomeItems: caseData.incomeItems,
    dependents: caseData.dependents,
    assets: caseData.assets,
    realEstates: caseData.realEstates,
    calc,
  });

  const filename = encodeURIComponent(`${caseData.client.name}_사건자료.xlsx`);

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename*=UTF-8''${filename}`,
    },
  });
}
