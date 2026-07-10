"use client";

import Link from "next/link";

export default function Logo() {
  return (
    <Link
      href="/"
      className="flex w-fit items-center justify-center gap-1.5 rounded-[36px] bg-surface px-4 h-14"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
        <img src="/logo.png" alt="SewaGo" className="h-8 w-8 object-contain" />
      </div>
      <span className="text-[18px] font-semibold text-gray-800 whitespace-nowrap">
        SewaGo
      </span>
    </Link>
  );
}
