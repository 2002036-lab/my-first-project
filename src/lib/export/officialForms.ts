import ExcelJS from "exceljs";
import type {
  Case,
  CaseAsset,
  CaseDebt,
  CaseIncomeItem,
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

  function categoryBlock(category: string, annexSheetName?: string) {
    const total = sumByCategory(assets, category);
    const hasItems = assets.some((a) => a.category === category);
    const seized = assets.some((a) => a.category === category && a.seized);
    const r1 = row;
    const r3 = row + 2;
    mergeAndSet(sheet, r1, 1, r3, 1, ASSET_CATEGORY_LABEL[category], { center: true });
    mergeAndSet(sheet, r1, 2, r3, 2, won(total), { center: true });
    mergeAndSet(sheet, r1, 3, r3, 3, seized ? "유" : "무", { center: true });
    const note = hasItems
      ? annexSheetName
        ? `별지. ${annexSheetName} 참조`
        : namesByCategory(assets, category)
      : "해당사항 없음";
    mergeAndSet(sheet, r1, 4, r3, 10, note, { center: true });
    row += 3;
  }

  categoryBlock("DEPOSIT", "예금목록");
  categoryBlock("INSURANCE", "보험목록");
  categoryBlock("VEHICLE", "자동차목록");

  // 임차보증금
  const lease = sumByCategory(assets, "LEASE_DEPOSIT");
  {
    const r1 = row;
    const r3 = row + 2;
    mergeAndSet(sheet, r1, 1, r3, 1, "임차보증금", { center: true });
    mergeAndSet(sheet, r1, 2, r3, 2, won(lease), { center: true });
    mergeAndSet(sheet, r1, 3, r3, 3, "무", { center: true });
    mergeAndSet(sheet, r1, 4, r3, 10, lease > 0 ? "별지. 임차보증금목록 참조" : "해당사항 없음", {
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
    mergeAndSet(sheet, r1, 4, r4, 10, realEstates.length > 0 ? "별지. 부동산목록 참조" : "해당사항 없음", {
      center: true,
    });
    row += 4;
  }

  categoryBlock("BUSINESS_INVENTORY", "사업용 설비·재고자산목록");

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
// 재산목록 별지 (품목별 상세내역)
// ---------------------------------------------------------------------------

function addItemListSheet(
  wb: ExcelJS.Workbook,
  {
    sheetName,
    title,
    columns,
    rows,
  }: {
    sheetName: string;
    title: string;
    columns: { header: string; width: number }[];
    rows: ExcelJS.CellValue[][];
  }
) {
  const sheet = wb.addWorksheet(sheetName);
  sheet.columns = columns.map((c) => ({ width: c.width }));

  const colCount = columns.length;
  mergeAndSet(sheet, 1, 1, 1, colCount, title, { bold: true, size: 12 });
  setCell(sheet, 2, colCount, "(단위 : 원)", { center: true });

  const headerRow = 3;
  columns.forEach((c, i) => {
    setCell(sheet, headerRow, i + 1, c.header, { bold: true, center: true, fill: true });
  });

  rows.forEach((rowValues, i) => {
    const r = headerRow + 1 + i;
    rowValues.forEach((v, ci) => {
      setCell(sheet, r, ci + 1, v, { center: ci !== 1 });
    });
  });
}

export function addAssetAnnexSheets(
  wb: ExcelJS.Workbook,
  { assets, realEstates }: { assets: CaseAsset[]; realEstates: CaseRealEstate[] }
) {
  const deposits = assets.filter((a) => a.category === "DEPOSIT");
  if (deposits.length > 0) {
    addItemListSheet(wb, {
      sheetName: "별지_예금",
      title: "별지. 예금",
      columns: [
        { header: "순번", width: 6 },
        { header: "은행명", width: 20 },
        { header: "계좌번호", width: 22 },
        { header: "현재잔액", width: 16 },
        { header: "비고", width: 24 },
      ],
      rows: deposits.map((a, i) => [i + 1, a.name ?? "", a.accountNo ?? "", won(a.amount), a.note ?? ""]),
    });
  }

  const insurances = assets.filter((a) => a.category === "INSURANCE");
  if (insurances.length > 0) {
    addItemListSheet(wb, {
      sheetName: "별지_보험료",
      title: "별지. 보험",
      columns: [
        { header: "순번", width: 6 },
        { header: "보험회사명", width: 20 },
        { header: "증권번호", width: 22 },
        { header: "해약반환금", width: 16 },
        { header: "비고", width: 24 },
      ],
      rows: insurances.map((a, i) => [i + 1, a.name ?? "", a.accountNo ?? "", won(a.amount), a.note ?? ""]),
    });
  }

  const vehicles = assets.filter((a) => a.category === "VEHICLE");
  if (vehicles.length > 0) {
    addItemListSheet(wb, {
      sheetName: "별지_자동차",
      title: "별지. 자동차",
      columns: [
        { header: "순번", width: 6 },
        { header: "차종", width: 20 },
        { header: "등록번호", width: 16 },
        { header: "시세", width: 16 },
        { header: "비고", width: 30 },
      ],
      rows: vehicles.map((a, i) => [i + 1, a.name ?? "", a.accountNo ?? "", won(a.amount), a.note ?? ""]),
    });
  }

  const leases = assets.filter((a) => a.category === "LEASE_DEPOSIT");
  if (leases.length > 0) {
    addItemListSheet(wb, {
      sheetName: "별지_임차보증금",
      title: "별지. 임차보증금",
      columns: [
        { header: "순번", width: 6 },
        { header: "임차물건", width: 26 },
        { header: "보증금", width: 16 },
        { header: "비고", width: 24 },
      ],
      rows: leases.map((a, i) => [i + 1, a.name ?? "", won(a.amount), a.note ?? ""]),
    });
  }

  const inventory = assets.filter((a) => a.category === "BUSINESS_INVENTORY");
  if (inventory.length > 0) {
    addItemListSheet(wb, {
      sheetName: "별지_사업용재고자산",
      title: "별지. 사업용 설비·재고자산",
      columns: [
        { header: "순번", width: 6 },
        { header: "품목", width: 22 },
        { header: "수량/등록번호", width: 18 },
        { header: "평가액", width: 16 },
        { header: "비고", width: 24 },
      ],
      rows: inventory.map((a, i) => [i + 1, a.name ?? "", a.accountNo ?? "", won(a.amount), a.note ?? ""]),
    });
  }

  if (realEstates.length > 0) {
    addItemListSheet(wb, {
      sheetName: "별지_부동산",
      title: "별지. 부동산",
      columns: [
        { header: "순번", width: 6 },
        { header: "소재지, 면적", width: 34 },
        { header: "부동산 종류", width: 14 },
        { header: "권리의 종류", width: 18 },
        { header: "시가", width: 16 },
        { header: "담보액", width: 16 },
        { header: "환가예상액(순가치)", width: 18 },
        { header: "비고", width: 20 },
      ],
      rows: realEstates.map((r, i) => [
        i + 1,
        r.location ?? "",
        r.propertyType ?? "",
        r.ownershipRight ?? "",
        won(r.marketValue),
        won(r.securedDebt),
        won(Math.max((r.marketValue ?? 0) - (r.securedDebt ?? 0), 0)),
        r.note ?? "",
      ]),
    });
  }
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

// ---------------------------------------------------------------------------
// 월평균소득 산출 내역서 (월별 소득/공제 피벗)
// ---------------------------------------------------------------------------

export function addIncomeStatementSheet(
  wb: ExcelJS.Workbook,
  { incomeItems, incomeAvgMonths }: { incomeItems: CaseIncomeItem[]; incomeAvgMonths: number }
) {
  const sheet = wb.addWorksheet("소득산출");

  const months = Array.from(new Set(incomeItems.map((i) => i.yearMonth))).sort();
  const colCount = Math.max(2 + months.length + 1, 4);
  sheet.columns = Array.from({ length: colCount }, (_, i) => ({ width: i < 2 ? 14 : 12 }));

  mergeAndSet(sheet, 1, 1, 1, colCount, "■ 월평균소득 산출 내역서", { bold: true, size: 13 });
  if (months.length > 0) {
    mergeAndSet(sheet, 2, 1, 2, colCount, `(${months[0]} ~ ${months[months.length - 1]})`, {
      center: true,
    });
  }

  const headerRow = 4;
  mergeAndSet(sheet, headerRow, 1, headerRow + 1, 2, "구 분", { bold: true, center: true, fill: true });
  months.forEach((m, i) => {
    setCell(sheet, headerRow, 3 + i, m, { bold: true, center: true, fill: true });
  });
  mergeAndSet(sheet, headerRow, 3 + months.length, headerRow + 1, 3 + months.length, "합계", {
    bold: true,
    center: true,
    fill: true,
  });

  function categories(kind: "INCOME" | "DEDUCTION"): string[] {
    const seen: string[] = [];
    incomeItems
      .filter((i) => i.kind === kind)
      .forEach((i) => {
        if (!seen.includes(i.category)) seen.push(i.category);
      });
    return seen;
  }

  function amountFor(category: string, kind: "INCOME" | "DEDUCTION", month: string): number {
    const item = incomeItems.find(
      (i) => i.kind === kind && i.category === category && i.yearMonth === month
    );
    return item?.amount ?? 0;
  }

  function sectionTotal(cats: string[], kind: "INCOME" | "DEDUCTION", month: string): number {
    return cats.reduce((s, cat) => s + amountFor(cat, kind, month), 0);
  }

  let row = headerRow + 2;
  const incomeCats = categories("INCOME");
  const incomeStartRow = row;
  incomeCats.forEach((cat) => {
    setCell(sheet, row, 2, cat, {});
    let total = 0;
    months.forEach((m, i) => {
      const v = amountFor(cat, "INCOME", m);
      total += v;
      setCell(sheet, row, 3 + i, v || "", { center: true });
    });
    setCell(sheet, row, 3 + months.length, won(total), { center: true, bold: true });
    row += 1;
  });
  if (incomeCats.length > 0) {
    mergeAndSet(sheet, incomeStartRow, 1, row - 1, 1, "소득내역", { bold: true, center: true, fill: true });
  }

  mergeAndSet(sheet, row, 1, row, 2, "계 (A)", { bold: true, center: true, fill: true });
  months.forEach((m, i) => {
    setCell(sheet, row, 3 + i, won(sectionTotal(incomeCats, "INCOME", m)), { center: true, bold: true });
  });
  const totalA = months.reduce((s, m) => s + sectionTotal(incomeCats, "INCOME", m), 0);
  setCell(sheet, row, 3 + months.length, won(totalA), { center: true, bold: true });
  row += 1;

  const dedCats = categories("DEDUCTION");
  const deductionStartRow = row;
  dedCats.forEach((cat) => {
    setCell(sheet, row, 2, cat, {});
    let total = 0;
    months.forEach((m, i) => {
      const v = amountFor(cat, "DEDUCTION", m);
      total += v;
      setCell(sheet, row, 3 + i, v || "", { center: true });
    });
    setCell(sheet, row, 3 + months.length, won(total), { center: true, bold: true });
    row += 1;
  });
  if (dedCats.length > 0) {
    mergeAndSet(sheet, deductionStartRow, 1, row - 1, 1, "공제내역", { bold: true, center: true, fill: true });
  }

  mergeAndSet(sheet, row, 1, row, 2, "계 (B)", { bold: true, center: true, fill: true });
  months.forEach((m, i) => {
    setCell(sheet, row, 3 + i, won(sectionTotal(dedCats, "DEDUCTION", m)), { center: true, bold: true });
  });
  const totalB = months.reduce((s, m) => s + sectionTotal(dedCats, "DEDUCTION", m), 0);
  setCell(sheet, row, 3 + months.length, won(totalB), { center: true, bold: true });
  row += 1;

  mergeAndSet(sheet, row, 1, row, 2, "월 소득 (A-B)", { bold: true, center: true, fill: true });
  months.forEach((m, i) => {
    const a = sectionTotal(incomeCats, "INCOME", m);
    const b = sectionTotal(dedCats, "DEDUCTION", m);
    setCell(sheet, row, 3 + i, won(a - b), { center: true });
  });
  setCell(sheet, row, 3 + months.length, won(totalA - totalB), { center: true, bold: true });
  row += 2;

  const monthCount = months.length || 1;
  setCell(sheet, row, 1, "연 소득총액(C)", { bold: true });
  setCell(sheet, row, 2, won(totalA), { center: true });
  setCell(sheet, row, 3, "연 공제총액(D)", { bold: true });
  setCell(sheet, row, 4, won(totalB), { center: true });
  row += 1;
  setCell(sheet, row, 1, "연 실수령액(C-D)", { bold: true });
  setCell(sheet, row, 2, won(totalA - totalB), { center: true });
  setCell(sheet, row, 3, "월평균소득(연평균)", { bold: true });
  setCell(sheet, row, 4, won((totalA - totalB) / monthCount), { center: true });
  row += 2;

  const recentMonths = months.slice(-incomeAvgMonths);
  const recentTotal = recentMonths.reduce((s, m) => {
    const a = sectionTotal(incomeCats, "INCOME", m);
    const b = sectionTotal(dedCats, "DEDUCTION", m);
    return s + (a - b);
  }, 0);
  mergeAndSet(
    sheet,
    row,
    1,
    row,
    Math.min(6, colCount),
    `※ 실제 계산에는 최근 ${incomeAvgMonths}개월(${recentMonths[0] ?? "-"} ~ ${
      recentMonths[recentMonths.length - 1] ?? "-"
    }) 평균 ${won(recentMonths.length ? recentTotal / recentMonths.length : 0)}원이 사용되었습니다.`,
    { size: 9 }
  );
}
