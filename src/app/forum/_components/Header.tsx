"use client";

import { useState } from "react";

const NAV_ITEMS = [
  { href: "#about", label: "포럼소개" },
  { href: "#history", label: "연혁" },
  { href: "#organization", label: "조직도" },
  { href: "#news", label: "활동소식" },
  { href: "#location", label: "오시는길" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <a href="#top" className="flex flex-col leading-tight">
          <span className="text-lg font-bold tracking-tight text-blue-900 sm:text-xl">
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
              className="text-sm font-medium text-neutral-700 transition-colors hover:text-blue-800"
            >
              {item.label}
            </a>
          ))}
          <a
            href="#location"
            className="rounded-full bg-blue-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-800"
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
            <span className="block h-0.5 w-5 bg-neutral-800" />
            <span className="block h-0.5 w-5 bg-neutral-800" />
            <span className="block h-0.5 w-5 bg-neutral-800" />
          </div>
        </button>
      </div>

      {open && (
        <nav className="border-t border-neutral-200 bg-white px-4 pb-4 md:hidden">
          <ul className="flex flex-col gap-1 pt-2">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-md px-2 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
