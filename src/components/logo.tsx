"use client";

import Link from "next/link";

export default function Logo() {
  return (
    <Link
      href="/"
      className="flex w-fit items-center justify-center gap-1.5 rounded-full sm:rounded-[36px] bg-surface px-2.5 sm:px-4 h-8 sm:h-14"
    >
      <img src="/logo.png" alt="SewaGo" className="h-6 w-6 sm:h-12 sm:w-12 object-contain" />
      <span className="hidden sm:inline text-[18px] font-semibold text-gray-800 whitespace-nowrap">
        SewaGo
      </span>
    </Link>
  );
}
