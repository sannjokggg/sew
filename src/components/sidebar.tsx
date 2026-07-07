"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  CalendarDays,
  MessageSquare,
  Globe,
  Users,
  Settings,
} from "lucide-react";

const navItems = [
  { icon: LayoutGrid, href: "/dashboard", label: "Dashboard" },
  { icon: CalendarDays, href: "/dashboard/events", label: "Events" },
  { icon: MessageSquare, href: "/dashboard/messages", label: "Messages" },
  { icon: Globe, href: "/dashboard/marketplace", label: "Marketplace" },
  { icon: Users, href: "/dashboard/users", label: "Users" },
  { icon: Settings, href: "/dashboard/settings", label: "Settings" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-[70px] flex-col items-center justify-center rounded-[36px] bg-white py-2 shadow-sm">
      <nav className="flex flex-col items-center gap-1">
        {navItems.map(({ icon: Icon, href, label }) => {
          const active = pathname === href;
          return (
            <div key={href} className="relative group">
              <Link
                href={href}
                className={`flex h-12 w-12 items-center justify-center rounded-full ${
                  active
                    ? "bg-[#1D1B17] text-white"
                    : "text-gray-400 hover:bg-[#1D1B17] hover:text-white"
                }`}
              >
                <Icon size={22} />
              </Link>
              <div className="absolute left-[calc(100%+8px)] top-1/2 -translate-y-1/2 z-50 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150">
                <div className="bg-[#1D1B17] text-white text-sm font-medium rounded-full px-4 py-2.5 whitespace-nowrap shadow-lg flex items-center gap-2">
                  <Icon size={16} />
                  {label}
                </div>
              </div>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
