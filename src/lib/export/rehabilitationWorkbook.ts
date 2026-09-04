import ExcelJS from "exceljs";
import type {
  Case,
  CaseAsset,
  CaseDebt,
  CaseDependent,
  CaseIncomeItem,
  CaseRealEstate,
  Client,
} from "@prisma/client";
import type { RehabCalculationResult } from "@/lib/calc/rehabilitation";

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

const HEADER_FILL: ExcelJS.Fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FFE2E8F0" },
};

function styleHeaderRow(row: ExcelJS.Row) {
  row.eachCell((cell) => {
    cell.font = { bold: true };
    cell.fill = HEADER_FILL;
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    cell.border = {
      top: { style: "thin" },
      bottom: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" },
    };
  });
}

function borderAll(row: ExcelJS.Row) {
  row.eachCell((cell) => {
    cell.border = {
      top: { style: "thin" },
      bottom: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" },
    };
  });
}

export interface WorkbookInput {
  client: Client;
  caseData: Case;
  debts: CaseDebt[];
  incomeItems: CaseIncomeItem[];
  dependents: CaseDependent[];
  assets: CaseAsset[];
  realEstates: CaseRealEstate[];
  calc: RehabCalculationResult | null;
}

export async function buildRehabilitationWorkbook(input: WorkbookInput): Promise<ExcelJS.Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "개인회생·파산 사건관리 ERP";
  wb.created = new Date();

  addDebtSheet(wb, input);
  addIncomeSheet(wb, input);
  addAssetSheet(wb, input);
  if (input.calc) addSummarySheet(wb, input);

  return wb.xlsx.writeBuffer();
}

const DEBT_COLUMNS: { header: string; key: string; width: number }[] = [
  { header: "순번", key: "seq", width: 8 },
  { header: "채권자", key: "creditor", width: 22 },
  { header: "채무발생일자", key: "date", width: 16 },
  { header: "발생원인", key: "cause", width: 28 },
  { header: "최초대출금", key: "original", width: 14 },
  { header: "채무원금", key: "principal", width: 14 },
  { header: "기타비용", key: "other", width: 12 },
  { header: "이자", key: "interest", width: 12 },
  { header: "합계", key: "total", width: 14 },
  { header: "산정근거", key: "basis", width: 18 },
  { header: "비고", key: "note", width: 20 },
];

function addDebtSheet(wb: ExcelJS.Workbook, { client, debts }: WorkbookInput) {
  const sheet = wb.addWorksheet("채무일람표");
  sheet.columns = DEBT_COLUMNS.map(({ key, width }) => ({ key, width }));

  sheet.insertRow(1, [`채무 일람표 - ${client.name}`]);
  sheet.mergeCells(1, 1, 1, DEBT_COLUMNS.length);
  sheet.getRow(1).font = { bold: true, size: 14 };
  sheet.getRow(2).values = DEBT_COLUMNS.map((c) => c.header);
  styleHeaderRow(sheet.getRow(2));

  let totalPrincipal = 0;
  let totalInterest = 0;
  let totalSum = 0;

  debts.forEach((d) => {
    const principal = d.isFutureClaim ? null : d.principal ?? 0;
    const total = (principal ?? 0) + (d.otherCost ?? 0) + (d.interest ?? 0);
    if (principal !== null) totalPrincipal += principal;
    totalInterest += d.interest ?? 0;
    totalSum += total;

    const row = sheet.addRow({
      seq: d.seq,
      creditor: d.creditorName,
      date: d.debtDateText ?? "",
      cause: d.cause ?? "",
      original: d.originalAmount ?? "",
      principal: d.isFutureClaim ? "장래구상권" : principal,
      other: d.otherCost ?? "",
      interest: d.interest ?? "",
      total,
      basis: d.basis ?? "",
      note: d.note ?? "",
    });
    borderAll(row);
  });

  const totalRow = sheet.addRow({
    seq: "",
    creditor: "합계",
    principal: totalPrincipal,
    interest: totalInterest,
    total: totalSum,
  });
  totalRow.font = { bold: true };
  borderAll(totalRow);
}

function addIncomeSheet(wb: ExcelJS.Workbook, { incomeItems }: WorkbookInput) {
  const sheet = wb.addWorksheet("소득_공제내역");
  sheet.columns = [
    { header: "월", key: "month", width: 12 },
    { header: "구분", key: "kind", width: 10 },
    { header: "항목", key: "category", width: 20 },
    { header: "금액", key: "amount", width: 14 },
  ];
  styleHeaderRow(sheet.getRow(1));

  incomeItems.forEach((i) => {
    const row = sheet.addRow({
      month: i.yearMonth,
      kind: i.kind === "INCOME" ? "소득" : "공제",
      category: i.category,
      amount: i.amount,
    });
    borderAll(row);
  });
}

function addAssetSheet(
  wb: ExcelJS.Workbook,
  { assets, realEstates }: WorkbookInput
) {
  const sheet = wb.addWorksheet("재산목록");
  sheet.columns = [
    { header: "구분", key: "category", width: 16 },
    { header: "명칭", key: "name", width: 22 },
    { header: "계좌/등록번호", key: "accountNo", width: 20 },
    { header: "금액/시가", key: "amount", width: 16 },
    { header: "압류유무", key: "seized", width: 10 },
    { header: "비고", key: "note", width: 24 },
  ];
  styleHeaderRow(sheet.getRow(1));

  let total = 0;
  assets.forEach((a) => {
    total += a.amount;
    const row = sheet.addRow({
      category: ASSET_CATEGORY_LABEL[a.category] ?? a.category,
      name: a.name ?? "",
      accountNo: a.accountNo ?? "",
      amount: a.amount,
      seized: a.seized ? "유" : "무",
      note: a.note ?? "",
    });
    borderAll(row);
  });

  realEstates.forEach((r) => {
    const net = Math.max((r.marketValue ?? 0) - (r.securedDebt ?? 0), 0);
    total += net;
    const row = sheet.addRow({
      category: "부동산",
      name: r.location ?? "",
      accountNo: r.propertyType ?? "",
      amount: net,
      seized: "-",
      note: `시가 ${r.marketValue ?? 0} / 담보액 ${r.securedDebt ?? 0}`,
    });
    borderAll(row);
  });

  const totalRow = sheet.addRow({ category: "합계", amount: total });
  totalRow.font = { bold: true };
  borderAll(totalRow);
}

function addSummarySheet(wb: ExcelJS.Workbook, { calc, client, caseData }: WorkbookInput) {
  if (!calc) return;
  const sheet = wb.addWorksheet("계산결과");
  sheet.columns = [
    { header: "항목", key: "label", width: 30 },
    { header: "값", key: "value", width: 20 },
  ];
  sheet.insertRow(1, [`개인회생 변제계획 계산결과 - ${client.name}`]);
  sheet.mergeCells(1, 1, 1, 2);
  sheet.getRow(1).font = { bold: true, size: 14 };
  sheet.getRow(2).values = ["항목", "값"];
  styleHeaderRow(sheet.getRow(2));

  const rows: [string, string | number][] = [
    ["총 채무원금", calc.totalDebtPrincipal],
    ["월평균소득(계산값)", calc.computedMonthlyIncome],
    ["적용 월소득", calc.effectiveMonthlyIncome],
    ["적용 생계비공제", calc.effectiveLivingCost],
    ["월 가용소득", calc.monthlyAvailableIncome],
    ["변제기간(개월)", caseData.repaymentMonths],
    ["총 변제예정액", calc.totalAvailableIncome],
    ["변제율(원금대비, %)", Number(calc.repaymentRatePercent.toFixed(2))],
    ["재산 합계", calc.totalAssetValue],
    ["청산가치", calc.liquidationValue],
    ["변제계획 현재가치", calc.presentValueOfRepayment],
    [
      "청산가치 보장원칙",
      calc.liquidationGuaranteeShortfall > 0
        ? `미충족 우려 (부족액 ${Math.round(calc.liquidationGuaranteeShortfall).toLocaleString()}원)`
        : "충족",
    ],
  ];
  rows.forEach(([label, value]) => {
    const row = sheet.addRow({ label, value });
    borderAll(row);
  });

  sheet.addRow([]);
  const headerRow = sheet.addRow(["채권번호", "채권자", "채권원금", "월변제예정액", "총변제예정액"]);
  styleHeaderRow(headerRow);
  calc.allocations.forEach((a) => {
    const row = sheet.addRow([a.seq, a.creditorName, a.principal, a.monthlyRepayment, a.totalRepayment]);
    borderAll(row);
  });
}
