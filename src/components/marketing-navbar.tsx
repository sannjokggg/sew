"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowUpRight } from "lucide-react";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Marketplace", href: "/dashboard/marketplace" },
  { label: "Events", href: "/dashboard/events" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/#contact" },
];

export default function MarketingNavbar() {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) => {
    if (href === "/#contact") return pathname === "/contact";
    return pathname === href;
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href === "/#contact") {
      if (pathname === "/") {
        e.preventDefault();
        const el = document.getElementById("contact");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <div className="flex items-center justify-between w-full rounded-[28px] px-6 py-2" style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}>
      <Link href="/" className="flex items-center gap-2">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
          <img src="/logo.png" alt="SewaGo" className="h-10 w-10 object-contain" />
        </div>
        <span className="text-[22px] font-semibold text-text-primary">SewaGo</span>
      </Link>

      <div className="hidden lg:flex items-center gap-1">
        {navLinks.map(({ label, href }) => {
          const active = isActive(href);
          const isProtected = href.startsWith("/dashboard");
          return (
            <a
              key={href}
              href={href}
              onClick={(e) => {
                handleNavClick(e, href);
                if (isProtected) {
                  e.preventDefault();
                  window.dispatchEvent(new CustomEvent("open-auth-popup", { detail: { redirectTo: href } }));
                }
              }}
              className={`px-[28px] py-2 rounded-[36px] text-[18px] font-medium transition-all duration-200 ${
                active
                  ? "bg-nav-active text-white shadow-md"
                  : "text-text-muted hover:bg-border-light hover:text-text-primary"
              }`}
            >
              {label}
            </a>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => window.dispatchEvent(new CustomEvent("open-auth-popup", { detail: { redirectTo: "/dashboard" } }))}
          className="rounded-full border border-border-default px-5 py-3 text-base font-medium text-text-secondary transition-colors hover:bg-border-light"
        >
          Sign In
        </button>
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-base font-semibold text-text-primary transition-colors hover:bg-accent-hover"
        >
          Try Now
          <ArrowUpRight size={18} />
        </button>
      </div>
    </div>
  );
}
