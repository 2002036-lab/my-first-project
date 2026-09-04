import type { RehabCalculationResult } from "@/lib/calc/rehabilitation";
import { fmt } from "../format";

export function CalculationSection({
  result,
  householdSize,
  standardLivingCostFound,
}: {
  result: RehabCalculationResult;
  householdSize: number;
  standardLivingCostFound: boolean;
}) {
  const violatesGuarantee = result.liquidationGuaranteeShortfall > 0;

  return (
    <section id="calc" className="rounded-lg border border-slate-200 bg-white p-6">
      <h2 className="mb-4 text-sm font-semibold text-slate-700">계산결과</h2>

      {!standardLivingCostFound && (
        <p className="mb-4 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700">
          가구원수({householdSize}인)에 해당하는 기준중위소득표 값이 없습니다. 설정에서
          기준중위소득표를 등록하거나, 아래 &apos;최종 확정 생계비공제(수기)&apos;를 직접
          입력해주세요.
        </p>
      )}

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="총 채무원금" value={fmt(result.totalDebtPrincipal)} />
        <Stat label="월평균소득(계산값)" value={fmt(result.computedMonthlyIncome)} />
        <Stat label="적용 월소득" value={fmt(result.effectiveMonthlyIncome)} highlight />
        <Stat label="적용 생계비공제" value={fmt(result.effectiveLivingCost)} highlight />
        <Stat label="월 가용소득" value={fmt(result.monthlyAvailableIncome)} highlight />
        <Stat label="총 변제예정액" value={fmt(result.totalAvailableIncome)} />
        <Stat label="변제율(원금대비)" value={`${result.repaymentRatePercent.toFixed(1)}%`} />
        <Stat label="재산 합계" value={fmt(result.totalAssetValue)} />
        <Stat label="청산가치" value={fmt(result.liquidationValue)} highlight />
        <Stat label="변제계획 현재가치" value={fmt(result.presentValueOfRepayment)} highlight />
      </div>

      <div
        className={`mb-6 rounded-md px-4 py-3 text-sm ${
          violatesGuarantee
            ? "bg-red-50 text-red-700"
            : "bg-emerald-50 text-emerald-700"
        }`}
      >
        {violatesGuarantee ? (
          <>
            ⚠ 청산가치 보장원칙 미충족 우려: 현재가치가 청산가치보다{" "}
            <strong>{fmt(result.liquidationGuaranteeShortfall)}원</strong> 부족합니다. 안전마진
            반영 시 최소 <strong>{fmt(result.requiredBuffer)}원</strong> 추가 확보를 검토하세요.
          </>
        ) : (
          <>✓ 변제계획의 현재가치가 청산가치 이상입니다 (청산가치 보장원칙 충족).</>
        )}
      </div>

      <h3 className="mb-3 text-sm font-semibold text-slate-700">채권자별 변제예정액</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-3 py-2 font-medium">순번</th>
              <th className="px-3 py-2 font-medium">채권자</th>
              <th className="px-3 py-2 font-medium text-right">채권원금</th>
              <th className="px-3 py-2 font-medium text-right">월 변제예정액</th>
              <th className="px-3 py-2 font-medium text-right">총 변제예정액</th>
            </tr>
          </thead>
          <tbody>
            {result.allocations.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-slate-400">
                  채무 데이터를 먼저 입력해주세요.
                </td>
              </tr>
            )}
            {result.allocations.map((a) => (
              <tr key={a.debtId} className="border-t border-slate-100">
                <td className="px-3 py-2">{a.seq}</td>
                <td className="px-3 py-2">{a.creditorName}</td>
                <td className="px-3 py-2 text-right">{fmt(a.principal)}</td>
                <td className="px-3 py-2 text-right">{fmt(a.monthlyRepayment)}</td>
                <td className="px-3 py-2 text-right">{fmt(a.totalRepayment)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border p-3 ${
        highlight ? "border-slate-300 bg-slate-50" : "border-slate-100"
      }`}
    >
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-base font-semibold text-slate-900">{value}</p>
    </div>
  );
}
