import {
  addAssetAction,
  deleteAssetAction,
  addRealEstateAction,
  deleteRealEstateAction,
} from "@/app/actions/cases";
import type { CaseAsset, CaseRealEstate } from "@prisma/client";
import { fmt } from "../format";

const CATEGORY_LABEL: Record<string, string> = {
  CASH: "현금",
  DEPOSIT: "예금",
  INSURANCE: "보험",
  VEHICLE: "자동차/오토바이",
  LEASE_DEPOSIT: "임차보증금",
  BUSINESS_INVENTORY: "사업용 설비/재고/비품",
  LOAN_RECEIVABLE: "대여금 채권",
  SALES_RECEIVABLE: "매출금 채권",
  EXPECTED_SEVERANCE: "예상 퇴직금",
  OTHER: "기타",
};

export function AssetsSection({
  caseId,
  assets,
  realEstates,
}: {
  caseId: string;
  assets: CaseAsset[];
  realEstates: CaseRealEstate[];
}) {
  const addAsset = addAssetAction.bind(null, caseId);
  const addRealEstate = addRealEstateAction.bind(null, caseId);

  const assetTotal = assets.reduce((s, a) => s + a.amount, 0);
  const realEstateTotal = realEstates.reduce(
    (s, r) => s + Math.max((r.marketValue ?? 0) - (r.securedDebt ?? 0), 0),
    0
  );

  return (
    <section id="assets" className="rounded-lg border border-slate-200 bg-white p-6">
      <h2 className="mb-4 text-sm font-semibold text-slate-700">재산목록</h2>

      <div className="mb-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-3 py-2 font-medium">구분</th>
              <th className="px-3 py-2 font-medium">명칭</th>
              <th className="px-3 py-2 font-medium">계좌/등록번호</th>
              <th className="px-3 py-2 font-medium text-right">금액</th>
              <th className="px-3 py-2 font-medium">압류</th>
              <th className="px-3 py-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {assets.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-slate-400">
                  등록된 재산이 없습니다.
                </td>
              </tr>
            )}
            {assets.map((a) => (
              <tr key={a.id} className="border-t border-slate-100">
                <td className="px-3 py-2">{CATEGORY_LABEL[a.category]}</td>
                <td className="px-3 py-2">{a.name || "-"}</td>
                <td className="px-3 py-2 text-slate-600">{a.accountNo || "-"}</td>
                <td className="px-3 py-2 text-right">{fmt(a.amount)}</td>
                <td className="px-3 py-2">{a.seized ? "유" : "무"}</td>
                <td className="px-3 py-2 text-right">
                  <DeleteAssetButton caseId={caseId} assetId={a.id} />
                </td>
              </tr>
            ))}
          </tbody>
          {assets.length > 0 && (
            <tfoot>
              <tr className="border-t border-slate-200 font-medium">
                <td colSpan={3} className="px-3 py-2">
                  소계
                </td>
                <td className="px-3 py-2 text-right">{fmt(assetTotal)}</td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      <form
        action={addAsset}
        className="grid grid-cols-6 gap-2 border-b border-slate-100 pb-6 text-sm"
      >
        <select name="category" className="rounded-md border border-slate-300 px-2 py-1.5">
          {Object.entries(CATEGORY_LABEL).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <input name="name" placeholder="명칭(은행명 등)" className="rounded-md border border-slate-300 px-2 py-1.5" />
        <input
          name="accountNo"
          placeholder="계좌/등록번호"
          className="rounded-md border border-slate-300 px-2 py-1.5"
        />
        <input
          name="amount"
          type="number"
          placeholder="금액"
          required
          className="rounded-md border border-slate-300 px-2 py-1.5"
        />
        <label className="flex items-center gap-1 text-xs text-slate-600">
          <input type="checkbox" name="seized" /> 압류
        </label>
        <button type="submit" className="rounded-md bg-slate-900 px-4 py-1.5 text-white hover:bg-slate-800">
          + 추가
        </button>
      </form>

      <h3 className="mb-3 mt-6 text-sm font-semibold text-slate-700">부동산</h3>
      <div className="mb-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-3 py-2 font-medium">소재지/면적</th>
              <th className="px-3 py-2 font-medium">종류</th>
              <th className="px-3 py-2 font-medium">권리</th>
              <th className="px-3 py-2 font-medium text-right">시가</th>
              <th className="px-3 py-2 font-medium text-right">담보액</th>
              <th className="px-3 py-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {realEstates.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-slate-400">
                  등록된 부동산이 없습니다.
                </td>
              </tr>
            )}
            {realEstates.map((r) => (
              <tr key={r.id} className="border-t border-slate-100">
                <td className="px-3 py-2">{r.location || "-"}</td>
                <td className="px-3 py-2">{r.propertyType || "-"}</td>
                <td className="px-3 py-2">{r.ownershipRight || "-"}</td>
                <td className="px-3 py-2 text-right">{fmt(r.marketValue)}</td>
                <td className="px-3 py-2 text-right">{fmt(r.securedDebt)}</td>
                <td className="px-3 py-2 text-right">
                  <DeleteRealEstateButton caseId={caseId} realEstateId={r.id} />
                </td>
              </tr>
            ))}
          </tbody>
          {realEstates.length > 0 && (
            <tfoot>
              <tr className="border-t border-slate-200 font-medium">
                <td colSpan={3} className="px-3 py-2">
                  소계(시가-담보액)
                </td>
                <td colSpan={2} className="px-3 py-2 text-right">
                  {fmt(realEstateTotal)}
                </td>
                <td></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      <form action={addRealEstate} className="grid grid-cols-6 gap-2 text-sm">
        <input
          name="location"
          placeholder="소재지, 면적"
          className="col-span-2 rounded-md border border-slate-300 px-2 py-1.5"
        />
        <input name="propertyType" placeholder="종류(토지/건물 등)" className="rounded-md border border-slate-300 px-2 py-1.5" />
        <input name="ownershipRight" placeholder="권리(소유자 등)" className="rounded-md border border-slate-300 px-2 py-1.5" />
        <input name="marketValue" type="number" placeholder="시가" className="rounded-md border border-slate-300 px-2 py-1.5" />
        <input name="securedDebt" type="number" placeholder="담보액" className="rounded-md border border-slate-300 px-2 py-1.5" />
        <button
          type="submit"
          className="col-span-6 mt-1 rounded-md bg-slate-900 px-4 py-1.5 text-white hover:bg-slate-800"
        >
          + 부동산 추가
        </button>
      </form>
    </section>
  );
}

function DeleteAssetButton({ caseId, assetId }: { caseId: string; assetId: string }) {
  const action = deleteAssetAction.bind(null, caseId, assetId);
  return (
    <form action={action}>
      <button type="submit" className="text-xs text-red-500 hover:underline">
        삭제
      </button>
    </form>
  );
}

function DeleteRealEstateButton({
  caseId,
  realEstateId,
}: {
  caseId: string;
  realEstateId: string;
}) {
  const action = deleteRealEstateAction.bind(null, caseId, realEstateId);
  return (
    <form action={action}>
      <button type="submit" className="text-xs text-red-500 hover:underline">
        삭제
      </button>
    </form>
  );
}
