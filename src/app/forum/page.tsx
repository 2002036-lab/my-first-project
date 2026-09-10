import Header from "./_components/Header";

// 예시 데이터입니다. 실제 포럼 연혁으로 교체해 주세요.
const HISTORY = [
  { date: "2023.11", text: "전남광주미래포럼 설립준비위원회 구성" },
  { date: "2024.03", text: "창립총회 개최 및 초대 상임의장 선출" },
  { date: "2024.09", text: "전남·광주 미래산업 협력 세미나 개최" },
  { date: "2025.05", text: "청년 일자리 정책 제안 토론회 개최" },
  { date: "2025.12", text: "지역 상생발전 업무협약(MOU) 체결" },
  { date: "2026.06", text: "제2회 정기총회 개최" },
];

// 예시 데이터입니다. 실제 소식으로 교체해 주세요.
const NEWS = [
  {
    tag: "공지",
    date: "2026.09.01",
    title: "2026년 하반기 정기 세미나 참가 신청 안내",
  },
  {
    tag: "행사",
    date: "2026.08.12",
    title: "전남·광주 청년창업 네트워킹 데이 개최",
  },
  {
    tag: "보도자료",
    date: "2026.07.20",
    title: "지역 미래산업 육성을 위한 공동 정책 제안서 발표",
  },
  {
    tag: "활동",
    date: "2026.06.05",
    title: "제2회 정기총회 및 우수 회원사 시상식 개최",
  },
];

const VALUES = [
  {
    title: "지역 상생 협력",
    desc: "전남과 광주의 행정 경계를 넘어, 상생 발전을 위한 민·관·산·학 협력 네트워크를 구축합니다.",
  },
  {
    title: "미래산업 육성",
    desc: "인공지능, 에너지, 모빌리티 등 미래 신산업 분야의 지역 정착과 성장을 지원합니다.",
  },
  {
    title: "청년 일자리 · 정주",
    desc: "지역 청년의 정주 여건 개선과 양질의 일자리 창출을 위한 정책을 제안합니다.",
  },
];

const ORG_CHART = [
  { level: "총회", desc: "전체 회원사 및 회원으로 구성된 최고 의결기구" },
  { level: "상임의장 · 공동의장단", desc: "포럼을 대표하고 주요 사업을 총괄" },
  {
    level: "운영위원회",
    desc: "기획운영 · 산업협력 · 청년정책 · 대외협력 분과",
  },
  { level: "사무국", desc: "실무 운영 및 회원사 지원" },
];

export default function ForumHomePage() {
  return (
    <div id="top" className="min-h-screen bg-white text-neutral-900">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-sky-800 text-white">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32">
          <p className="text-sm font-semibold tracking-widest text-sky-300 uppercase">
            Jeonnam · Gwangju Future Forum
          </p>
          <h1 className="mt-4 max-w-3xl break-keep text-3xl font-bold leading-tight sm:text-5xl">
            전남과 광주, 하나의 미래를 그립니다
          </h1>
          <p className="mt-6 max-w-xl break-keep text-base leading-relaxed text-blue-100 sm:text-lg">
            전남광주미래포럼은 전남과 광주 지역의 산업·청년·상생 발전을 위해
            함께하는 민간 협력 포럼입니다.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <a
              href="#about"
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-blue-900 transition-colors hover:bg-blue-50"
            >
              포럼 소개 보기
            </a>
            <a
              href="#location"
              className="rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              문의하기
            </a>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mb-12 max-w-2xl">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-blue-800">
            About
          </h2>
          <p className="mt-2 text-2xl font-bold sm:text-3xl">포럼소개</p>
          <p className="mt-4 break-keep leading-relaxed text-neutral-600">
            전남광주미래포럼은 전남과 광주가 하나의 생활·경제권으로서 함께
            성장할 수 있도록, 지역 상생 협력과 미래 신산업 육성, 청년
            일자리 창출을 위해 활동하는 민간 주도의 협력 포럼입니다.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {VALUES.map((v) => (
            <div
              key={v.title}
              className="rounded-2xl border border-neutral-200 p-6 shadow-sm"
            >
              <h3 className="text-lg font-bold text-blue-900">{v.title}</h3>
              <p className="mt-3 break-keep text-sm leading-relaxed text-neutral-600">
                {v.desc}
              </p>
            </div>
          ))}
        </div>

        <blockquote className="mt-14 rounded-2xl bg-neutral-50 p-8 sm:p-10">
          <p className="break-keep text-lg leading-relaxed text-neutral-800 sm:text-xl">
            &ldquo;전남과 광주는 서로 다른 두 지역이 아니라, 함께 미래를
            준비해야 할 하나의 공동체입니다. 전남광주미래포럼은 그 연결의
            중심에서 지역의 내일을 함께 그려가겠습니다.&rdquo;
          </p>
          <footer className="mt-4 text-sm font-semibold text-neutral-500">
            전남광주미래포럼 상임의장
          </footer>
        </blockquote>
      </section>

      {/* History */}
      <section id="history" className="bg-neutral-50 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-blue-800">
            History
          </h2>
          <p className="mt-2 text-2xl font-bold sm:text-3xl">연혁</p>

          <ol className="mt-10 space-y-6 border-l border-neutral-300 pl-6">
            {HISTORY.map((item) => (
              <li key={item.date} className="relative">
                <span className="absolute -left-[29px] top-1.5 h-2.5 w-2.5 rounded-full bg-blue-900" />
                <span className="text-sm font-bold text-blue-900">
                  {item.date}
                </span>
                <p className="mt-1 text-neutral-700">{item.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Organization */}
      <section id="organization" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-blue-800">
          Organization
        </h2>
        <p className="mt-2 text-2xl font-bold sm:text-3xl">조직도</p>

        <div className="mt-10 space-y-4">
          {ORG_CHART.map((row, i) => (
            <div key={row.level} className="flex flex-col items-center">
              <div className="w-full max-w-xl rounded-xl border border-blue-100 bg-blue-50 px-6 py-4 text-center">
                <p className="font-bold text-blue-900">{row.level}</p>
                <p className="mt-1 text-sm text-neutral-600">{row.desc}</p>
              </div>
              {i < ORG_CHART.length - 1 && (
                <div className="h-6 w-px bg-neutral-300" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* News */}
      <section id="news" className="bg-neutral-50 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-blue-800">
            News
          </h2>
          <p className="mt-2 text-2xl font-bold sm:text-3xl">활동소식</p>

          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {NEWS.map((n) => (
              <article
                key={n.title}
                className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-blue-900 px-3 py-1 text-xs font-semibold text-white">
                    {n.tag}
                  </span>
                  <span className="text-xs text-neutral-500">{n.date}</span>
                </div>
                <h3 className="mt-4 font-semibold leading-snug text-neutral-900">
                  {n.title}
                </h3>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Location / Contact */}
      <section id="location" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-blue-800">
          Contact
        </h2>
        <p className="mt-2 text-2xl font-bold sm:text-3xl">오시는길</p>

        <div className="mt-10 grid gap-8 sm:grid-cols-2">
          <div className="flex h-64 items-center justify-center rounded-2xl bg-neutral-100 text-sm text-neutral-400">
            지도가 표시될 영역입니다
          </div>
          <dl className="space-y-4 text-sm">
            <div>
              <dt className="font-semibold text-neutral-500">주소</dt>
              <dd className="mt-1 text-neutral-800">[사무국 주소를 입력해 주세요]</dd>
            </div>
            <div>
              <dt className="font-semibold text-neutral-500">전화</dt>
              <dd className="mt-1 text-neutral-800">[전화번호를 입력해 주세요]</dd>
            </div>
            <div>
              <dt className="font-semibold text-neutral-500">이메일</dt>
              <dd className="mt-1 text-neutral-800">[이메일 주소를 입력해 주세요]</dd>
            </div>
          </dl>
        </div>
      </section>

      <footer className="border-t border-neutral-200 bg-neutral-950 py-10 text-neutral-400">
        <div className="mx-auto max-w-6xl px-4 text-sm sm:px-6">
          <p className="font-semibold text-white">전남광주미래포럼</p>
          <p className="mt-2">
            [사무국 주소] · 전화 [전화번호] · 이메일 [이메일 주소]
          </p>
          <p className="mt-4 text-xs text-neutral-500">
            © {new Date().getFullYear()} 전남광주미래포럼. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
