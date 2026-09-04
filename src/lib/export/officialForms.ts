import ExcelJS from "exceljs";
import type {
  Case,
  CaseAsset,
  CaseDebt,
  CaseRealEstate,
  Client,
  Creditor,
} from "@prisma/client";
import type { RehabCalculationResult } from "@/lib/calc/rehabilitation";

type DebtWithCreditor = CaseDebt & { creditor: Creditor | null };

const THIN = { style: "thin" } as const;
const ALL_BORDERS = { top: THIN, bottom: THIN, left: THIN, right: THIN };

function setBorder(cell: ExcelJS.Cell) {
  cell.border = ALL_BORDERS;
}

function borderRange(sheet: ExcelJS.Worksheet, r1: number, c1: number, r2: number, c2: number) {
  for (let r = r1; r <= r2; r++) {
    for (let c = c1; c <= c2; c++) {
      setBorder(sheet.getCell(r, c));
    }
  }
}

function setCell(
  sheet: ExcelJS.Worksheet,
  row: number,
  col: number,
  value: ExcelJS.CellValue,
  opts?: { bold?: boolean; center?: boolean; wrap?: boolean; fill?: boolean; size?: number }
) {
  const cell = sheet.getCell(row, col);
  cell.value = value;
  cell.font = { bold: !!opts?.bold, size: opts?.size ?? 10 };
  cell.alignment = {
    vertical: "middle",
    horizontal: opts?.center ? "center" : "left",
    wrapText: opts?.wrap ?? true,
  };
  if (opts?.fill) {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF1F5F9" } };
  }
  setBorder(cell);
  return cell;
}

function mergeAndSet(
  sheet: ExcelJS.Worksheet,
  r1: number,
  c1: number,
  r2: number,
  c2: number,
  value: ExcelJS.CellValue,
  opts?: { bold?: boolean; center?: boolean; fill?: boolean; size?: number }
) {
  sheet.mergeCells(r1, c1, r2, c2);
  const cell = setCell(sheet, r1, c1, value, { ...opts, wrap: true });
  borderRange(sheet, r1, c1, r2, c2);
  return cell;
}

function won(n: number | null | undefined): string {
  return `${Math.round(n ?? 0).toLocaleString("ko-KR")}`;
}

function fmtDate(d: Date | null | undefined): string {
  if (!d) return "";
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

// ---------------------------------------------------------------------------
// 채권자목록 (개인회생: 전산양식 A5424와 동일한 레이아웃)
// ---------------------------------------------------------------------------

function buildClaimContentText(debt: CaseDebt): string {
  const principal = debt.principal;
  if (debt.isFutureClaim || principal === null) {
    return "보증채무를 대위변제할 경우 대위변제금액 및 이에 대한 대위변제일  이후의 민사법정이율에 의한 이자";
  }
  const principalPlusOther = principal + (debt.otherCost ?? 0);
  const total = principalPlusOther + (debt.interest ?? 0);
  const d = debt.claimDate ?? debt.baseDate ?? new Date();
  return (
    `금 ${won(total)}(원금+이자)원 및 이중 원금잔액  ${won(principal)}원에 대하여 ` +
    `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일  이후부터 완제일까지 ` +
    `약정이율의 비율에 의한금원`
  );
}

export function addCreditorListSheet(
  wb: ExcelJS.Workbook,
  { caseData, debts }: { caseData: Case; debts: DebtWithCreditor[] }
) {
  const isRehab = caseData.caseType === "REHABILITATION";
  const sheet = wb.addWorksheet(isRehab ? "채권자목록(회생)" : "채권자목록");
  sheet.columns = Array.from({ length: 12 }, (_, i) => ({ width: i === 0 ? 8 : 9 }));

  const title = isRehab ? "개인회생채권자목록" : "채권자목록 (파산)";
  mergeAndSet(sheet, 1, 1, 1, 12, title, { bold: true, center: true, size: 14 });

  const baseDates = debts.map((d) => d.baseDate).filter((d): d is Date => !!d);
  const latestBaseDate = baseDates.length
    ? new Date(Math.max(...baseDates.map((d) => d.getTime())))
    : new Date();

  mergeAndSet(sheet, 2, 1, 2, 4, "채권현재액 산정기준일 :");
  mergeAndSet(sheet, 2, 5, 2, 7, fmtDate(latestBaseDate), { center: true });
  setCell(sheet, 2, 10, "목록작성일:");
  mergeAndSet(sheet, 2, 11, 2, 12, fmtDate(new Date()), { center: true });

  const totalPrincipalAndInterest = debts.reduce((s, d) => {
    if (d.principal === null) return s;
    return s + d.principal + (d.otherCost ?? 0) + (d.interest ?? 0);
  }, 0);

  mergeAndSet(sheet, 4, 1, 4, 2, "채권현재액\n총합계", { bold: true, center: true, fill: true });
  mergeAndSet(sheet, 4, 3, 4, 5, won(totalPrincipalAndInterest), { center: true });
  mergeAndSet(sheet, 4, 6, 4, 7, "담보부 회생채권액의 합계", { bold: true, center: true, fill: true });
  mergeAndSet(sheet, 4, 8, 4, 9, won(0), { center: true });
  mergeAndSet(sheet, 4, 10, 4, 10, "무담보 회생채권액의 합계", { bold: true, center: true, fill: true });
  mergeAndSet(sheet, 4, 11, 4, 12, won(totalPrincipalAndInterest), { center: true });

  if (isRehab) {
    mergeAndSet(
      sheet,
      6,
      1,
      6,
      12,
      "※ 개시후이자 등: 아래 각 채권의 개시결정일 이후의 이자·지연손해금 등은 채무자 회생 및 파산에 관한 법률 제581조 제2항, 제446조 제1항 제1, 2호의 후순위채권입니다.",
      { size: 9 }
    );
  }

  const headerTop = 8;
  mergeAndSet(sheet, headerTop, 1, headerTop + 3, 1, "채권\n번호", { bold: true, center: true, fill: true });
  mergeAndSet(sheet, headerTop, 2, headerTop + 3, 2, "채권자", { bold: true, center: true, fill: true });
  mergeAndSet(sheet, headerTop, 3, headerTop, 8, "채권의 원인", { bold: true, center: true, fill: true });
  mergeAndSet(sheet, headerTop, 9, headerTop, 12, "주소 및 연락처", { bold: true, center: true, fill: true });
  mergeAndSet(sheet, headerTop + 1, 3, headerTop + 1, 9, "채권의 내용", { bold: true, center: true, fill: true });
  mergeAndSet(sheet, headerTop + 1, 10, headerTop + 1, 12, "부속서류 유무", { bold: true, center: true, fill: true });
  mergeAndSet(sheet, headerTop + 2, 3, headerTop + 2, 7, "채권현재액(원금)", { bold: true, center: true, fill: true });
  mergeAndSet(sheet, headerTop + 2, 8, headerTop + 2, 12, "산정근거", { bold: true, center: true, fill: true });
  mergeAndSet(sheet, headerTop + 3, 3, headerTop + 3, 7, "채권현재액(이자)", { bold: true, center: true, fill: true });
  mergeAndSet(sheet, headerTop + 3, 8, headerTop + 3, 12, "산정근거", { bold: true, center: true, fill: true });

  let row = headerTop + 4;
  for (const debt of debts) {
    const r1 = row;
    const r2 = row + 1;
    const r3 = row + 2;
    const r4 = row + 3;
    const r5 = row + 4;

    mergeAndSet(sheet, r1, 1, r5, 1, debt.seq, { center: true });
    mergeAndSet(sheet, r1, 2, r5, 2, debt.creditorName, { center: true });

    mergeAndSet(sheet, r1, 3, r1, 4, debt.debtDateText ?? fmtDate(debt.baseDate));
    setCell(sheet, r1, 5, "자", { center: true });
    mergeAndSet(sheet, r1, 6, r1, 8, debt.cause ?? "");
    setCell(sheet, r1, 9, "(주소)");
    mergeAndSet(sheet, r1, 10, r1, 12, debt.creditor?.address ?? "");

    mergeAndSet(sheet, r2, 3, r2, 5, debt.originalAmount !== null ? won(debt.originalAmount) : "", {
      center: true,
    });
    setCell(sheet, r2, 6, "원");
    setCell(sheet, r2, 9, "(전화)");
    setCell(sheet, r2, 10, debt.creditor?.phone ?? "");
    setCell(sheet, r2, 11, "(팩스)");
    setBorder(sheet.getCell(r2, 12));

    mergeAndSet(sheet, r3, 3, r3, 9, buildClaimContentText(debt), { size: 9 });
    mergeAndSet(sheet, r3, 10, r3, 12, "□ 부속서류", { center: true });

    const principalCurrent =
      debt.principal !== null ? debt.principal + (debt.otherCost ?? 0) : null;
    mergeAndSet(
      sheet,
      r4,
      3,
      r4,
      5,
      principalCurrent !== null ? won(principalCurrent) : "미발생",
      { center: true }
    );
    setCell(sheet, r4, 6, "원");
    mergeAndSet(sheet, r4, 7, r4, 9, debt.basis ?? "");
    setCell(sheet, r4, 10, "(산정기준일)");
    mergeAndSet(sheet, r4, 11, r4, 12, fmtDate(debt.baseDate), { center: true });

    mergeAndSet(sheet, r5, 3, r5, 5, won(debt.interest ?? 0), { center: true });
    setCell(sheet, r5, 6, "원");
    mergeAndSet(sheet, r5, 7, r5, 9, debt.basis ?? "");
    setCell(sheet, r5, 10, "(산정기준일)");
    mergeAndSet(sheet, r5, 11, r5, 12, fmtDate(debt.baseDate), { center: true });

    row += 5;
  }

  if (!isRehab) {
    mergeAndSet(sheet, row + 1, 1, row + 1, 12, "※ 파산 사건의 정확한 서식은 관할법원 양식을 별도 확인하시기 바랍니다.", {
      size: 9,
    });
  }
}

// ---------------------------------------------------------------------------
// 재산목록
// ---------------------------------------------------------------------------

const ASSET_CATEGORY_LABEL: Record<string, string> = {
  CASH: "현금",
  DEPOSIT: "예금",
  INSURANCE: "보험",
  VEHICLE: "자동차/오토바이",
  LEASE_DEPOSIT: "임차보증금",
  BUSINESS_INVENTORY: "사업용 설비/재고품/비품",
  LOAN_RECEIVABLE: "대여금 채권",
  SALES_RECEIVABLE: "매출금 채권",
  EXPECTED_SEVERANCE: "예상 퇴직금",
  OTHER: "기타",
};

function sumByCategory(assets: CaseAsset[], category: string): number {
  return assets.filter((a) => a.category === category).reduce((s, a) => s + a.amount, 0);
}

function namesByCategory(assets: CaseAsset[], category: string): string {
  return assets
    .filter((a) => a.category === category)
    .map((a) => a.name)
    .filter(Boolean)
    .join(", ");
}

export function addAssetListSheet(
  wb: ExcelJS.Workbook,
  {
    assets,
    realEstates,
    exemptAssetAmount,
  }: { assets: CaseAsset[]; realEstates: CaseRealEstate[]; exemptAssetAmount: number | null }
) {
  const sheet = wb.addWorksheet("재산목록");
  sheet.columns = Array.from({ length: 10 }, () => ({ width: 12 }));

  mergeAndSet(sheet, 1, 1, 1, 10, "재 산 목 록", { bold: true, center: true, size: 14 });
  setCell(sheet, 2, 10, "(단위:원)", { center: true });

  mergeAndSet(sheet, 3, 1, 3, 1, "명 칭", { bold: true, center: true, fill: true });
  mergeAndSet(sheet, 3, 2, 3, 2, "금액 또는 시가", { bold: true, center: true, fill: true });
  mergeAndSet(sheet, 3, 3, 3, 3, "압류유무", { bold: true, center: true, fill: true });
  mergeAndSet(sheet, 3, 4, 3, 10, "비 고", { bold: true, center: true, fill: true });

  let row = 4;
  const cash = sumByCategory(assets, "CASH");
  mergeAndSet(sheet, row, 1, row, 1, "현금", { center: true });
  mergeAndSet(sheet, row, 2, row, 2, won(cash), { center: true });
  mergeAndSet(sheet, row, 3, row, 3, "무", { center: true });
  mergeAndSet(sheet, row, 4, row, 10, "");
  row += 1;

  function categoryBlock(category: string, extraNote?: string) {
    const total = sumByCategory(assets, category);
    const names = namesByCategory(assets, category);
    const seized = assets.some((a) => a.category === category && a.seized);
    const r1 = row;
    const r3 = row + 2;
    mergeAndSet(sheet, r1, 1, r3, 1, ASSET_CATEGORY_LABEL[category], { center: true });
    mergeAndSet(sheet, r1, 2, r3, 2, won(total), { center: true });
    mergeAndSet(sheet, r1, 3, r3, 3, seized ? "유" : "무", { center: true });
    mergeAndSet(sheet, r1, 4, r3, 10, names || extraNote || "해당사항 없음", { center: true });
    row += 3;
  }

  categoryBlock("DEPOSIT");
  categoryBlock("INSURANCE");
  categoryBlock("VEHICLE");

  // 임차보증금
  const lease = sumByCategory(assets, "LEASE_DEPOSIT");
  {
    const r1 = row;
    const r3 = row + 2;
    mergeAndSet(sheet, r1, 1, r3, 1, "임차보증금", { center: true });
    mergeAndSet(sheet, r1, 2, r3, 2, won(lease), { center: true });
    mergeAndSet(sheet, r1, 3, r3, 3, "무", { center: true });
    mergeAndSet(sheet, r1, 4, r3, 10, lease > 0 ? namesByCategory(assets, "LEASE_DEPOSIT") : "해당사항 없음", {
      center: true,
    });
    row += 3;
  }

  // 부동산
  {
    const realEstateTotal = realEstates.reduce(
      (s, r) => s + Math.max((r.marketValue ?? 0) - (r.securedDebt ?? 0), 0),
      0
    );
    const r1 = row;
    const r4 = row + 3;
    mergeAndSet(sheet, r1, 1, r4, 1, "부동산", { center: true });
    mergeAndSet(sheet, r1, 2, r4, 2, won(realEstateTotal), { center: true });
    mergeAndSet(sheet, r1, 3, r4, 3, "무", { center: true });
    const desc = realEstates.map((r) => r.location).filter(Boolean).join(" / ");
    mergeAndSet(sheet, r1, 4, r4, 10, desc || "해당사항 없음", { center: true });
    row += 4;
  }

  categoryBlock("BUSINESS_INVENTORY");

  function singleRow(category: string) {
    const total = sumByCategory(assets, category);
    mergeAndSet(sheet, row, 1, row, 1, ASSET_CATEGORY_LABEL[category], { center: true });
    mergeAndSet(sheet, row, 2, row, 2, won(total), { center: true });
    mergeAndSet(sheet, row, 3, row, 3, "무", { center: true });
    mergeAndSet(sheet, row, 4, row, 10, namesByCategory(assets, category), { center: true });
    row += 1;
  }

  singleRow("LOAN_RECEIVABLE");
  singleRow("SALES_RECEIVABLE");
  singleRow("EXPECTED_SEVERANCE");
  singleRow("OTHER");

  const grandTotal =
    assets.reduce((s, a) => s + a.amount, 0) +
    realEstates.reduce((s, r) => s + Math.max((r.marketValue ?? 0) - (r.securedDebt ?? 0), 0), 0);

  mergeAndSet(sheet, row, 1, row, 1, "합 계", { bold: true, center: true, fill: true });
  mergeAndSet(sheet, row, 2, row, 2, won(grandTotal), { bold: true, center: true });
  mergeAndSet(sheet, row, 3, row, 10, "");
  row += 1;

  mergeAndSet(sheet, row, 1, row, 1, "면제재산결정\n신청 금액", { bold: true, center: true, fill: true });
  mergeAndSet(sheet, row, 2, row, 2, won(exemptAssetAmount ?? 0), { center: true });
  mergeAndSet(sheet, row, 3, row, 10, "", {});
  row += 1;

  mergeAndSet(sheet, row, 1, row, 1, "청산가치", { bold: true, center: true, fill: true });
  mergeAndSet(sheet, row, 2, row, 2, won(Math.max(grandTotal - (exemptAssetAmount ?? 0), 0)), {
    bold: true,
    center: true,
  });
  mergeAndSet(sheet, row, 3, row, 10, "");
}

// ---------------------------------------------------------------------------
// 개인회생채권 변제예정액표
// ---------------------------------------------------------------------------

export function addRepaymentScheduleSheet(
  wb: ExcelJS.Workbook,
  {
    caseData,
    client,
    calc,
  }: { caseData: Case; client: Client; calc: RehabCalculationResult }
) {
  const sheet = wb.addWorksheet("변제예정액표");
  sheet.columns = Array.from({ length: 12 }, () => ({ width: 10 }));

  mergeAndSet(
    sheet,
    1,
    1,
    1,
    5,
    `${caseData.caseNumber ?? ""}    채무자 ${client.name}`,
    { size: 10 }
  );
  mergeAndSet(sheet, 2, 1, 2, 12, "개인회생채권 변제예정액 표", { bold: true, center: true, size: 14 });

  setCell(sheet, 3, 1, "1. 기초사항", { bold: true });
  setCell(sheet, 3, 12, "(단위 : 원)", { center: true });

  mergeAndSet(sheet, 4, 1, 4, 2, "(A) 월평균\n가용소득", { bold: true, center: true, fill: true });
  mergeAndSet(sheet, 4, 3, 4, 4, won(calc.monthlyAvailableIncome), { center: true });
  mergeAndSet(sheet, 4, 5, 4, 6, "(B) 변제횟수", { bold: true, center: true, fill: true });
  mergeAndSet(sheet, 4, 7, 4, 8, caseData.repaymentMonths, { center: true });
  mergeAndSet(sheet, 4, 9, 4, 10, "(C) 총\n가용소득", { bold: true, center: true, fill: true });
  mergeAndSet(sheet, 4, 11, 4, 12, won(calc.totalAvailableIncome), { center: true });

  mergeAndSet(sheet, 6, 1, 6, 5, "2. 채권자별 변제예정액의 산정내역", { bold: true });
  mergeAndSet(
    sheet,
    7,
    1,
    7,
    12,
    ` 가. 제 1 회 ~ ${caseData.repaymentMonths}회 변제예정액`,
    { bold: true }
  );

  mergeAndSet(sheet, 8, 1, 9, 1, "채권\n번호", { bold: true, center: true, fill: true });
  mergeAndSet(sheet, 8, 2, 9, 2, "채권자", { bold: true, center: true, fill: true });
  mergeAndSet(sheet, 8, 3, 8, 5, "(D) 개인회생채권액", { bold: true, center: true, fill: true });
  mergeAndSet(sheet, 8, 6, 8, 9, "(E) 월 변제예정액", { bold: true, center: true, fill: true });
  mergeAndSet(sheet, 8, 10, 8, 12, "(F) 총 변제예정액", { bold: true, center: true, fill: true });
  setCell(sheet, 9, 3, "확정채권액(원금)", { center: true, fill: true, bold: true });
  mergeAndSet(sheet, 9, 4, 9, 5, "미확정채권액(원금)", { center: true, fill: true, bold: true });
  mergeAndSet(sheet, 9, 6, 9, 7, "확정채권액", { center: true, fill: true, bold: true });
  mergeAndSet(sheet, 9, 8, 9, 9, "미확정채권액", { center: true, fill: true, bold: true });
  mergeAndSet(sheet, 9, 10, 9, 11, "확정채권액", { center: true, fill: true, bold: true });
  setCell(sheet, 9, 12, "미확정채권액", { center: true, fill: true, bold: true });

  let row = 10;
  for (const a of calc.allocations) {
    setCell(sheet, row, 1, a.seq, { center: true });
    setCell(sheet, row, 2, a.creditorName, { center: true });
    setCell(sheet, row, 3, won(a.principal), { center: true });
    mergeAndSet(sheet, row, 4, row, 5, "", {});
    mergeAndSet(sheet, row, 6, row, 7, won(a.monthlyRepayment), { center: true });
    mergeAndSet(sheet, row, 8, row, 9, "", {});
    mergeAndSet(sheet, row, 10, row, 11, won(a.totalRepayment), { center: true });
    setCell(sheet, row, 12, "", {});
    row += 1;
  }

  const totalRow = row;
  setCell(sheet, totalRow, 1, "", {});
  mergeAndSet(sheet, totalRow, 1, totalRow, 2, "합 계", { bold: true, center: true, fill: true });
  setCell(sheet, totalRow, 3, won(calc.totalDebtPrincipal), { bold: true, center: true });
  mergeAndSet(sheet, totalRow, 4, totalRow, 5, "", {});
  const totalMonthly = calc.allocations.reduce((s, a) => s + a.monthlyRepayment, 0);
  mergeAndSet(sheet, totalRow, 6, totalRow, 7, won(totalMonthly), { bold: true, center: true });
  mergeAndSet(sheet, totalRow, 8, totalRow, 9, "", {});
  const totalAll = calc.allocations.reduce((s, a) => s + a.totalRepayment, 0);
  mergeAndSet(sheet, totalRow, 10, totalRow, 11, won(totalAll), { bold: true, center: true });
  setCell(sheet, totalRow, 12, "", {});
  row += 2;

  mergeAndSet(
    sheet,
    row,
    1,
    row,
    5,
    `3. 변제율 : 원금의 ${calc.repaymentRatePercent.toFixed(2)}% 상당액`,
    { bold: true }
  );
  row += 2;

  setCell(sheet, row, 1, "4. 청산가치와의 비교", { bold: true });
  row += 1;

  mergeAndSet(sheet, row, 1, row + 1, 1, "(J)\n청산가치", { bold: true, center: true, fill: true });
  mergeAndSet(sheet, row, 2, row + 1, 2, won(calc.liquidationValue), { center: true });
  mergeAndSet(sheet, row, 3, row, 6, "(K) 가용소득에 의한\n총변제예정액", { bold: true, center: true, fill: true });
  mergeAndSet(sheet, row, 7, row, 9, won(calc.totalAvailableIncome), { center: true });
  row += 1;
  mergeAndSet(sheet, row, 3, row, 6, "(L) 현재가치", { bold: true, center: true, fill: true });
  mergeAndSet(sheet, row, 7, row, 9, won(calc.presentValueOfRepayment), { center: true });
  row += 2;

  const violates = calc.liquidationGuaranteeShortfall > 0;
  mergeAndSet(
    sheet,
    row,
    1,
    row,
    12,
    violates
      ? `※ 청산가치 보장원칙 미충족 우려: 현재가치가 청산가치보다 ${won(
          calc.liquidationGuaranteeShortfall
        )}원 부족합니다. 안전마진 반영 시 최소 ${won(calc.requiredBuffer)}원 추가 확보 검토 필요.`
      : "※ 변제계획의 현재가치가 청산가치 이상으로, 청산가치 보장원칙을 충족합니다.",
    { size: 10, bold: true }
  );
}
