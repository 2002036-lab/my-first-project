import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/current-user";

const STAGE_LABEL: Record<string, string> = {
  CONSULTATION: "상담",
  INTAKE: "접수",
  DOCUMENT_PREP: "서류준비",
  FILED: "법원제출",
  COMMENCEMENT: "개시결정",
  CONFIRMED: "인가/면책",
  CLOSED: "종결",
  DISCONTINUED: "폐지/각하",
};

const TYPE_LABEL: Record<string, string> = {
  REHABILITATION: "개인회생",
  BANKRUPTCY: "개인파산",
};

export default async function DashboardPage() {
  const user = await requireUser();

  const cases = await prisma.case.findMany({
    where: { officeId: user.officeId },
    include: { client: true },
    orderBy: { updatedAt: "desc" },
    take: 10,
  });

  const stageCounts = await prisma.case.groupBy({
    by: ["stage"],
    where: { officeId: user.officeId },
    _count: true,
  });

  const totalCases = await prisma.case.count({ where: { officeId: user.officeId } });
  const totalClients = await prisma.client.count({ where: { officeId: user.officeId } });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">대시보드</h1>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">전체 의뢰인</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{totalClients}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">전체 사건</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{totalCases}</p>
        </div>
        {stageCounts.slice(0, 2).map((s) => (
          <div key={s.stage} className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-500">{STAGE_LABEL[s.stage] ?? s.stage}</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">{s._count}</p>
          </div>
        ))}
      </div>

      <h2 className="mb-3 text-lg font-medium text-slate-900">최근 업데이트된 사건</h2>
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-2 font-medium">의뢰인</th>
              <th className="px-4 py-2 font-medium">유형</th>
              <th className="px-4 py-2 font-medium">진행단계</th>
              <th className="px-4 py-2 font-medium">사건번호</th>
            </tr>
          </thead>
          <tbody>
            {cases.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                  등록된 사건이 없습니다.
                </td>
              </tr>
            )}
            {cases.map((c) => (
              <tr key={c.id} className="border-t border-slate-100">
                <td className="px-4 py-2">
                  <a href={`/cases/${c.id}`} className="text-slate-900 hover:underline">
                    {c.client.name}
                  </a>
                </td>
                <td className="px-4 py-2 text-slate-600">{TYPE_LABEL[c.caseType]}</td>
                <td className="px-4 py-2 text-slate-600">{STAGE_LABEL[c.stage]}</td>
                <td className="px-4 py-2 text-slate-600">{c.caseNumber || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
