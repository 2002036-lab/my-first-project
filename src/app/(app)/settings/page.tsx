import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/current-user";
import { upsertMedianIncomeAction, deleteMedianIncomeAction } from "@/app/actions/settings";

export default async function SettingsPage() {
  await requireUser();
  const rows = await prisma.medianIncomeStandard.findMany({
    orderBy: [{ year: "desc" }, { householdSize: "asc" }],
  });

  const currentYear = new Date().getFullYear();

  return (
    <div className="max-w-2xl">
      <h1 className="mb-2 text-2xl font-semibold text-slate-900">설정</h1>
      <h2 className="mb-1 mt-6 text-sm font-semibold text-slate-700">기준중위소득표 (생계비 공제 기준)</h2>
      <p className="mb-4 text-xs text-slate-500">
        보건복지부가 매년 고시하는 기준중위소득 값을 가구원수별로 입력해두면, 사건별 계산결과에서
        부양가족 수에 맞춰 자동으로 생계비 공제액을 조회합니다. 반드시 그 해의 공식 고시 금액으로
        입력/갱신해주세요.
      </p>

      <div className="mb-6 overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-3 py-2 font-medium">연도</th>
              <th className="px-3 py-2 font-medium">가구원수</th>
              <th className="px-3 py-2 font-medium text-right">월 기준금액</th>
              <th className="px-3 py-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="px-3 py-6 text-center text-slate-400">
                  등록된 기준중위소득 값이 없습니다.
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-slate-100">
                <td className="px-3 py-2">{r.year}</td>
                <td className="px-3 py-2">{r.householdSize}인</td>
                <td className="px-3 py-2 text-right">
                  {r.monthlyAmount.toLocaleString("ko-KR")}
                  {r.monthlyAmount === 0 && (
                    <span className="ml-2 text-xs text-amber-600">(미입력)</span>
                  )}
                </td>
                <td className="px-3 py-2 text-right">
                  <DeleteButton id={r.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form
        action={upsertMedianIncomeAction}
        className="grid grid-cols-4 gap-2 rounded-lg border border-slate-200 bg-white p-4 text-sm"
      >
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-700">연도</label>
          <input
            type="number"
            name="year"
            defaultValue={currentYear}
            className="w-full rounded-md border border-slate-300 px-2 py-1.5"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-700">가구원수</label>
          <input
            type="number"
            step="0.5"
            name="householdSize"
            className="w-full rounded-md border border-slate-300 px-2 py-1.5"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-700">월 기준금액</label>
          <input
            type="number"
            name="monthlyAmount"
            className="w-full rounded-md border border-slate-300 px-2 py-1.5"
          />
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            className="w-full rounded-md bg-slate-900 px-4 py-1.5 text-white hover:bg-slate-800"
          >
            저장
          </button>
        </div>
      </form>
    </div>
  );
}

function DeleteButton({ id }: { id: string }) {
  const action = deleteMedianIncomeAction.bind(null, id);
  return (
    <form action={action}>
      <button type="submit" className="text-xs text-red-500 hover:underline">
        삭제
      </button>
    </form>
  );
}
