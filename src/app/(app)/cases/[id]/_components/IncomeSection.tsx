import { addIncomeItemAction, deleteIncomeItemAction } from "@/app/actions/cases";
import type { CaseIncomeItem } from "@prisma/client";
import { fmt } from "../format";

export function IncomeSection({
  caseId,
  items,
}: {
  caseId: string;
  items: CaseIncomeItem[];
}) {
  const addAction = addIncomeItemAction.bind(null, caseId);

  const months = Array.from(new Set(items.map((i) => i.yearMonth))).sort().reverse();

  return (
    <section id="income" className="rounded-lg border border-slate-200 bg-white p-6">
      <h2 className="mb-4 text-sm font-semibold text-slate-700">
        월별 소득 / 공제 내역
      </h2>
      <p className="mb-4 text-xs text-slate-500">
        최근 월부터 입력하세요. 계산결과 탭에서 설정한 &apos;월평균소득 산정 개월수&apos;만큼
        최근 월을 평균내어 월소득을 계산합니다.
      </p>

      <div className="mb-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-3 py-2 font-medium">월</th>
              <th className="px-3 py-2 font-medium">구분</th>
              <th className="px-3 py-2 font-medium">항목</th>
              <th className="px-3 py-2 font-medium text-right">금액</th>
              <th className="px-3 py-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-slate-400">
                  등록된 소득/공제 내역이 없습니다.
                </td>
              </tr>
            )}
            {items.map((i) => (
              <tr key={i.id} className="border-t border-slate-100">
                <td className="px-3 py-2">{i.yearMonth}</td>
                <td className="px-3 py-2">
                  {i.kind === "INCOME" ? (
                    <span className="text-emerald-600">소득</span>
                  ) : (
                    <span className="text-red-500">공제</span>
                  )}
                </td>
                <td className="px-3 py-2">{i.category}</td>
                <td className="px-3 py-2 text-right">{fmt(i.amount)}</td>
                <td className="px-3 py-2 text-right">
                  <DeleteButton caseId={caseId} itemId={i.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {months.length > 0 && (
        <p className="mb-4 text-xs text-slate-400">입력된 월: {months.join(", ")}</p>
      )}

      <form
        action={addAction}
        className="grid grid-cols-5 gap-2 border-t border-slate-100 pt-4 text-sm"
      >
        <input
          name="yearMonth"
          placeholder="2025-01"
          required
          className="rounded-md border border-slate-300 px-2 py-1.5"
        />
        <select name="kind" className="rounded-md border border-slate-300 px-2 py-1.5">
          <option value="INCOME">소득</option>
          <option value="DEDUCTION">공제</option>
        </select>
        <input
          name="category"
          placeholder="항목 (예: 기본급, 국민연금)"
          required
          className="rounded-md border border-slate-300 px-2 py-1.5"
        />
        <input
          name="amount"
          type="number"
          placeholder="금액"
          required
          className="rounded-md border border-slate-300 px-2 py-1.5"
        />
        <button
          type="submit"
          className="rounded-md bg-slate-900 px-4 py-1.5 text-white hover:bg-slate-800"
        >
          + 추가
        </button>
      </form>
    </section>
  );
}

function DeleteButton({ caseId, itemId }: { caseId: string; itemId: string }) {
  const action = deleteIncomeItemAction.bind(null, caseId, itemId);
  return (
    <form action={action}>
      <button type="submit" className="text-xs text-red-500 hover:underline">
        삭제
      </button>
    </form>
  );
}
