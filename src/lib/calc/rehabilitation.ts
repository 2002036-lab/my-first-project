import { leibnizCoefficient } from "./leibniz";

/**
 * 개인회생 변제계획안 자동계산 엔진.
 *
 * 사무실에서 실제로 쓰던 엑셀(채무일람표/소득산출/요약/변제예정액표/재산목록)의 계산 로직을
 * 그대로 코드로 옮긴 것이다. 기준중위소득·생계비 공제액·청산가치 안전마진처럼 매년 바뀌거나
 * 사무실/사건마다 다른 재량이 들어가는 값은 하드코딩하지 않고 항상 파라미터로 받는다.
 */

export interface DebtInput {
  id: string;
  seq: string;
  creditorName: string;
  principal: number | null; // null 이면 장래구상권 등 미확정 채권
  isFutureClaim: boolean;
}

export interface IncomeItemInput {
  kind: "INCOME" | "DEDUCTION";
  yearMonth: string; // "2025-01"
  amount: number;
}

export interface AssetInput {
  amount: number;
  seized: boolean;
}

export interface RealEstateInput {
  marketValue: number | null;
  securedDebt: number | null;
}

export interface RehabInputs {
  debts: DebtInput[];
  incomeItems: IncomeItemInput[];
  assets: AssetInput[];
  realEstates: RealEstateInput[];

  /** 가구원수 (본인 포함, 0.5인 단위 구간 존재) */
  householdSize: number;
  /** 기준중위소득표에서 조회한 월 생계비 공제 기준액. 조회 실패 시 null. */
  standardLivingCost: number | null;

  repaymentMonths: number;
  accumulationMonths: number;
  incomeAvgMonths: number;
  discountRatePercent: number;
  liquidationBufferPercent: number;
  exemptAssetAmount: number | null;

  /** 사무장이 최종 확정한 값(있으면 자동계산값보다 우선) */
  finalMonthlyIncomeOverride: number | null;
  finalLivingCostOverride: number | null;
}

export interface CreditorAllocation {
  debtId: string;
  seq: string;
  creditorName: string;
  principal: number;
  monthlyRepayment: number;
  totalRepayment: number;
}

export interface RehabCalculationResult {
  totalDebtPrincipal: number;

  /** 최근 incomeAvgMonths개월 실수령액(소득-공제) 평균 */
  computedMonthlyIncome: number;
  /** 실제 계산에 사용된 월소득 (override 우선) */
  effectiveMonthlyIncome: number;

  /** 기준중위소득표 기반 생계비 공제 제안값 */
  suggestedLivingCost: number | null;
  /** 실제 계산에 사용된 생계비 공제액 (override 우선) */
  effectiveLivingCost: number;

  monthlyAvailableIncome: number;
  totalAvailableIncome: number;

  totalAssetValue: number;
  liquidationValue: number;

  presentValueOfRepayment: number;
  liquidationGuaranteeShortfall: number; // 청산가치 - 현재가치. 양수면 청산가치 보장원칙 위반 우려
  requiredBuffer: number; // shortfall * (buffer% / 100), shortfall<=0 이면 0

  repaymentRatePercent: number;
  allocations: CreditorAllocation[];
}

function yearMonthsDescendingUnique(items: IncomeItemInput[]): string[] {
  return Array.from(new Set(items.map((i) => i.yearMonth))).sort().reverse();
}

/** 최근 N개월의 (소득 - 공제) 합계를 N으로 나눈 평균 월 실수령액 */
export function computeAverageMonthlyIncome(
  incomeItems: IncomeItemInput[],
  months: number
): number {
  const recentMonths = yearMonthsDescendingUnique(incomeItems).slice(0, months);
  if (recentMonths.length === 0) return 0;
  const monthSet = new Set(recentMonths);
  let total = 0;
  for (const item of incomeItems) {
    if (!monthSet.has(item.yearMonth)) continue;
    total += item.kind === "INCOME" ? item.amount : -item.amount;
  }
  return total / recentMonths.length;
}

export function computeTotalAssetValue(assets: AssetInput[], realEstates: RealEstateInput[]): number {
  const assetSum = assets.reduce((sum, a) => sum + (a.amount || 0), 0);
  const realEstateSum = realEstates.reduce((sum, r) => {
    const net = (r.marketValue || 0) - (r.securedDebt || 0);
    return sum + Math.max(net, 0);
  }, 0);
  return assetSum + realEstateSum;
}

/** 채권자별 변제예정액 안분. 엑셀의 ROUNDUP($C$4*(원금/총원금),0) 을 그대로 재현 */
export function allocateRepayment(
  debts: DebtInput[],
  monthlyAvailableIncome: number,
  totalDebtPrincipal: number,
  repaymentMonths: number
): CreditorAllocation[] {
  return debts.map((d) => {
    const principal = d.principal ?? 0;
    const monthly =
      principal > 0 && totalDebtPrincipal > 0
        ? Math.ceil(monthlyAvailableIncome * (principal / totalDebtPrincipal))
        : 0;
    return {
      debtId: d.id,
      seq: d.seq,
      creditorName: d.creditorName,
      principal,
      monthlyRepayment: monthly,
      totalRepayment: monthly * repaymentMonths,
    };
  });
}

/**
 * 총 변제예정액의 현재가치.
 * 적립기간(변제 개시 전 모아두는 기간)은 할인 없이 액면가로, 그 이후 변제투입기간은
 * 라이프니쯔 연금현가계수로 할인한다 (원본 '변제예정액표(기본)' 시트 계산 방식과 동일).
 */
export function computePresentValueOfRepayment(
  monthlyAvailableIncome: number,
  totalMonths: number,
  accumulationMonths: number,
  annualRatePercent: number
): number {
  const clampedAccum = Math.min(Math.max(accumulationMonths, 0), totalMonths);
  const remainingMonths = totalMonths - clampedAccum;
  const accumPart = monthlyAvailableIncome * clampedAccum;
  const discountedPart =
    leibnizCoefficient(remainingMonths, annualRatePercent) * monthlyAvailableIncome;
  return accumPart + discountedPart;
}

export function calculateRehabilitationPlan(input: RehabInputs): RehabCalculationResult {
  const totalDebtPrincipal = input.debts.reduce((sum, d) => sum + (d.principal ?? 0), 0);

  const computedMonthlyIncome = computeAverageMonthlyIncome(
    input.incomeItems,
    input.incomeAvgMonths
  );
  const effectiveMonthlyIncome =
    input.finalMonthlyIncomeOverride ?? computedMonthlyIncome;

  const suggestedLivingCost = input.standardLivingCost;
  const effectiveLivingCost =
    input.finalLivingCostOverride ?? suggestedLivingCost ?? 0;

  const monthlyAvailableIncome = Math.max(
    effectiveMonthlyIncome - effectiveLivingCost,
    0
  );
  const totalAvailableIncome = monthlyAvailableIncome * input.repaymentMonths;

  const totalAssetValue = computeTotalAssetValue(input.assets, input.realEstates);
  const liquidationValue = Math.max(
    totalAssetValue - (input.exemptAssetAmount ?? 0),
    0
  );

  const presentValueOfRepayment = computePresentValueOfRepayment(
    monthlyAvailableIncome,
    input.repaymentMonths,
    input.accumulationMonths,
    input.discountRatePercent
  );

  const liquidationGuaranteeShortfall = liquidationValue - presentValueOfRepayment;
  const requiredBuffer =
    liquidationGuaranteeShortfall > 0
      ? liquidationGuaranteeShortfall * (input.liquidationBufferPercent / 100)
      : 0;

  const allocations = allocateRepayment(
    input.debts,
    monthlyAvailableIncome,
    totalDebtPrincipal,
    input.repaymentMonths
  );

  const totalAllocated = allocations.reduce((s, a) => s + a.totalRepayment, 0);
  const repaymentRatePercent =
    totalDebtPrincipal > 0 ? (totalAllocated / totalDebtPrincipal) * 100 : 0;

  return {
    totalDebtPrincipal,
    computedMonthlyIncome,
    effectiveMonthlyIncome,
    suggestedLivingCost,
    effectiveLivingCost,
    monthlyAvailableIncome,
    totalAvailableIncome,
    totalAssetValue,
    liquidationValue,
    presentValueOfRepayment,
    liquidationGuaranteeShortfall,
    requiredBuffer,
    repaymentRatePercent,
    allocations,
  };
}
