import { addDebtAction, deleteDebtAction } from "@/app/actions/cases";
import type { CaseDebt } from "@prisma/client";
import { fmt } from "../format";

export function DebtsSection({ caseId, debts }: { caseId: string; debts: CaseDebt[] }) {
  const addAction = addDebtAction.bind(null, caseId);
  const totalPrincipal = debts.reduce((s, d) => s + (d.principal ?? 0), 0);

  return (
    <section id="debts" className="rounded-lg border border-slate-200 bg-white p-6">
      <h2 className="mb-4 text-sm font-semibold text-slate-700">채무일람표</h2>

      <div className="mb-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-3 py-2 font-medium">순번</th>
              <th className="px-3 py-2 font-medium">채권자</th>
              <th className="px-3 py-2 font-medium">발생원인</th>
              <th className="px-3 py-2 font-medium text-right">채무원금</th>
              <th className="px-3 py-2 font-medium text-right">이자</th>
              <th className="px-3 py-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {debts.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-slate-400">
                  등록된 채무가 없습니다.
                </td>
              </tr>
            )}
            {debts.map((d) => (
              <tr key={d.id} className="border-t border-slate-100">
                <td className="px-3 py-2">{d.seq}</td>
                <td className="px-3 py-2">{d.creditorName}</td>
                <td className="px-3 py-2 text-slate-600">{d.cause || "-"}</td>
                <td className="px-3 py-2 text-right text-slate-700">
                  {d.isFutureClaim ? "장래구상권" : fmt(d.principal)}
                </td>
                <td className="px-3 py-2 text-right text-slate-700">{fmt(d.interest)}</td>
                <td className="px-3 py-2 text-right">
                  <DeleteButton caseId={caseId} debtId={d.id} />
                </td>
              </tr>
            ))}
          </tbody>
          {debts.length > 0 && (
            <tfoot>
              <tr className="border-t border-slate-200 font-medium">
                <td colSpan={3} className="px-3 py-2">
                  합계
                </td>
                <td className="px-3 py-2 text-right">{fmt(totalPrincipal)}</td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      <form action={addAction} className="grid grid-cols-6 gap-2 border-t border-slate-100 pt-4 text-sm">
        <input name="seq" placeholder="순번" className="rounded-md border border-slate-300 px-2 py-1.5" />
        <input
          name="creditorName"
          placeholder="채권자명"
          required
          className="col-span-2 rounded-md border border-slate-300 px-2 py-1.5"
        />
        <input name="cause" placeholder="발생원인" className="col-span-2 rounded-md border border-slate-300 px-2 py-1.5" />
        <input name="basis" placeholder="산정근거" className="rounded-md border border-slate-300 px-2 py-1.5" />

        <input name="debtDateText" placeholder="채무발생일자" className="rounded-md border border-slate-300 px-2 py-1.5" />
        <input name="originalAmount" type="number" placeholder="최초대출금" className="rounded-md border border-slate-300 px-2 py-1.5" />
        <input name="principal" type="number" placeholder="채무원금" className="rounded-md border border-slate-300 px-2 py-1.5" />
        <input name="interest" type="number" placeholder="이자" className="rounded-md border border-slate-300 px-2 py-1.5" />
        <input name="otherCost" type="number" placeholder="기타비용" className="rounded-md border border-slate-300 px-2 py-1.5" />

        <label className="flex items-center gap-1 text-xs text-slate-600">
          <input type="checkbox" name="isFutureClaim" /> 장래구상권(원금 미확정)
        </label>

        <button
          type="submit"
          className="col-span-6 mt-1 rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-800"
        >
          + 채무 추가
        </button>
      </form>
    </section>
  );
}

function DeleteButton({ caseId, debtId }: { caseId: string; debtId: string }) {
  const action = deleteDebtAction.bind(null, caseId, debtId);
  return (
    <form action={action}>
      <button type="submit" className="text-xs text-red-500 hover:underline">
        삭제
      </button>
    </form>
  );
}
