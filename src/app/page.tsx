"use client";

import { ArrowUpRight, CheckCircle, Briefcase } from "lucide-react";

export default function Home() {
  return (
    <div className="flex-1" style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}>
      {/* Hero Section */}
      <div
        className="relative rounded-[28px] overflow-hidden"
      >

        <div className="relative flex items-stretch min-h-[520px]">
          {/* Left Side */}
          <div className="flex flex-col justify-center px-12 py-10 w-[45%]">
            <h1 className="text-[52px] font-bold leading-[1.05] text-[#1a1a1a]">
              Find Services That{" "}
              <span className="text-[#16a34a]">Shape Your Life</span>
            </h1>
            <p className="mt-5 text-base text-[#6B6B6B] leading-relaxed max-w-[400px]">
              Professional services at your doorstep. From home repair to personal care, connect with trusted experts who deliver quality — every time.
            </p>

            <div className="mt-7">
              <a
                href="/services"
                className="inline-flex items-center gap-2 rounded-full bg-[#16a34a] px-7 py-3.5 text-sm font-semibold text-white transition-all hover:bg-[#15803d] hover:shadow-lg hover:shadow-green-500/25 active:scale-95"
              >
                Explore Services
                <ArrowUpRight size={18} />
              </a>
            </div>

            {/* Bottom Info Card */}
            <div className="mt-10 flex items-start gap-4 rounded-[18px] bg-white/70 backdrop-blur-sm p-5 border border-green-100 max-w-[380px]">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#16a34a]/10">
                <CheckCircle size={20} className="text-[#16a34a]" />
              </div>
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#16a34a]/10 px-3 py-1 text-xs font-semibold text-[#16a34a]">
                  <Briefcase size={12} />
                  Built for real growth.
                </span>
                <p className="mt-2.5 text-sm text-[#6B6B6B] leading-relaxed">
                  Follow verified professionals from booking to completion — seamless and stress-free.
                </p>
              </div>
            </div>
          </div>

          {/* Right Side — Card Grid: 2 cols, left=3 rows, right=2 rows */}
          <div className="flex-1 flex items-center justify-center p-6 pl-0">
            <div className="w-full h-full grid grid-cols-[1fr_1fr] gap-3 max-w-[500px] max-h-[440px]">
              {/* LEFT COLUMN — 3 items stacked */}
              <div className="grid grid-rows-[1.6fr_1fr_0.9fr] gap-3">
                {/* 1. Woman photo */}
                <div className="rounded-[20px] overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=500&h=520&fit=crop"
                    alt="Professional"
                    className="h-full w-full object-cover"
                  />
                </div>

                {/* 2. Green testimonial card */}
                <div className="rounded-[20px] bg-[#16a34a] p-5 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {[
                        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop",
                        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop",
                        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop",
                      ].map((src, i) => (
                        <img
                          key={i}
                          src={src}
                          alt={`User ${i + 1}`}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ))}
                    </div>
                    <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white">
                      Best
                    </span>
                  </div>
                  <p className="mt-3 text-sm font-medium text-white leading-relaxed">
                    &quot;Professional services that helped me get things done right away.&quot;
                  </p>
                </div>

                {/* 3. Dark stats card */}
                <div className="rounded-[20px] bg-[#1a2e1a] p-5 flex flex-col justify-center">
                  <p className="text-[32px] font-bold text-white leading-none">500+</p>
                  <p className="mt-1.5 text-xs text-white/70 leading-snug">Verified service providers near you.</p>
                </div>
              </div>

              {/* RIGHT COLUMN — 2 items stacked */}
              <div className="grid grid-rows-[0.7fr_1.3fr] gap-3">
                {/* 4. Classroom card with text overlay */}
                <div className="relative rounded-[20px] overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=420&h=320&fit=crop"
                    alt="Services"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <span className="text-sm font-bold text-white">Trusted Experts</span>
                  </div>
                </div>

                {/* 5. Man photo */}
                <div className="rounded-[20px] overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=420&h=520&fit=crop"
                    alt="Customer"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trusted By Section */}
      <div className="mt-8 text-center">
        <p className="text-sm text-[#9A9A9A] mb-6">Trusted by learners from 50+ countries</p>
        <div className="relative overflow-hidden">
          <div className="flex animate-marquee whitespace-nowrap">
            {[...Array(2)].map((_, setIdx) => (
              <div key={setIdx} className="flex items-center gap-16 mr-16">
                <span className="text-2xl font-bold text-[#1a2e1a] tracking-tight flex items-center gap-2">
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="14" fill="#1a2e1a"/><path d="M8 14l4 4 8-8" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Sewago
                </span>
                <span className="text-2xl font-bold text-[#6B6B6B] tracking-tight flex items-center gap-2">
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="14" fill="#6B6B6B"/><path d="M9 14a5 5 0 0110 0" stroke="#fff" strokeWidth="2" strokeLinecap="round"/><circle cx="14" cy="14" r="2" fill="#fff"/></svg>
                  ServiceHub
                </span>
                <span className="text-2xl font-bold text-[#16a34a] tracking-tight flex items-center gap-2">
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><rect width="28" height="28" rx="6" fill="#16a34a"/><path d="M8 10h12M8 14h8M8 18h10" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
                  FixIt Pro
                </span>
                <span className="text-2xl font-bold text-[#1a2e1a] tracking-tight flex items-center gap-2">
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="14" fill="#1a2e1a"/><path d="M10 18V10l8 4-8 4z" fill="#fff"/></svg>
                  HomeCare
                </span>
                <span className="text-2xl font-bold text-[#6B6B6B] tracking-tight flex items-center gap-2">
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><rect width="28" height="28" rx="14" fill="#6B6B6B"/><path d="M9 14l3 3 7-7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  TrustWork
                </span>
                <span className="text-2xl font-bold text-[#16a34a] tracking-tight flex items-center gap-2">
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="14" fill="#16a34a"/><path d="M10 14a4 4 0 018 0" stroke="#fff" strokeWidth="2" strokeLinecap="round"/><path d="M12 17h4" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
                  UrbanEdge
                </span>
              </div>
            ))}
          </div>
          <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-gray-100 to-transparent pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-gray-100 to-transparent pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
