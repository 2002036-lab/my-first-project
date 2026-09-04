import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/current-user";

const TYPE_LABEL: Record<string, string> = {
  REHABILITATION: "개인회생",
  BANKRUPTCY: "개인파산",
};

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

export default async function CasesPage() {
  const user = await requireUser();
  const cases = await prisma.case.findMany({
    where: { officeId: user.officeId },
    include: { client: true },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">사건</h1>
        <Link href="/clients" className="text-sm text-slate-500 hover:underline">
          의뢰인 목록에서 새 사건 등록 →
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-2 font-medium">의뢰인</th>
              <th className="px-4 py-2 font-medium">유형</th>
              <th className="px-4 py-2 font-medium">진행단계</th>
              <th className="px-4 py-2 font-medium">사건번호</th>
              <th className="px-4 py-2 font-medium">관할법원</th>
              <th className="px-4 py-2 font-medium">업데이트</th>
            </tr>
          </thead>
          <tbody>
            {cases.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                  등록된 사건이 없습니다.
                </td>
              </tr>
            )}
            {cases.map((c) => (
              <tr key={c.id} className="border-t border-slate-100">
                <td className="px-4 py-2">
                  <Link href={`/cases/${c.id}`} className="text-slate-900 hover:underline">
                    {c.client.name}
                  </Link>
                </td>
                <td className="px-4 py-2 text-slate-600">{TYPE_LABEL[c.caseType]}</td>
                <td className="px-4 py-2 text-slate-600">{STAGE_LABEL[c.stage]}</td>
                <td className="px-4 py-2 text-slate-600">{c.caseNumber || "-"}</td>
                <td className="px-4 py-2 text-slate-600">{c.court || "-"}</td>
                <td className="px-4 py-2 text-slate-600">
                  {c.updatedAt.toLocaleDateString("ko-KR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
