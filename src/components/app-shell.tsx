"use client";

import { useRef, useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { LogOut, HelpCircle } from "lucide-react";
import Logo from "@/components/logo";
import ThemeToggle from "@/components/theme-toggle";
import Sidebar from "@/components/sidebar";
import Navbar from "@/components/navbar";
import MarketingNavbar from "@/components/marketing-navbar";
import CustomScrollbar from "@/components/custom-scrollbar";
import AuthPopup from "@/components/AuthPopup";

const MARKETING_PATHS = ["/", "/about", "/contact"];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMarketing = MARKETING_PATHS.includes(pathname);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { status } = useSession();
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const [authRedirectTo, setAuthRedirectTo] = useState<string | undefined>(undefined);
  const [hasTriggered, setHasTriggered] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated" && !hasTriggered && !sessionStorage.getItem("auth_popup_dismissed")) {
      window.dispatchEvent(new CustomEvent("open-auth-popup"));
      setHasTriggered(true);
    }
  }, [status, hasTriggered]);

  useEffect(() => {
    const handleOpenAuth = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setAuthRedirectTo(detail?.redirectTo);
      setShowAuthPopup(true);
    };
    window.addEventListener("open-auth-popup", handleOpenAuth);
    return () => window.removeEventListener("open-auth-popup", handleOpenAuth);
  }, []);

  const closeAuthPopup = () => {
    sessionStorage.setItem("auth_popup_dismissed", "true");
    setShowAuthPopup(false);
  };

  if (isMarketing) {
    return (
      <>
        <AuthPopup isOpen={showAuthPopup} onClose={closeAuthPopup} redirectTo={authRedirectTo} />
        <CustomScrollbar scrollContainerRef={scrollRef} />
        <div ref={scrollRef} className="h-screen w-full overflow-y-auto overflow-x-hidden hide-scrollbar">
          <div className="flex flex-col min-h-screen w-full">
            <div className="sticky top-0 z-50 bg-surface/80 backdrop-blur-md py-3 px-4">
              <MarketingNavbar />
            </div>
            <div className="flex-1 px-4">
              {children}
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <AuthPopup isOpen={showAuthPopup} onClose={closeAuthPopup} redirectTo={authRedirectTo} />
      <div className="fixed top-4 left-4 right-4 z-50 flex items-center gap-0">
        <Logo />
        <Navbar />
      </div>
      <div className="hidden lg:flex fixed left-4 top-24 bottom-4 z-40 flex-col items-center gap-[34px]">
        <div className="mt-[5px]">
          <ThemeToggle />
        </div>
        <div className="mt-4">
          <Sidebar />
        </div>
        <div className="mt-auto flex w-[70px] flex-col items-center justify-center gap-1 rounded-[36px] bg-surface py-2">
          <a
            href="/dashboard/help"
            className="flex h-12 w-12 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-border-light hover:text-text-primary"
            title="Help"
          >
            <HelpCircle size={22} />
          </a>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            title="Logout"
            className="flex h-12 w-12 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-border-light hover:text-text-primary"
          >
            <LogOut size={22} />
          </button>
        </div>
      </div>
      <div className="h-screen w-full overflow-hidden">
        <div className="flex flex-col h-full pt-[88px] pl-0 lg:pl-[100px] pr-4 pb-4 gap-5">
          <div ref={scrollRef} className="flex-1 overflow-y-auto hide-scrollbar">
            <div className="flex flex-col gap-4">
              {children}
            </div>
          </div>
        </div>
      </div>
      <CustomScrollbar scrollContainerRef={scrollRef} />
    </>
  );
}
