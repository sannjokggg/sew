"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight } from "lucide-react";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Marketplace", href: "/marketplace" },
  { label: "Events", href: "/events" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function MarketingNavbar() {
  const pathname = usePathname();

  return (
    <div className="flex items-center justify-between w-full rounded-[28px] px-6 py-2" style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}>
      <Link href="/" className="flex items-center gap-2">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-500">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 3h6v6" />
            <path d="M10 14L21 3" />
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
          </svg>
        </div>
        <span className="text-[22px] font-semibold text-gray-800">Sewago</span>
      </Link>

      <div className="flex items-center gap-1">
        {navLinks.map(({ label, href }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`px-[28px] py-2 rounded-[36px] text-[18px] font-medium transition-all duration-200 ${
                active
                  ? "bg-[#1D1B17] text-white shadow-md"
                  : "text-[#666666] hover:bg-gray-100 hover:text-[#1D1B17]"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/login"
          className="rounded-full border border-gray-200 px-5 py-3 text-base font-medium text-[#6B6B6B] transition-colors hover:bg-gray-50"
        >
          Sign In
        </Link>
        <Link
          href="/register"
          className="flex items-center gap-2 rounded-full bg-[#B8F25E] px-5 py-3 text-base font-semibold text-[#202124] transition-colors hover:bg-[#a8e04e]"
        >
          Join Now
          <ArrowUpRight size={18} />
        </Link>
      </div>
    </div>
  );
}
