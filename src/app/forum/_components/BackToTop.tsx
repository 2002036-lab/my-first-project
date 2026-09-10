"use client";

import { useEffect, useState } from "react";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="맨 위로"
      className={`fixed right-6 bottom-6 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-blue-900 text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-blue-800 ${
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M10 3a.75.75 0 0 1 .53.22l5.5 5.5a.75.75 0 1 1-1.06 1.06L10.75 5.56v10.69a.75.75 0 0 1-1.5 0V5.56L5.03 9.78a.75.75 0 0 1-1.06-1.06l5.5-5.5A.75.75 0 0 1 10 3Z"
          clipRule="evenodd"
        />
      </svg>
    </button>
  );
}
