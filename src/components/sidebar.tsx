"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  CalendarDays,
  MessageSquare,
  Globe,
  Settings,
} from "lucide-react";

const navItems = [
  { icon: LayoutGrid, href: "/dashboard", label: "Dashboard" },
  { icon: CalendarDays, href: "/dashboard/events", label: "Events" },
  { icon: MessageSquare, href: "/dashboard/messages", label: "Messages" },
  { icon: Globe, href: "/dashboard/marketplace", label: "Marketplace" },
  { icon: Settings, href: "/dashboard/settings", label: "Settings" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-[70px] flex-col items-center justify-center rounded-[36px] bg-surface py-2 shadow-sm overflow-visible">
      <nav className="flex flex-col items-center gap-0.5">
        {navItems.map(({ icon: Icon, href, label }) => {
          const active = pathname === href;
          return (
            <div key={href} className="relative group/item">
              <Link
                href={href}
                className={`flex h-11 w-11 items-center justify-center rounded-full ${
                  active
                    ? "bg-nav-active text-white"
                    : "text-text-muted group-hover/item:bg-border-light group-hover/item:text-text-primary"
                }`}
              >
                <Icon size={20} />
              </Link>
              {!active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 z-50 opacity-0 pointer-events-none group-hover/item:opacity-100">
                  <div className="h-11 bg-surface border border-border-default text-text-primary text-sm font-medium rounded-full pl-2 pr-4 flex items-center gap-2.5 whitespace-nowrap shadow-lg">
                    <div className="h-7 w-7 bg-border-light rounded-full flex items-center justify-center flex-shrink-0">
                      <Icon size={16} />
                    </div>
                    {label}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
