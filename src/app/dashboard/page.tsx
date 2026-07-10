"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Heart,
  Recycle,
  Handshake,
  Gift,
  Users,
  Calendar,
  X,
} from "lucide-react";
import IncomeChart from "@/components/income-chart";
import RecentActivities from "@/components/dashboard/recent-activities";
import AqiCard from "@/components/dashboard/aqi-card";
import DonateModal from "@/components/donate-modal";

export default function Dashboard() {
  const { data: session } = useSession();
  const name = session?.user?.name?.split(" ")[0] || "User";

  const [stats, setStats] = useState({
    itemsReused: 0,
    itemsChange: 0,
    donationsMade: 0,
    donationsChange: 0,
    peopleHelped: 0,
    peopleChange: 0,
    eventsJoined: 0,
    eventsChange: 0,
    totalContributions: 0,
    totalContributionsChange: 0,
    donationsSum: 0,
  });
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) return;
        setStats(data);
      })
      .catch(console.error);
  }, []);

  return (
    <div className="flex flex-col gap-6 p-2" style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}>
      <div>
        <h1 className="text-3xl lg:text-5xl font-normal text-text-primary">
          Good morning, {name}
        </h1>
      </div>

      <div className="flex gap-5">
        {/* Community Impact Card */}
        <div className="flex w-[450px] flex-col rounded-[24px] bg-surface p-6 shadow-sm">
          <span className="text-xl font-medium text-text-primary">Community Impact</span>

          <div className="mt-4">
            <p className="text-[40px] font-semibold text-text-primary">{stats.totalContributions.toLocaleString()}</p>
          </div>
          <div className="mt-1 flex items-center gap-1.5">
            <span className={`text-sm font-semibold ${stats.totalContributionsChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {stats.totalContributionsChange >= 0 ? '↑' : '↓'} {Math.abs(stats.totalContributionsChange)}%
            </span>
            <span className="text-sm text-text-muted">than last month</span>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={() => setShowDonateModal(true)}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-accent px-4 py-3.5 text-lg font-semibold text-text-primary"
            >
              ♥ Donate
            </button>
            <button
              onClick={() => setShowRequestModal(true)}
              className="flex flex-1 items-center justify-center gap-2 rounded-full border border-border-default px-4 py-3.5 text-lg font-medium text-text-secondary"
            >
              ⇄ Request
            </button>
          </div>

          <div className="mt-6 rounded-2xl bg-surface-alt p-4">
            <div className="flex items-center gap-2">
              <span className="text-xl font-medium text-text-primary">Impact</span>
              <span className="text-sm text-text-muted">| Community Stats</span>
            </div>
            <div className="mt-4 flex gap-3">
              {[
                { icon: Heart, label: "Total Donations", value: "Rs 4,520" },
                { icon: Recycle, label: "Items Shared", value: stats.itemsReused },
                { icon: Handshake, label: "People Helped", value: stats.peopleHelped },
              ].map((item) => (
                <div key={item.label} className="flex-1 rounded-2xl border border-border-light bg-surface p-4">
                  <div className="flex items-center gap-1.5">
                    <item.icon size={16} strokeWidth={1.5} className="text-text-primary" />
                    <span className="text-xs text-text-muted">{item.label}</span>
                  </div>
                  <p className="mt-2 text-base font-semibold text-text-primary">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Middle Section - Impact Stats */}
        <div className="flex flex-1 flex-col h-full">
          <div className="rounded-[24px] bg-surface p-6 shadow-sm h-full flex flex-col">
            <div className="flex flex-col gap-4 flex-1">
              {/* Top Row */}
              <div className="flex gap-4 flex-1">
                {/* Items Reused */}
                <div className="flex-1 rounded-[16px] bg-gradient-to-br from-[#B8F25E] to-[#4CAF50] p-6 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-medium text-text-primary">Items Reused</span>
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/40">
                      <Recycle size={18} strokeWidth={1.5} className="text-text-primary" />
                    </span>
                  </div>
                  <p className="mt-4 text-[36px] font-semibold text-text-primary">{stats.itemsReused}</p>
                  <div className="mt-1 flex items-center gap-1">
                    <span className="text-sm font-semibold text-text-primary">↑ {stats.itemsChange}%</span>
                    <span className="text-sm text-text-primary/60">This month</span>
                  </div>
                </div>

                {/* Donations Made */}
                <div className="flex-1 rounded-[16px] bg-surface-alt p-6 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-medium text-text-muted">Donations Made</span>
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200">
                      <Gift size={18} strokeWidth={1.5} className="text-text-secondary" />
                    </span>
                  </div>
                  <p className="mt-4 text-[36px] font-semibold text-text-primary">{stats.donationsMade}</p>
                  <div className="mt-1 flex items-center gap-1">
                    <span className={`text-sm font-semibold ${stats.donationsChange >= 0 ? "text-green-500" : "text-red-400"}`}>
                      {stats.donationsChange >= 0 ? "↑" : "↓"} {Math.abs(stats.donationsChange)}%
                    </span>
                    <span className="text-sm text-text-muted">This month</span>
                  </div>
                </div>
              </div>

              {/* Bottom Row */}
              <div className="flex gap-4 flex-1">
                {/* People Helped */}
                <div className="flex-1 rounded-[16px] bg-surface-alt p-6 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-medium text-text-muted">People Helped</span>
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200">
                      <Users size={18} strokeWidth={1.5} className="text-text-secondary" />
                    </span>
                  </div>
                  <p className="mt-4 text-[36px] font-semibold text-text-primary">{stats.peopleHelped}</p>
                  <div className="mt-1 flex items-center gap-1">
                    <span className={`text-sm font-semibold ${stats.peopleChange >= 0 ? "text-green-500" : "text-red-400"}`}>
                      {stats.peopleChange >= 0 ? "↑" : "↓"} {Math.abs(stats.peopleChange)}%
                    </span>
                    <span className="text-sm text-text-muted">This month</span>
                  </div>
                </div>

                {/* Events Joined */}
                <div className="flex-1 rounded-[16px] bg-surface-alt p-6 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-medium text-text-muted">Events Joined</span>
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200">
                      <Calendar size={18} strokeWidth={1.5} className="text-text-secondary" />
                    </span>
                  </div>
                  <p className="mt-4 text-[36px] font-semibold text-text-primary">{stats.eventsJoined}</p>
                  <div className="mt-1 flex items-center gap-1">
                    <span className={`text-sm font-semibold ${stats.eventsChange >= 0 ? "text-green-500" : "text-red-400"}`}>
                      {stats.eventsChange >= 0 ? "↑" : "↓"} {Math.abs(stats.eventsChange)}%
                    </span>
                    <span className="text-sm text-text-muted">This month</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Total Income Chart */}
        <div className="w-[520px] h-full">
          <IncomeChart />
        </div>
      </div>

      {/* Row 2 - AQI Card + Recent Activities */}
      <div className="flex gap-5">
        <div className="w-[450px]">
          <AqiCard />
        </div>
        <div className="flex-1 h-full">
          <RecentActivities />
        </div>
      </div>

      {showDonateModal && (
        <DonateModal onClose={() => setShowDonateModal(false)} />
      )}

      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowRequestModal(false)}>
          <div className="relative w-full max-w-lg rounded-[24px] bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowRequestModal(false)}
              className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 transition-colors hover:bg-gray-200"
            >
              <X size={18} />
            </button>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">About SewaGo</h2>
            <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
              <p>
                <strong>SewaGo</strong> is a community-driven platform dedicated to fostering sustainability, 
                collaboration, and social impact. We believe in the power of communities to create meaningful change.
              </p>
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">What We Do</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-0.5">♻</span>
                    <span><strong>Marketplace:</strong> Exchange, sell, or give away items to reduce waste and promote reuse.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-0.5">📅</span>
                    <span><strong>Community Events:</strong> Organize and participate in local events that bring people together.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-0.5">🌱</span>
                    <span><strong>Sustainability:</strong> Track your environmental impact through our CO₂ savings dashboard.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-0.5">🤝</span>
                    <span><strong>Donations:</strong> Support our mission through financial contributions that go directly to community projects.</span>
                  </li>
                </ul>
              </div>
              <p>
                Your donations help us maintain the platform, organize community events, 
                and support sustainability initiatives that make a real difference.
              </p>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowRequestModal(false)}
                className="flex-1 rounded-full border border-gray-200 bg-white px-6 py-3 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => { setShowRequestModal(false); setShowDonateModal(true); }}
                className="flex-1 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-gray-900 transition-colors"
              >
                ♥ Donate Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
