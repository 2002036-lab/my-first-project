import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/current-user";
import { calculateRehabilitationPlan } from "@/lib/calc/rehabilitation";
import { lookupMedianIncome } from "@/lib/calc/median-income";
import { CaseParamsForm } from "./_components/CaseParamsForm";
import { DebtsSection } from "./_components/DebtsSection";
import { IncomeSection } from "./_components/IncomeSection";
import { DependentsSection } from "./_components/DependentsSection";
import { AssetsSection } from "./_components/AssetsSection";
import { CalculationSection } from "./_components/CalculationSection";

export default async function CaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();

  const caseData = await prisma.case.findFirst({
    where: { id, officeId: user.officeId },
    include: {
      client: true,
      debts: { orderBy: { seq: "asc" } },
      incomeItems: { orderBy: { yearMonth: "desc" } },
      dependents: true,
      assets: true,
      realEstates: true,
    },
  });
  if (!caseData) notFound();

  const householdSize = 1 + caseData.dependents.length;

  let calcSection = null;
  if (caseData.caseType === "REHABILITATION") {
    const year = new Date().getFullYear();
    const medianRows = await prisma.medianIncomeStandard.findMany({ where: { year } });
    const standardLivingCost = lookupMedianIncome(medianRows, householdSize);

    const result = calculateRehabilitationPlan({
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

    calcSection = (
      <CalculationSection
        result={result}
        householdSize={householdSize}
        standardLivingCostFound={!!standardLivingCost}
      />
    );
  }

  const TYPE_LABEL: Record<string, string> = {
    REHABILITATION: "개인회생",
    BANKRUPTCY: "개인파산",
  };

  return (
    <div className="max-w-4xl space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            {caseData.client.name} · {TYPE_LABEL[caseData.caseType]}
          </h1>
          <Link href={`/clients/${caseData.clientId}`} className="text-sm text-slate-500 hover:underline">
            ← {caseData.client.name} 의뢰인 정보
          </Link>
        </div>
        <a
          href={`/api/cases/${caseData.id}/export`}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          서류 엑셀 다운로드
        </a>
      </div>

      <nav className="flex gap-4 border-b border-slate-200 text-sm text-slate-500">
        <a href="#basic" className="border-b-2 border-transparent px-1 py-2 hover:text-slate-900">
          기본정보
        </a>
        <a href="#debts" className="border-b-2 border-transparent px-1 py-2 hover:text-slate-900">
          채무
        </a>
        <a href="#income" className="border-b-2 border-transparent px-1 py-2 hover:text-slate-900">
          소득
        </a>
        <a href="#dependents" className="border-b-2 border-transparent px-1 py-2 hover:text-slate-900">
          부양가족
        </a>
        <a href="#assets" className="border-b-2 border-transparent px-1 py-2 hover:text-slate-900">
          재산
        </a>
        {caseData.caseType === "REHABILITATION" && (
          <a href="#calc" className="border-b-2 border-transparent px-1 py-2 hover:text-slate-900">
            계산결과
          </a>
        )}
      </nav>

      <CaseParamsForm caseData={caseData} />
      <DebtsSection caseId={caseData.id} debts={caseData.debts} />
      <IncomeSection caseId={caseData.id} items={caseData.incomeItems} />
      <DependentsSection caseId={caseData.id} dependents={caseData.dependents} />
      <AssetsSection
        caseId={caseData.id}
        assets={caseData.assets}
        realEstates={caseData.realEstates}
      />
      {calcSection}
    </div>
  );
}
