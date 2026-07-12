"use client";

export default function MonthlySpendingLimit() {
  const spent = 1400;
  const limit = 5500;
  const percent = (spent / limit) * 100;

  return (
    <div className="rounded-[24px] bg-white p-6 shadow-sm">
      <h3 className="text-xl font-medium text-[#9A9A9A]">Monthly Spending Limit</h3>

      <div className="mt-6">
        <div className="relative h-3 w-full rounded-full bg-gray-100">
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-[#B8F25E] to-[#4CAF50]"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <div className="mt-3 flex items-end justify-between">
        <div>
          <p className="text-[28px] font-semibold text-[#202124]">${spent.toLocaleString()}.00</p>
          <p className="text-sm text-[#9A9A9A]">spent out of</p>
        </div>
        <p className="text-lg font-semibold text-[#202124]">${limit.toLocaleString()}.00</p>
      </div>
    </div>
  );
}
