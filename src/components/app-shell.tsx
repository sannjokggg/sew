"use client";

import { usePathname } from "next/navigation";
import Logo from "@/components/logo";
import ThemeToggle from "@/components/theme-toggle";
import Sidebar from "@/components/sidebar";
import BottomNav from "@/components/bottom-nav";
import Navbar from "@/components/navbar";
import MarketingNavbar from "@/components/marketing-navbar";

const MARKETING_PATHS = ["/", "/about", "/services", "/contact"];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMarketing = MARKETING_PATHS.includes(pathname);

  if (isMarketing) {
    return (
      <div className="flex flex-col min-h-screen w-full">
        <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md py-3 px-4">
          <MarketingNavbar />
        </div>
        <div className="flex-1 overflow-auto px-4">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-full py-4 px-4 gap-5">
      <div className="flex items-center gap-0">
        <Logo />
        <Navbar />
      </div>
      <div className="flex flex-1 gap-4 overflow-hidden">
        <div className="flex flex-col items-start gap-[34px]">
          <div className="mt-[5px]">
            <ThemeToggle />
          </div>
          <div className="mt-4">
            <Sidebar />
          </div>
          <div className="mt-auto">
            <BottomNav />
          </div>
        </div>
        <div className="flex flex-col flex-1 gap-4 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
