import Header from "./_components/Header";
import BackToTop from "./_components/BackToTop";
import Reveal from "./_components/Reveal";

const HERO_STATS = [
  { value: "26개", label: "전문 분과위원회" },
  { value: "5개", label: "핵심 클러스터" },
  { value: "2026.08", label: "실행계획 확정" },
];

const STRATEGIES = [
  {
    title: "민생 밀착형 현장 중심 행정 구현",
    desc: "복지 사각지대를 적극 발굴하고, 실질적인 지역 경제 활성화 대책을 마련합니다.",
  },
  {
    title: "지역 특화 K-브랜드 및 해양 신산업 육성",
    desc: "지역 농특산물의 브랜드 가치를 높이고, 어촌 경제 생태계를 혁신적으로 개편합니다.",
  },
  {
    title: "미래 디지털 기술 및 기후 에너지 선점",
    desc: "AI·데이터, 과학기술 연구를 활용한 스마트 첨단산업을 선도합니다.",
  },
];

const LEADERSHIP = [
  { role: "총괄담당", name: "최영환", desc: "26개 분과 총괄 및 조정·운영 책임" },
  { role: "감사", name: "김동희", desc: "투명한 예산 및 사업 모니터링" },
  { role: "상임고문", name: "추대 예정", desc: "전략적 자문 및 비전 제시" },
  {
    role: "위원",
    name: "추가 예정",
    desc: "근동·칠량·마량 중 1인 추가 예정",
  },
];

const CLUSTER_ACCENTS = [
  { badge: "bg-blue-900", ring: "border-blue-100", chip: "bg-blue-50 text-blue-800" },
  { badge: "bg-sky-700", ring: "border-sky-100", chip: "bg-sky-50 text-sky-800" },
  { badge: "bg-amber-600", ring: "border-amber-100", chip: "bg-amber-50 text-amber-800" },
  { badge: "bg-rose-700", ring: "border-rose-100", chip: "bg-rose-50 text-rose-800" },
  { badge: "bg-emerald-700", ring: "border-emerald-100", chip: "bg-emerald-50 text-emerald-800" },
];

const CLUSTERS = [
  {
    no: 1,
    name: "기획·행정 거버넌스",
    tagline: "정책 기틀 확립 및 행정통합 거버넌스",
    lead: "박종윤",
    committees: [
      "1. 기획전략",
      "2. 행정자치",
      "3. 통합추진",
      "20. 민주인권",
      "21. 홍보소통",
      "22. 재정기획",
    ],
  },
  {
    no: 2,
    name: "미래 디지털 및 기후 에너지",
    tagline: "4차 산업 선도와 미래 기후 에너지 융합",
    lead: "김일남 · 박상균 · 이병국",
    committees: ["17. 과학기술", "18. AI·데이터", "19. 에너지미래"],
  },
  {
    no: 3,
    name: "민생 경제 및 K-산업 육성",
    tagline: "골목 상권 회복과 농수산업의 글로벌 자생력 강화",
    lead: "김범진 · 황강연 · 황재연",
    committees: [
      "4. 경제산업",
      "5. 농업",
      "6. 임업",
      "16. 해양수산",
      "23. K-푸드(신설)",
      "24. 소상공인(신설)",
      "26. 축산",
    ],
  },
  {
    no: 4,
    name: "포용 복지와 정주 여건",
    tagline: "촘촘한 복지망 구축 및 생애주기 정착 지원",
    lead: "최강욱 · 최영숙 · 최신영",
    committees: [
      "7. 복지여성",
      "8. 교육청년",
      "9. 인구정책",
      "15. 교통안전",
      "25. 장애인복지(신설)",
    ],
  },
  {
    no: 5,
    name: "남도 문화와 생태 도시",
    tagline: "역사문화 글로벌 브랜드화 및 청정 도시재생",
    lead: "이수희 · 이정복 · 송형석(예정)",
    committees: [
      "10. 문화예술",
      "11. 관광마케팅",
      "12. 체육건강",
      "13. 환경생태",
      "14. 건설도시",
    ],
  },
];

const ROADMAP = [
  {
    step: "Step 1",
    title: "기획 (Planning)",
    items: [
      "주민 중심 의제 발굴 및 분과 간 우선순위 조율",
      "연간 사업계획 수립 및 분과 간 융합 의제 발굴",
    ],
  },
  {
    step: "Step 2",
    title: "심화 (Research)",
    items: [
      "구체적 분과 연구보고서 및 입법 제안서 작성",
      "대외 유관기관 MOU 체결 및 중앙정부 건의안 청원",
    ],
  },
  {
    step: "Step 3",
    title: "유치 (Funding)",
    items: [
      "분과별 맞춤형 사업 제안 기획 및 공모사업 발굴",
      "정책 건의문 상정 및 국·도비 예산 확보",
    ],
  },
];

const KEY_PROJECTS = [
  { tag: "통합추진", title: "강진 KTX 및 국립대 캠퍼스 유치" },
  { tag: "AI·데이터", title: "강진 AI 데이터센터 조성 지원 및 MOU" },
  { tag: "에너지미래", title: "월남저수지 수상태양광 및 에너지 자립마을 구축" },
  { tag: "문화예술", title: "고려청자 유네스코 유산 등재 지원" },
  { tag: "환경생태", title: "강진만 블루카본 갯벌 연구 및 해양생태 국가정원 추진" },
  { tag: "건설도시", title: "강진읍 도심재생 및 빈집·폐가 리모델링" },
];

const MAP_QUERY = encodeURIComponent("전라남도 강진군 강진읍 탐진로 111");

export default function ForumHomePage() {
  return (
    <div id="top" className="min-h-screen bg-white text-neutral-900">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-sky-800 text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32">
          <p className="text-sm font-semibold tracking-widest text-sky-300 uppercase">
            Jeonnam · Gwangju Future Forum
          </p>
          <h1 className="mt-4 max-w-3xl break-keep font-[family-name:var(--font-noto-serif-kr)] text-3xl font-bold leading-tight sm:text-5xl">
            전남과 광주, 하나의 미래를 그립니다
          </h1>
          <p className="mt-6 max-w-xl break-keep text-base leading-relaxed text-blue-100 sm:text-lg">
            전남광주미래포럼은 지속 가능한 광주·전남의 도약과 자치분권의
            완성을 위해, 26개 전문 분과위원회로 활동하는 민간 협력
            포럼입니다.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <a
              href="#about"
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-blue-900 shadow-lg transition-all hover:-translate-y-0.5 hover:bg-blue-50 hover:shadow-xl"
            >
              포럼 소개 보기
            </a>
            <a
              href="#location"
              className="rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-white/10"
            >
              문의하기
            </a>
          </div>

          <div className="mt-16 flex flex-wrap gap-x-10 gap-y-6 border-t border-white/15 pt-8">
            {HERO_STATS.map((s) => (
              <div key={s.label}>
                <p className="font-[family-name:var(--font-noto-serif-kr)] text-3xl font-bold text-white">
                  {s.value}
                </p>
                <p className="mt-1 text-xs font-medium tracking-wide text-blue-200 uppercase">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6">
        <Reveal className="mb-12 max-w-2xl">
          <div className="mb-2 h-1 w-10 rounded-full bg-amber-500" />
          <h2 className="text-sm font-semibold tracking-widest text-blue-800 uppercase">
            About
          </h2>
          <p className="mt-2 font-[family-name:var(--font-noto-serif-kr)] text-2xl font-bold sm:text-3xl">
            포럼소개
          </p>
          <p className="mt-4 break-keep leading-relaxed text-neutral-600">
            전남광주미래포럼은 지역 소멸 방지, 민생 활력 제고, 미래 기술
            유치를 위해 유기적 거버넌스를 전면 재편하고, 광주·전남의 지속
            가능한 도약과 자치분권의 완성을 추진하는 민간 협력 포럼입니다.
          </p>
        </Reveal>

        <div className="grid gap-6 sm:grid-cols-3">
          {STRATEGIES.map((v, i) => (
            <Reveal key={v.title}>
              <div className="h-full rounded-2xl border border-neutral-200 p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
                <span className="text-xs font-bold text-blue-800">
                  전략 {i + 1}
                </span>
                <h3 className="mt-2 font-[family-name:var(--font-noto-serif-kr)] text-lg font-bold text-blue-900">
                  {v.title}
                </h3>
                <p className="mt-3 break-keep text-sm leading-relaxed text-neutral-600">
                  {v.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <blockquote className="mt-14 rounded-2xl bg-neutral-50 p-8 sm:p-10">
            <p className="break-keep font-[family-name:var(--font-noto-serif-kr)] text-lg leading-relaxed text-neutral-800 sm:text-xl">
              &ldquo;현장에 밀착한 26개 분과의 전문성, 투명하고 강력한
              리더십, 그리고 결과를 만들어내는 3단계 실행 엔진으로
              전남광주미래포럼이 지속 가능한 지역 균형 발전과 자치분권의 새로운
              표준을 만듭니다.&rdquo;
            </p>
            <footer className="mt-4 text-sm font-semibold text-neutral-500">
              전남광주미래포럼 총괄담당 최영환
            </footer>
          </blockquote>
        </Reveal>
      </section>

      {/* Roadmap */}
      <section id="roadmap" className="scroll-mt-20 bg-neutral-50 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <div className="mb-2 h-1 w-10 rounded-full bg-amber-500" />
            <h2 className="text-sm font-semibold tracking-widest text-blue-800 uppercase">
              Roadmap
            </h2>
            <p className="mt-2 font-[family-name:var(--font-noto-serif-kr)] text-2xl font-bold sm:text-3xl">
              추진전략
            </p>
            <p className="mt-4 text-sm font-semibold text-blue-900">
              2026.08.30 — 26개 분과위원회 구성 및 실행계획 확정
            </p>
          </Reveal>

          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {ROADMAP.map((r) => (
              <Reveal key={r.step}>
                <div className="h-full rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
                  <span className="text-xs font-bold tracking-widest text-sky-700 uppercase">
                    {r.step}
                  </span>
                  <h3 className="mt-1 font-[family-name:var(--font-noto-serif-kr)] text-lg font-bold text-blue-900">
                    {r.title}
                  </h3>
                  <ul className="mt-3 space-y-2 text-sm leading-relaxed text-neutral-600">
                    {r.items.map((item) => (
                      <li key={item} className="break-keep">
                        · {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal>
            <p className="mt-10 break-keep rounded-2xl bg-blue-900 p-6 text-sm font-semibold text-white sm:text-base">
              최종 목표 — 확보된 예산을 통해 전남·광주의 실질적인 균형 발전과
              주민 삶의 질 향상으로 직접 환원합니다.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Organization */}
      <section
        id="organization"
        className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6"
      >
        <Reveal>
          <div className="mb-2 h-1 w-10 rounded-full bg-amber-500" />
          <h2 className="text-sm font-semibold tracking-widest text-blue-800 uppercase">
            Organization
          </h2>
          <p className="mt-2 font-[family-name:var(--font-noto-serif-kr)] text-2xl font-bold sm:text-3xl">
            조직도
          </p>
        </Reveal>

        <Reveal className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <>
            {LEADERSHIP.map((l) => (
              <div
                key={l.role}
                className="rounded-xl border border-blue-100 bg-blue-50 px-5 py-4 transition-all hover:-translate-y-1 hover:shadow-sm"
              >
                <p className="text-xs font-bold text-blue-800">[{l.role}]</p>
                <p className="mt-1 font-[family-name:var(--font-noto-serif-kr)] font-bold text-blue-900">
                  {l.name}
                </p>
                <p className="mt-1 break-keep text-xs text-neutral-600">
                  {l.desc}
                </p>
              </div>
            ))}
          </>
        </Reveal>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {CLUSTERS.map((c) => {
            const accent = CLUSTER_ACCENTS[(c.no - 1) % CLUSTER_ACCENTS.length];
            return (
              <Reveal key={c.no}>
                <div
                  className={`h-full rounded-2xl border ${accent.ring} p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md`}
                >
                  <span
                    className={`inline-block rounded-full ${accent.badge} px-3 py-1 text-xs font-bold text-white`}
                  >
                    클러스터 {c.no}
                  </span>
                  <h3 className="mt-3 font-[family-name:var(--font-noto-serif-kr)] text-lg font-bold text-blue-900">
                    {c.name}
                  </h3>
                  <p className="mt-1 break-keep text-xs text-neutral-500">
                    {c.tagline}
                  </p>
                  <p className="mt-2 text-xs font-semibold text-neutral-600">
                    담당: {c.lead}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {c.committees.map((committee) => (
                      <span
                        key={committee}
                        className={`rounded-full px-3 py-1 text-xs ${accent.chip}`}
                      >
                        {committee}
                      </span>
                    ))}
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* Key Projects */}
      <section id="projects" className="scroll-mt-20 bg-neutral-50 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <div className="mb-2 h-1 w-10 rounded-full bg-amber-500" />
            <h2 className="text-sm font-semibold tracking-widest text-blue-800 uppercase">
              Key Projects
            </h2>
            <p className="mt-2 font-[family-name:var(--font-noto-serif-kr)] text-2xl font-bold sm:text-3xl">
              추진과제
            </p>
          </Reveal>

          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {KEY_PROJECTS.map((p) => (
              <Reveal key={p.title}>
                <article className="h-full rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
                  <span className="rounded-full bg-blue-900 px-3 py-1 text-xs font-semibold text-white">
                    {p.tag}
                  </span>
                  <h3 className="mt-4 break-keep font-semibold leading-snug text-neutral-900">
                    {p.title}
                  </h3>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Location / Contact */}
      <section
        id="location"
        className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6"
      >
        <Reveal>
          <div className="mb-2 h-1 w-10 rounded-full bg-amber-500" />
          <h2 className="text-sm font-semibold tracking-widest text-blue-800 uppercase">
            Contact
          </h2>
          <p className="mt-2 font-[family-name:var(--font-noto-serif-kr)] text-2xl font-bold sm:text-3xl">
            오시는길
          </p>
        </Reveal>

        <Reveal className="mt-10 grid gap-8 sm:grid-cols-2">
          <>
            <iframe
              title="전남광주미래포럼 위치"
              src={`https://maps.google.com/maps?q=${MAP_QUERY}&output=embed`}
              className="h-64 w-full rounded-2xl border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="font-semibold text-neutral-500">주소</dt>
                <dd className="mt-1 text-neutral-800">
                  [우 59228] 전남광주통합특별시 강진군 강진읍 탐진로 111
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-neutral-500">대표전화</dt>
                <dd className="mt-1 text-neutral-800">
                  <a href="tel:061-430-3114" className="hover:text-blue-800 hover:underline">
                    061-430-3114
                  </a>{" "}
                  ·{" "}
                  <a href="tel:061-433-4114" className="hover:text-blue-800 hover:underline">
                    061-433-4114
                  </a>
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-neutral-500">대표팩스</dt>
                <dd className="mt-1 text-neutral-800">061-430-3599</dd>
              </div>
              <div>
                <dt className="font-semibold text-neutral-500">이메일</dt>
                <dd className="mt-1 text-neutral-800">
                  <a
                    href="mailto:2002036@naver.com"
                    className="hover:text-blue-800 hover:underline"
                  >
                    2002036@naver.com
                  </a>
                </dd>
              </div>
            </dl>
          </>
        </Reveal>
      </section>

      <footer className="border-t border-neutral-200 bg-neutral-950 py-10 text-neutral-400">
        <div className="mx-auto max-w-6xl px-4 text-sm sm:px-6">
          <p className="font-[family-name:var(--font-noto-serif-kr)] font-semibold text-white">
            전남광주미래포럼
          </p>
          <p className="mt-2 break-keep">
            [우 59228] 전남광주통합특별시 강진군 강진읍 탐진로 111 · 대표전화
            061-430-3114 · 061-433-4114 · 팩스 061-430-3599 · 이메일
            2002036@naver.com
          </p>
          <p className="mt-4 text-xs text-neutral-500">
            © {new Date().getFullYear()} 전남광주미래포럼. All rights reserved.
          </p>
        </div>
      </footer>

      <BackToTop />
    </div>
  );
}
