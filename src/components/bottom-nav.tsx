"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { HelpCircle, LogOut } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="flex w-[70px] flex-col items-center gap-1 rounded-[36px] bg-white py-2 shadow-sm">
      <Link
        href="/dashboard/help"
        title="Help"
        className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors ${
          pathname === "/dashboard/help"
            ? "bg-gray-800 text-white"
            : "text-gray-400 hover:bg-gray-100 hover:text-gray-700"
        }`}
      >
        <HelpCircle size={22} />
      </Link>
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        title="Logout"
        className="flex h-12 w-12 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
      >
        <LogOut size={22} />
      </button>
    </nav>
  );
}
