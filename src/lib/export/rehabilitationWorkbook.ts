import ExcelJS from "exceljs";
import type {
  Case,
  CaseAsset,
  CaseDebt,
  CaseDependent,
  CaseIncomeItem,
  CaseRealEstate,
  Client,
  Creditor,
} from "@prisma/client";
import type { RehabCalculationResult } from "@/lib/calc/rehabilitation";
import {
  addCreditorListSheet,
  addAssetListSheet,
  addAssetAnnexSheets,
  addRepaymentScheduleSheet,
  addIncomeStatementSheet,
} from "./officialForms";

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
  debts: (CaseDebt & { creditor: Creditor | null })[];
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

  addCreditorListSheet(wb, { caseData: input.caseData, debts: input.debts });
  addAssetListSheet(wb, {
    assets: input.assets,
    realEstates: input.realEstates,
    exemptAssetAmount: input.caseData.exemptAssetAmount,
  });
  addAssetAnnexSheets(wb, { assets: input.assets, realEstates: input.realEstates });
  if (input.calc && input.caseData.caseType === "REHABILITATION") {
    addRepaymentScheduleSheet(wb, {
      caseData: input.caseData,
      client: input.client,
      calc: input.calc,
    });
  }
  addIncomeStatementSheet(wb, {
    incomeItems: input.incomeItems,
    incomeAvgMonths: input.caseData.incomeAvgMonths,
  });
  if (input.calc) addSummarySheet(wb, input);

  return wb.xlsx.writeBuffer();
}

function addSummarySheet(wb: ExcelJS.Workbook, { calc, client, caseData }: WorkbookInput) {
  if (!calc) return;
  const sheet = wb.addWorksheet("계산근거(참고)");
  sheet.columns = [
    { header: "항목", key: "label", width: 30 },
    { header: "값", key: "value", width: 20 },
  ];
  sheet.insertRow(1, [`개인회생 변제계획 계산근거 - ${client.name}`]);
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
}
