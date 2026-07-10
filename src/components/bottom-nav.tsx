"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  CalendarDays,
  MessageSquare,
  Globe,
} from "lucide-react";

const navItems = [
  { icon: LayoutGrid, href: "/dashboard", label: "Home" },
  { icon: Globe, href: "/dashboard/marketplace", label: "Market" },
  { icon: MessageSquare, href: "/dashboard/messages", label: "Chat" },
  { icon: CalendarDays, href: "/dashboard/events", label: "Events" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border-light bg-surface/95 backdrop-blur-md lg:hidden">
      <div className="flex items-center justify-around py-2 px-2">
        {navItems.map(({ icon: Icon, href, label }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 rounded-lg px-3 py-1 ${
                active ? "text-text-primary" : "text-text-muted"
              }`}
            >
              <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                active ? "bg-accent" : ""
              }`}>
                <Icon size={18} strokeWidth={active ? 2.5 : 1.5} />
              </div>
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
