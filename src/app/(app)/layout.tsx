import Link from "next/link";
import { requireUser } from "@/lib/auth/current-user";
import { logoutAction } from "@/app/login/actions";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="w-56 shrink-0 border-r border-slate-200 bg-white px-4 py-6">
        <div className="mb-8 px-2 text-lg font-semibold text-slate-900">사건관리 ERP</div>
        <nav className="space-y-1 text-sm">
          <Link
            href="/dashboard"
            className="block rounded-md px-3 py-2 text-slate-700 hover:bg-slate-100"
          >
            대시보드
          </Link>
          <Link
            href="/clients"
            className="block rounded-md px-3 py-2 text-slate-700 hover:bg-slate-100"
          >
            의뢰인
          </Link>
          <Link
            href="/cases"
            className="block rounded-md px-3 py-2 text-slate-700 hover:bg-slate-100"
          >
            사건
          </Link>
          <Link
            href="/settings"
            className="block rounded-md px-3 py-2 text-slate-700 hover:bg-slate-100"
          >
            설정
          </Link>
        </nav>

        <div className="mt-10 border-t border-slate-200 pt-4 px-2">
          <p className="mb-2 text-xs text-slate-500">{user.name}님 ({user.role})</p>
          <form action={logoutAction}>
            <button
              type="submit"
              className="text-xs text-slate-500 underline hover:text-slate-800"
            >
              로그아웃
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 px-8 py-6">{children}</main>
    </div>
  );
}
