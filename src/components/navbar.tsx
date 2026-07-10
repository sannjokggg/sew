"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { Search, Bell, Info, ChevronDown, Loader2, CheckCheck } from "lucide-react";

interface Notification {
  id: number;
  type: string;
  message: string;
  link: string;
  is_read: boolean;
  created_at: string;
}

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Contact", href: "/contact" },
  { label: "Profile", href: "/dashboard/profile" },
];

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 2) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;
  const initial = user?.name?.charAt(0)?.toUpperCase() || "S";
  const displayName = user?.name || "User";
  const displayEmail = user?.email || "";

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [bellOpen, setBellOpen] = useState(false);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setBellOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!bellOpen || !session) return;
    setLoadingNotifs(true);
    fetch("/api/notifications")
      .then((res) => res.json())
      .then((data) => {
        if (data.notifications) setNotifications(data.notifications.slice(0, 10));
        if (data.unreadCount !== undefined) setUnreadCount(data.unreadCount);
      })
      .catch(console.error)
      .finally(() => setLoadingNotifs(false));
  }, [bellOpen, session]);

  useEffect(() => {
    if (!session) return;
    const interval = setInterval(() => {
      fetch("/api/notifications")
        .then((res) => res.json())
        .then((data) => {
          if (data.unreadCount !== undefined) setUnreadCount(data.unreadCount);
        })
        .catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, [session]);

  const markAsRead = async (id: number) => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: "all" }),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  return (
    <div className="relative flex flex-1 items-center" style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}>
      <div
        className="hidden lg:flex absolute left-[42%] -translate-x-1/2 items-center gap-[6px] bg-surface px-4 py-2 rounded-[36px]"
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
                  ? "bg-nav-active text-white shadow-md"
                  : "text-text-muted hover:bg-border-light hover:text-text-primary active:bg-nav-active active:text-white"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </div>

      <div className="absolute right-0 flex items-center gap-2 lg:gap-4">
        <div className="flex items-center gap-1 lg:gap-3 bg-surface px-2 lg:px-4 py-2 rounded-[36px] shadow-sm">
          <button
            onClick={() => router.push("/dashboard/messages")}
            className="flex h-9 w-9 lg:h-10 lg:w-10 items-center justify-center rounded-full text-text-secondary transition-all duration-200 hover:bg-border-light hover:text-text-primary active:bg-nav-active active:text-white active:scale-95"
          >
            <Search size={18} strokeWidth={2} />
          </button>
          <div className="relative" ref={bellRef}>
            <button
              onClick={() => setBellOpen(!bellOpen)}
              className="relative flex h-9 w-9 lg:h-10 lg:w-10 items-center justify-center rounded-full text-text-secondary transition-all duration-200 hover:bg-border-light hover:text-text-primary active:bg-nav-active active:text-white active:scale-95"
            >
              <Bell size={18} strokeWidth={2} />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
            {bellOpen && (
              <div className="absolute right-0 top-full mt-2 z-50 w-[360px] rounded-2xl bg-surface border border-border-default shadow-lg">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border-light">
                  <h3 className="text-sm font-semibold text-text-primary">Notifications</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="flex items-center gap-1 text-xs font-medium text-accent hover:text-accent-hover transition-colors"
                    >
                      <CheckCheck size={14} /> Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-[320px] overflow-y-auto">
                  {loadingNotifs ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 size={20} className="animate-spin text-text-muted" />
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="py-8 text-center">
                      <p className="text-sm text-text-muted">No notifications yet</p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <button
                        key={notif.id}
                        onClick={() => {
                          markAsRead(notif.id);
                          if (notif.link) router.push(notif.link);
                          setBellOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 transition-colors hover:bg-border-light ${
                          !notif.is_read ? "bg-accent/5" : ""
                        }`}
                      >
                        <p className={`text-sm ${!notif.is_read ? "font-semibold text-text-primary" : "text-text-secondary"}`}>
                          {notif.message}
                        </p>
                        <p className="mt-0.5 text-[11px] text-text-muted">{timeAgo(notif.created_at)}</p>
                      </button>
                    ))
                  )}
                </div>
                <Link
                  href="/dashboard/notifications"
                  onClick={() => setBellOpen(false)}
                  className="block rounded-b-2xl border-t border-border-light px-4 py-3 text-center text-sm font-medium text-accent hover:bg-border-light transition-colors"
                >
                  See all notifications
                </Link>
              </div>
            )}
          </div>
          <button className="hidden sm:flex h-9 w-9 lg:h-10 lg:w-10 items-center justify-center rounded-full text-text-secondary transition-all duration-200 hover:bg-border-light hover:text-text-primary active:bg-nav-active active:text-white active:scale-95">
            <Info size={18} strokeWidth={2} />
          </button>
        </div>

        <div className="flex items-center gap-2 lg:gap-3 bg-surface px-2 lg:px-4 py-2 rounded-[36px] shadow-sm">
          <div className="flex h-7 w-7 lg:h-8 lg:w-8 items-center justify-center rounded-full bg-gray-300">
            <span className="text-xs font-medium text-white">{initial}</span>
          </div>
          <div className="hidden lg:flex flex-col">
            <span className="text-[16px] font-semibold text-text-primary leading-tight">
              {displayName}
            </span>
            <span className="text-[12px] font-normal text-text-muted leading-tight">
              {displayEmail}
            </span>
          </div>
          <ChevronDown size={16} className="text-text-muted" />
        </div>
      </div>
    </div>
  );
}
