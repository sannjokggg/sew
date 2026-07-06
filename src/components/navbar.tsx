"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Search, Bell, Info, ChevronDown } from "lucide-react";

const navLinks = [
  { label: "Overview", href: "/dashboard" },
  { label: "Activity", href: "/dashboard/activity" },
  { label: "Manage", href: "/dashboard/manage" },
  { label: "Program", href: "/dashboard/program" },
  { label: "Account", href: "/dashboard/account" },
  { label: "Reports", href: "/dashboard/reports" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;
  const initial = user?.name?.charAt(0)?.toUpperCase() || "S";
  const displayName = user?.name || "User";
  const displayEmail = user?.email || "";

  return (
    <div className="relative flex flex-1 items-center" style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}>
      <div className="absolute left-[42%] -translate-x-1/2 flex items-center gap-[16px] bg-white px-4 py-2 rounded-[36px] shadow-sm">
        {navLinks.map(({ label, href }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`px-[28px] py-2 rounded-[36px] text-[18px] font-medium transition-colors ${
                active
                  ? "bg-[#1D1B17] text-white"
                  : "text-[#666666] hover:bg-gray-100 hover:text-[#222222]"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </div>

      <div className="absolute right-8 flex items-center gap-4">
        <div className="flex items-center gap-6 bg-white px-[21px] py-[13px] rounded-[36px] shadow-sm">
          <button className="flex items-center justify-center text-[#222222] transition-colors hover:text-[#1D1B17]">
            <Search size={28} strokeWidth={2} />
          </button>
          <button className="flex items-center justify-center text-[#222222] transition-colors hover:text-[#1D1B17]">
            <Bell size={28} strokeWidth={2} />
          </button>
          <button className="flex items-center justify-center text-[#222222] transition-colors hover:text-[#1D1B17]">
            <Info size={28} strokeWidth={2} />
          </button>
        </div>

        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-[36px] shadow-sm">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300">
            <span className="text-xs font-medium text-white">{initial}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[15px] font-semibold text-[#222222] leading-tight">
              {displayName}
            </span>
            <span className="text-[13px] font-normal text-[#9A9A9A] leading-tight">
              {displayEmail}
            </span>
          </div>
          <ChevronDown size={16} className="text-[#666666] ml-1" />
        </div>
      </div>
    </div>
  );
}
