"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function BottomNav() {
  return (
    <nav className="flex w-[70px] flex-col items-center gap-1 rounded-[36px] bg-white py-2 shadow-sm">
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
