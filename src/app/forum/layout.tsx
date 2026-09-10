import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "전남광주미래포럼",
  description:
    "전남광주미래포럼 - 지속 가능한 광주·전남의 도약과 자치분권의 완성을 위한 26개 분과 협력 포럼",
  openGraph: {
    title: "전남광주미래포럼",
    description:
      "지속 가능한 광주·전남의 도약과 자치분권의 완성을 위한 26개 분과 협력 포럼",
    locale: "ko_KR",
    type: "website",
  },
};

export default function ForumLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white text-neutral-900">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      {/* Scoped to the /forum route segment on purpose (App Router layout,
          not a Pages Router per-page Head) — next/font/google has no
          Korean-script subset for Noto Serif KR. */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@600;700;900&display=swap"
      />
      {children}
    </div>
  );
}
