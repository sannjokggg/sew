"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  ChevronDown,
  Recycle,
  Gift,
  Users,
  Calendar,
} from "lucide-react";
import IncomeChart from "@/components/income-chart";

export default function Dashboard() {
  const { data: session } = useSession();
  const name = session?.user?.name?.split(" ")[0] || "User";
  const [currency, setCurrency] = useState<"USD" | "NPR">("NPR");
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);

  const [stats, setStats] = useState({
    itemsReused: 0,
    itemsChange: 0,
    donationsMade: 0,
    donationsChange: 0,
    peopleHelped: 0,
    peopleChange: 0,
    eventsJoined: 0,
    eventsChange: 0,
  });
  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) return;
        setStats(data);
      })
      .catch(console.error);
  }, []);

  const currencies = [
    { code: "USD", flag: "🇺🇸", symbol: "$", rate: 1 },
    { code: "NPR", flag: "🇳🇵", symbol: "रू", rate: 133.5 },
  ];

  const selectedCurrency = currencies.find((c) => c.code === currency);

  const convertAmount = (usdAmount: number) => {
    const converted = usdAmount * selectedCurrency!.rate;
    return `${selectedCurrency!.symbol}${converted.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="flex flex-col gap-6 p-2" style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}>
      <div>
        <h1 className="text-5xl font-normal text-[#202124]">
          Good morning, {name}
        </h1>
        <p className="text-lg text-[#6B6B6B]">
          Stay on top of your tasks, monitor progress, and track status.
        </p>
      </div>

      <div className="flex gap-5">
        {/* Total Balance Card */}
        <div className="flex w-[450px] flex-col rounded-[24px] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xl font-medium text-[#9A9A9A]">Total Balance</span>
            <div className="relative">
              <button
                onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
                className="flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-sm font-medium text-[#6B6B6B] hover:bg-gray-50 transition-colors"
              >
                <span className="text-base">{selectedCurrency?.flag}</span>
                <span>{currency}</span>
                <ChevronDown size={14} />
              </button>
              {showCurrencyDropdown && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowCurrencyDropdown(false)} />
                  <div className="absolute right-0 top-full z-50 mt-1 w-36 rounded-[12px] border border-gray-100 bg-white py-1 shadow-lg">
                    {currencies.map((c) => (
                      <button
                        key={c.code}
                        onClick={() => {
                          setCurrency(c.code as "USD" | "NPR");
                          setShowCurrencyDropdown(false);
                        }}
                        className={`flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 ${currency === c.code ? "font-semibold text-[#202124]" : "text-[#6B6B6B]"}`}
                      >
                        <span className="text-base">{c.flag}</span>
                        <span>{c.code}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
          <p className="mt-2 text-[40px] font-semibold text-[#202124]">{convertAmount(689372)}</p>
          <div className="mt-1 flex items-center gap-1.5">
            <span className="text-sm font-semibold text-green-500">↑ 5%</span>
            <span className="text-sm text-[#9A9A9A]">than last month</span>
          </div>

          <div className="mt-6 flex gap-3">
            <button className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#B8F25E] px-4 py-3.5 text-lg font-semibold text-[#202124]">
              ↗ Transfer
            </button>
            <button className="flex flex-1 items-center justify-center gap-2 rounded-full border border-gray-200 px-4 py-3.5 text-lg font-medium text-[#6B6B6B]">
              ⇄ Request
            </button>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between">
              <span className="text-xl font-medium text-[#9A9A9A]">Wallets</span>
              <span className="text-sm text-[#9A9A9A]">Total 6 wallets</span>
            </div>
            <div className="mt-4 flex gap-3">
              {[
                { flag: "🇺🇸", code: "USD", usdAmount: 22678, status: "Active", statusColor: "text-green-500" },
                { flag: "🇪🇺", code: "EUR", usdAmount: 18345, status: "Active", statusColor: "text-green-500" },
                { flag: "🇬🇧", code: "GBP", usdAmount: 15000, status: "Inactive", statusColor: "text-red-400" },
              ].map((wallet) => (
                <div key={wallet.code} className="flex-1 rounded-2xl border border-gray-100 bg-[#F8F8F8] p-4">
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg">{wallet.flag}</span>
                    <span className="text-sm font-medium text-[#202124]">{wallet.code}</span>
                  </div>
                  <p className="mt-2 text-base font-semibold text-[#202124]">{convertAmount(wallet.usdAmount)}</p>
                  <span className={`text-xs font-medium ${wallet.statusColor}`}>{wallet.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Middle Section - Impact Stats */}
        <div className="flex flex-1 flex-col h-full">
          <div className="rounded-[24px] bg-white p-6 shadow-sm h-full flex flex-col">
            <div className="flex flex-col gap-4 flex-1">
              {/* Top Row */}
              <div className="flex gap-4 flex-1">
                {/* Items Reused */}
                <div className="flex-1 rounded-[16px] bg-gradient-to-br from-[#B8F25E] to-[#4CAF50] p-6 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-medium text-[#202124]">Items Reused</span>
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/40">
                      <Recycle size={18} strokeWidth={1.5} className="text-[#202124]" />
                    </span>
                  </div>
                  <p className="mt-4 text-[36px] font-semibold text-[#202124]">{stats.itemsReused}</p>
                  <div className="mt-1 flex items-center gap-1">
                    <span className="text-sm font-semibold text-[#202124]">↑ {stats.itemsChange}%</span>
                    <span className="text-sm text-[#202124]/60">This month</span>
                  </div>
                </div>

                {/* Donations Made */}
                <div className="flex-1 rounded-[16px] bg-[#F8F8F8] p-6 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-medium text-[#9A9A9A]">Donations Made</span>
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200">
                      <Gift size={18} strokeWidth={1.5} className="text-[#6B6B6B]" />
                    </span>
                  </div>
                  <p className="mt-4 text-[36px] font-semibold text-[#202124]">{stats.donationsMade}</p>
                  <div className="mt-1 flex items-center gap-1">
                    <span className={`text-sm font-semibold ${stats.donationsChange >= 0 ? "text-green-500" : "text-red-400"}`}>
                      {stats.donationsChange >= 0 ? "↑" : "↓"} {Math.abs(stats.donationsChange)}%
                    </span>
                    <span className="text-sm text-[#9A9A9A]">This month</span>
                  </div>
                </div>
              </div>

              {/* Bottom Row */}
              <div className="flex gap-4 flex-1">
                {/* People Helped */}
                <div className="flex-1 rounded-[16px] bg-[#F8F8F8] p-6 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-medium text-[#9A9A9A]">People Helped</span>
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200">
                      <Users size={18} strokeWidth={1.5} className="text-[#6B6B6B]" />
                    </span>
                  </div>
                  <p className="mt-4 text-[36px] font-semibold text-[#202124]">{stats.peopleHelped}</p>
                  <div className="mt-1 flex items-center gap-1">
                    <span className={`text-sm font-semibold ${stats.peopleChange >= 0 ? "text-green-500" : "text-red-400"}`}>
                      {stats.peopleChange >= 0 ? "↑" : "↓"} {Math.abs(stats.peopleChange)}%
                    </span>
                    <span className="text-sm text-[#9A9A9A]">This month</span>
                  </div>
                </div>

                {/* Events Joined */}
                <div className="flex-1 rounded-[16px] bg-[#F8F8F8] p-6 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-medium text-[#9A9A9A]">Events Joined</span>
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200">
                      <Calendar size={18} strokeWidth={1.5} className="text-[#6B6B6B]" />
                    </span>
                  </div>
                  <p className="mt-4 text-[36px] font-semibold text-[#202124]">{stats.eventsJoined}</p>
                  <div className="mt-1 flex items-center gap-1">
                    <span className={`text-sm font-semibold ${stats.eventsChange >= 0 ? "text-green-500" : "text-red-400"}`}>
                      {stats.eventsChange >= 0 ? "↑" : "↓"} {Math.abs(stats.eventsChange)}%
                    </span>
                    <span className="text-sm text-[#9A9A9A]">This month</span>
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
    </div>
  );
}
