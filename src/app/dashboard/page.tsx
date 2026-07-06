"use client";

import { useSession } from "next-auth/react";

export default function Dashboard() {
  const { data: session } = useSession();
  const name = session?.user?.name?.split(" ")[0] || "User";

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
        <div className="flex w-[400px] flex-col rounded-[24px] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[#9A9A9A]">Total Balance</span>
            <span className="flex items-center gap-1 rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-[#6B6B6B]">
              🇺🇸 USD ▾
            </span>
          </div>
          <p className="mt-1 text-[32px] font-semibold text-[#202124]">$689,372.00</p>
          <div className="mt-1 flex items-center gap-1.5">
            <span className="text-xs font-semibold text-green-500">↑ 5%</span>
            <span className="text-xs text-[#9A9A9A]">than last month</span>
          </div>

          <div className="mt-5 flex gap-3">
            <button className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#B8F25E] px-4 py-3 text-sm font-semibold text-[#202124]">
              ↗ Transfer
            </button>
            <button className="flex flex-1 items-center justify-center gap-2 rounded-full border border-gray-200 px-4 py-3 text-sm font-medium text-[#6B6B6B]">
              ⇄ Request
            </button>
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[#9A9A9A]">Wallets</span>
              <span className="text-xs text-[#9A9A9A]">Total 6 wallets</span>
            </div>
            <div className="mt-3 flex gap-3">
              {[
                { flag: "🇺🇸", code: "USD", amount: "$22,678.00", status: "Active", statusColor: "text-green-500" },
                { flag: "🇪🇺", code: "EUR", amount: "$18,345.00", status: "Active", statusColor: "text-green-500" },
                { flag: "🇬🇧", code: "GBP", amount: "€15,000.00", status: "Inactive", statusColor: "text-red-400" },
              ].map((wallet) => (
                <div key={wallet.code} className="flex-1 rounded-2xl border border-gray-100 bg-[#F8F8F8] p-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">{wallet.flag}</span>
                    <span className="text-xs font-medium text-[#202124]">{wallet.code}</span>
                  </div>
                  <p className="mt-1.5 text-sm font-semibold text-[#202124]">{wallet.amount}</p>
                  <span className={`text-[10px] font-medium ${wallet.statusColor}`}>{wallet.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Middle Section */}
        <div className="flex flex-1 flex-col gap-4">
          {/* Top Row */}
          <div className="flex gap-4">
            {/* Total Earnings */}
            <div className="flex-1 rounded-[24px] bg-gradient-to-br from-[#B8F25E] to-[#4CAF50] p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#202124]">Total Earnings</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/40 text-sm">💰</span>
              </div>
              <p className="mt-4 text-[32px] font-semibold text-[#202124]">$950</p>
              <div className="mt-1 flex items-center gap-1">
                <span className="text-xs font-semibold text-[#202124]">↑ 7%</span>
                <span className="text-xs text-[#202124]/60">This month</span>
              </div>
            </div>

            {/* Total Spending */}
            <div className="flex-1 rounded-[24px] bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#9A9A9A]">Total Spending</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm">📊</span>
              </div>
              <p className="mt-4 text-[32px] font-semibold text-[#202124]">$700</p>
              <div className="mt-1 flex items-center gap-1">
                <span className="text-xs font-semibold text-red-400">↓ 5%</span>
                <span className="text-xs text-[#9A9A9A]">This month</span>
              </div>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="flex gap-4">
            {/* Total Income */}
            <div className="flex-1 rounded-[24px] bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#9A9A9A]">Total Income</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm">📈</span>
              </div>
              <p className="mt-4 text-[32px] font-semibold text-[#202124]">$1,050</p>
              <div className="mt-1 flex items-center gap-1">
                <span className="text-xs font-semibold text-green-500">↑ 8%</span>
                <span className="text-xs text-[#9A9A9A]">This month</span>
              </div>
            </div>

            {/* Total Revenue */}
            <div className="flex-1 rounded-[24px] bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#9A9A9A]">Total Revenue</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm">💵</span>
              </div>
              <p className="mt-4 text-[32px] font-semibold text-[#202124]">$850</p>
              <div className="mt-1 flex items-center gap-1">
                <span className="text-xs font-semibold text-green-500">↑ 4%</span>
                <span className="text-xs text-[#9A9A9A]">This month</span>
              </div>
            </div>
          </div>
        </div>

        {/* Total Income Chart */}
        <div className="w-[320px] rounded-[24px] bg-white p-6 shadow-sm">
          <div>
            <span className="text-base font-semibold text-[#202124]">Total Income</span>
            <p className="mt-1 text-xs text-[#9A9A9A]">View your income in a certain period of time</p>
          </div>
          <div className="mt-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#202124]">Profit and Loss</span>
              <div className="flex items-center gap-3 text-[10px] text-[#6B6B6B]">
                <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-[#B8F25E]" /> Profit</span>
                <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-[#202124]" /> Loss</span>
              </div>
            </div>
            <div className="mt-4 flex gap-2 h-[160px]">
              {/* Y-axis */}
              <div className="flex flex-col justify-between text-[10px] text-[#9A9A9A] pr-1">
                <span>50k</span>
                <span>40k</span>
                <span>30k</span>
                <span>20k</span>
                <span>10k</span>
                <span>00</span>
              </div>
              {/* Chart Area */}
              <div className="flex flex-1 items-end gap-1">
                {[
                  { profit: 55, loss: 22 },
                  { profit: 70, loss: 28 },
                  { profit: 50, loss: 18 },
                  { profit: 75, loss: 25 },
                  { profit: 60, loss: 20 },
                  { profit: 90, loss: 35 },
                  { profit: 80, loss: 22 },
                  { profit: 65, loss: 18 },
                ].map((bar, i) => (
                  <div key={i} className="flex flex-1 items-end gap-1">
                    <div className="w-full rounded-t-sm bg-[#202124]" style={{ height: `${bar.loss}%` }} />
                    <div className="w-full rounded-t-sm bg-[#B8F25E] relative overflow-hidden" style={{ height: `${bar.profit}%` }}>
                      <div className="absolute inset-0" style={{
                        backgroundImage: "repeating-linear-gradient(135deg, transparent, transparent 3px, rgba(255,255,255,0.3) 3px, rgba(255,255,255,0.3) 6px)"
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* X-axis labels */}
            <div className="ml-8 mt-2 flex justify-between text-[10px] text-[#9A9A9A]">
              <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
