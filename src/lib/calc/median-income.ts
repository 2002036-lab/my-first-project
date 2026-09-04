export interface MedianIncomeRow {
  householdSize: number;
  monthlyAmount: number;
}

/** 가구원수에 정확히 일치하는 기준중위소득 행을 찾는다. 없으면 null. */
export function lookupMedianIncome(
  rows: MedianIncomeRow[],
  householdSize: number
): number | null {
  const exact = rows.find((r) => r.householdSize === householdSize);
  if (exact) return exact.monthlyAmount;

  // 정확히 일치하는 구간이 없으면 householdSize 이하 중 가장 큰 값으로 대체 제안
  const below = rows
    .filter((r) => r.householdSize <= householdSize)
    .sort((a, b) => b.householdSize - a.householdSize)[0];
  return below ? below.monthlyAmount : null;
}
