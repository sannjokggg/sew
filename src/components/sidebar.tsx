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
            <Link
              key={href}
              href={href}
              title={label}
              className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors ${
                active
                  ? "bg-gray-800 text-white"
                  : "text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              }`}
            >
              <Icon size={22} />
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
