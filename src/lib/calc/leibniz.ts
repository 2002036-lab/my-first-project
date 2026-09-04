/**
 * 월단위 라이프니쯔(연금현가) 계수.
 * 원본 엑셀의 '라이프니쯔' 시트가 저장해 둔 표는 연 5% 기준으로 미리 계산된 값일 뿐이며,
 * 수식 자체는 (1 - (1+r/1200)^-n) / (r/1200) 이므로 표를 저장하지 않고 직접 계산한다.
 */
export function leibnizCoefficient(months: number, annualRatePercent: number): number {
  if (months <= 0) return 0;
  const monthlyRate = annualRatePercent / 1200;
  if (monthlyRate === 0) return months;
  return (1 - Math.pow(1 + monthlyRate, -months)) / monthlyRate;
}
