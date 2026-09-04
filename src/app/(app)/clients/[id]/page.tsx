import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/current-user";
import { updateClientAction } from "@/app/actions/clients";
import { createCaseAction as createCase } from "@/app/actions/cases";

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

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();

  const client = await prisma.client.findFirst({
    where: { id, officeId: user.officeId },
    include: { cases: { orderBy: { createdAt: "desc" } } },
  });
  if (!client) notFound();

  const updateAction = updateClientAction.bind(null, client.id);
  const newCaseAction = createCase.bind(null, client.id);

  return (
    <div className="max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">{client.name}</h1>
        <Link href="/clients" className="text-sm text-slate-500 hover:underline">
          ← 의뢰인 목록
        </Link>
      </div>

      <section className="mb-8 rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold text-slate-700">기본정보</h2>
        <form action={updateAction} className="grid grid-cols-2 gap-4">
          <Field label="이름" name="name" defaultValue={client.name} required />
          <Field
            label="주민등록번호"
            name="residentNo"
            defaultValue={client.residentNo ?? ""}
          />
          <Field label="전화번호" name="phone" defaultValue={client.phone ?? ""} />
          <Field label="이메일" name="email" defaultValue={client.email ?? ""} />
          <div className="col-span-2">
            <Field label="주소" name="address" defaultValue={client.address ?? ""} />
          </div>
          <div className="col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700">메모</label>
            <textarea
              name="memo"
              rows={2}
              defaultValue={client.memo ?? ""}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
          </div>
          <div className="col-span-2">
            <button
              type="submit"
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              저장
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold text-slate-700">사건 목록</h2>

        <div className="mb-4 space-y-2">
          {client.cases.length === 0 && (
            <p className="text-sm text-slate-400">등록된 사건이 없습니다.</p>
          )}
          {client.cases.map((c) => (
            <Link
              key={c.id}
              href={`/cases/${c.id}`}
              className="flex items-center justify-between rounded-md border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50"
            >
              <span className="font-medium text-slate-900">{TYPE_LABEL[c.caseType]}</span>
              <span className="text-slate-500">{STAGE_LABEL[c.stage]}</span>
            </Link>
          ))}
        </div>

        <form action={newCaseAction} className="flex items-end gap-3 border-t border-slate-100 pt-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">사건 유형</label>
            <select
              name="caseType"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="REHABILITATION">개인회생</option>
              <option value="BANKRUPTCY">개인파산</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">관할법원</label>
            <input
              name="court"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              placeholder="예: 서울회생법원"
            />
          </div>
          <button
            type="submit"
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            + 새 사건 등록
          </button>
        </form>
      </section>
    </div>
  );
}

function Field({
  label,
  name,
  defaultValue,
  required,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      <input
        name={name}
        defaultValue={defaultValue}
        required={required}
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
      />
    </div>
  );
}
