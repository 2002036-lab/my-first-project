"use client";

import { useEffect, useState } from "react";

const NAV_ITEMS = [
  { href: "#about", label: "포럼소개", id: "about" },
  { href: "#roadmap", label: "추진전략", id: "roadmap" },
  { href: "#organization", label: "조직도", id: "organization" },
  { href: "#projects", label: "추진과제", id: "projects" },
  { href: "#location", label: "오시는길", id: "location" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("about");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sections = NAV_ITEMS.map((item) =>
      document.getElementById(item.id),
    ).filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-all duration-300 ${
        scrolled
          ? "border-neutral-200 bg-white/95 shadow-sm backdrop-blur"
          : "border-transparent bg-white/80 backdrop-blur"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <a href="#top" className="flex flex-col leading-tight">
          <span className="font-[family-name:var(--font-noto-serif-kr)] text-lg font-bold tracking-tight text-blue-950 sm:text-xl">
            전남광주미래포럼
          </span>
          <span className="text-[11px] font-medium text-neutral-500 sm:text-xs">
            Jeonnam · Gwangju Future Forum
          </span>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`relative text-sm font-medium transition-colors after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:rounded-full after:bg-amber-500 after:transition-all ${
                active === item.id
                  ? "text-blue-900 after:w-full"
                  : "text-neutral-700 after:w-0 hover:text-blue-800 hover:after:w-full"
              }`}
            >
              {item.label}
            </a>
          ))}
          <a
            href="#location"
            className="rounded-full bg-blue-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-blue-800 hover:shadow-md"
          >
            문의하기
          </a>
        </nav>

        <button
          type="button"
          aria-label="메뉴 열기"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-md border border-neutral-300 md:hidden"
        >
          <span className="sr-only">메뉴</span>
          <div className="flex flex-col gap-1">
            <span
              className={`block h-0.5 w-5 bg-neutral-800 transition-transform ${open ? "translate-y-1.5 rotate-45" : ""}`}
            />
            <span
              className={`block h-0.5 w-5 bg-neutral-800 transition-opacity ${open ? "opacity-0" : ""}`}
            />
            <span
              className={`block h-0.5 w-5 bg-neutral-800 transition-transform ${open ? "-translate-y-1.5 -rotate-45" : ""}`}
            />
          </div>
        </button>
      </div>

      <nav
        className={`overflow-hidden border-t border-neutral-200 bg-white transition-[max-height,opacity] duration-300 md:hidden ${
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <ul className="flex flex-col gap-1 px-4 pt-2 pb-4">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                onClick={() => setOpen(false)}
                className={`block rounded-md px-2 py-2 text-sm font-medium ${
                  active === item.id
                    ? "bg-blue-50 text-blue-900"
                    : "text-neutral-700 hover:bg-neutral-100"
                }`}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
