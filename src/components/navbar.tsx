"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Search, Bell, Info, ChevronDown } from "lucide-react";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Contact", href: "/contact" },
  { label: "Profile", href: "/dashboard/profile" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;
  const initial = user?.name?.charAt(0)?.toUpperCase() || "S";
  const displayName = user?.name || "User";
  const displayEmail = user?.email || "";

  return (
    <div className="relative flex flex-1 items-center" style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}>
      <div
        className="absolute left-[42%] -translate-x-1/2 flex items-center gap-[6px] bg-white px-4 py-2 rounded-[36px]"
        style={{ boxShadow: "0 -4px 20px rgba(184, 242, 94, 0.35), 0 4px 12px rgba(0,0,0,0.06)" }}
      >
        {navLinks.map(({ label, href }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`px-[28px] py-2 rounded-[36px] text-[18px] font-medium transition-all duration-200 ${
                active
                  ? "bg-[#1D1B17] text-white shadow-md"
                  : "text-[#666666] hover:bg-gray-100 hover:text-[#1D1B17] active:bg-[#1D1B17] active:text-white"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </div>

      <div className="absolute right-8 flex items-center gap-4">
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-[36px] shadow-sm">
          <button
            onClick={() => router.push("/dashboard/messages")}
            className="flex h-10 w-10 items-center justify-center rounded-full text-[#222222] transition-all duration-200 hover:bg-gray-100 hover:text-[#1D1B17] active:bg-gray-800 active:text-white active:scale-95"
          >
            <Search size={20} strokeWidth={2} />
          </button>
          <button className="flex h-10 w-10 items-center justify-center rounded-full text-[#222222] transition-all duration-200 hover:bg-gray-100 hover:text-[#1D1B17] active:bg-gray-800 active:text-white active:scale-95">
            <Bell size={20} strokeWidth={2} />
          </button>
          <button className="flex h-10 w-10 items-center justify-center rounded-full text-[#222222] transition-all duration-200 hover:bg-gray-100 hover:text-[#1D1B17] active:bg-gray-800 active:text-white active:scale-95">
            <Info size={20} strokeWidth={2} />
          </button>
        </div>

        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-[36px] shadow-sm">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300">
            <span className="text-xs font-medium text-white">{initial}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[16px] font-semibold text-[#222222] leading-tight">
              {displayName}
            </span>
            <span className="text-[12px] font-normal text-[#9A9A9A] leading-tight">
              {displayEmail}
            </span>
          </div>
          <ChevronDown size={16} className="text-[#666666] ml-1" />
        </div>
      </div>
    </div>
  );
}
