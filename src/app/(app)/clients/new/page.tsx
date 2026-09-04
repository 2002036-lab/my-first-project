import { createClientAction } from "@/app/actions/clients";

export default function NewClientPage() {
  return (
    <div className="max-w-lg">
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">의뢰인 등록</h1>
      <form action={createClientAction} className="space-y-4">
        <Field label="이름" name="name" required />
        <Field label="주민등록번호" name="residentNo" placeholder="000000-0000000" />
        <Field label="전화번호" name="phone" />
        <Field label="주소" name="address" />
        <Field label="이메일" name="email" type="email" />
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">메모</label>
          <textarea
            name="memo"
            rows={3}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          등록
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      <input
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
      />
    </div>
  );
}
