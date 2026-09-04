import { updateCaseParamsAction, updateCaseStageAction } from "@/app/actions/cases";
import type { Case } from "@prisma/client";

const STAGES: { value: string; label: string }[] = [
  { value: "CONSULTATION", label: "상담" },
  { value: "INTAKE", label: "접수" },
  { value: "DOCUMENT_PREP", label: "서류준비" },
  { value: "FILED", label: "법원제출" },
  { value: "COMMENCEMENT", label: "개시결정" },
  { value: "CONFIRMED", label: "인가/면책" },
  { value: "CLOSED", label: "종결" },
  { value: "DISCONTINUED", label: "폐지/각하" },
];

export function CaseParamsForm({ caseData }: { caseData: Case }) {
  const saveAction = updateCaseParamsAction.bind(null, caseData.id);

  return (
    <section id="basic" className="rounded-lg border border-slate-200 bg-white p-6">
      <h2 className="mb-4 text-sm font-semibold text-slate-700">기본정보 · 계산 파라미터</h2>

      <div className="mb-4 flex flex-wrap gap-2">
        {STAGES.map((s) => {
          const action = updateCaseStageAction.bind(null, caseData.id, s.value as never);
          const active = caseData.stage === s.value;
          return (
            <form action={action} key={s.value}>
              <button
                type="submit"
                className={`rounded-full px-3 py-1 text-xs ${
                  active
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {s.label}
              </button>
            </form>
          );
        })}
      </div>

      <form action={saveAction} className="grid grid-cols-3 gap-4 text-sm">
        <TextField label="사건번호" name="caseNumber" defaultValue={caseData.caseNumber ?? ""} />
        <TextField label="관할법원" name="court" defaultValue={caseData.court ?? ""} />
        <div />

        <NumField
          label="변제기간(개월)"
          name="repaymentMonths"
          defaultValue={caseData.repaymentMonths}
        />
        <NumField
          label="적립기간(개월)"
          name="accumulationMonths"
          defaultValue={caseData.accumulationMonths}
        />
        <NumField
          label="소득평균 산정개월수"
          name="incomeAvgMonths"
          defaultValue={caseData.incomeAvgMonths}
        />

        <NumField
          label="현재가치 할인율(연,%)"
          name="discountRatePercent"
          defaultValue={caseData.discountRatePercent}
          step="0.1"
        />
        <NumField
          label="청산가치 안전마진(%)"
          name="liquidationBufferPercent"
          defaultValue={caseData.liquidationBufferPercent}
          step="1"
        />
        <NumField
          label="면제재산결정 신청 금액"
          name="exemptAssetAmount"
          defaultValue={caseData.exemptAssetAmount ?? undefined}
        />

        <NumField
          label="최종 확정 월소득(수기)"
          name="finalMonthlyIncomeOverride"
          defaultValue={caseData.finalMonthlyIncomeOverride ?? undefined}
        />
        <NumField
          label="최종 확정 생계비공제(수기)"
          name="finalLivingCostOverride"
          defaultValue={caseData.finalLivingCostOverride ?? undefined}
        />
        <div className="flex items-end">
          <button
            type="submit"
            className="w-full rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-800"
          >
            저장
          </button>
        </div>
      </form>
    </section>
  );
}

function TextField({
  label,
  name,
  defaultValue,
}: {
  label: string;
  name: string;
  defaultValue?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-700">{label}</label>
      <input
        name={name}
        defaultValue={defaultValue}
        className="w-full rounded-md border border-slate-300 px-2 py-1.5"
      />
    </div>
  );
}

function NumField({
  label,
  name,
  defaultValue,
  step,
}: {
  label: string;
  name: string;
  defaultValue?: number;
  step?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-700">{label}</label>
      <input
        type="number"
        step={step}
        name={name}
        defaultValue={defaultValue}
        className="w-full rounded-md border border-slate-300 px-2 py-1.5"
      />
    </div>
  );
}
