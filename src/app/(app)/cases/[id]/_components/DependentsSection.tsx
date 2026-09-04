import { addDependentAction, deleteDependentAction } from "@/app/actions/cases";
import type { CaseDependent } from "@prisma/client";

export function DependentsSection({
  caseId,
  dependents,
}: {
  caseId: string;
  dependents: CaseDependent[];
}) {
  const addAction = addDependentAction.bind(null, caseId);

  return (
    <section id="dependents" className="rounded-lg border border-slate-200 bg-white p-6">
      <h2 className="mb-1 text-sm font-semibold text-slate-700">부양가족</h2>
      <p className="mb-4 text-xs text-slate-500">
        가구원수(본인 + 부양가족 수)로 기준중위소득표를 조회해 생계비 공제액을 계산합니다.
      </p>

      <ul className="mb-4 space-y-1 text-sm">
        {dependents.length === 0 && <li className="text-slate-400">등록된 부양가족이 없습니다.</li>}
        {dependents.map((d) => (
          <li
            key={d.id}
            className="flex items-center justify-between rounded-md border border-slate-100 px-3 py-2"
          >
            <span>
              {d.name || "(이름 미입력)"}{" "}
              <span className="text-slate-400">{d.relationship}</span>
            </span>
            <DeleteButton caseId={caseId} dependentId={d.id} />
          </li>
        ))}
      </ul>

      <form action={addAction} className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-4 text-sm">
        <input name="name" placeholder="이름" className="rounded-md border border-slate-300 px-2 py-1.5" />
        <input
          name="relationship"
          placeholder="관계 (배우자/자녀 등)"
          className="rounded-md border border-slate-300 px-2 py-1.5"
        />
        <button type="submit" className="rounded-md bg-slate-900 px-4 py-1.5 text-white hover:bg-slate-800">
          + 추가
        </button>
      </form>
    </section>
  );
}

function DeleteButton({ caseId, dependentId }: { caseId: string; dependentId: string }) {
  const action = deleteDependentAction.bind(null, caseId, dependentId);
  return (
    <form action={action}>
      <button type="submit" className="text-xs text-red-500 hover:underline">
        삭제
      </button>
    </form>
  );
}
