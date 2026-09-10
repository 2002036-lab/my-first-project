import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "전남광주미래포럼",
  description:
    "전남광주미래포럼 - 전남과 광주 지역의 상생 발전과 미래 산업 육성을 위한 민간 협력 포럼",
};

export default function ForumLayout({ children }: { children: React.ReactNode }) {
  return <div className="bg-white text-neutral-900">{children}</div>;
}
