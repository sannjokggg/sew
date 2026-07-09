"use client";

import { Search, SlidersHorizontal, MoreHorizontal } from "lucide-react";

const activities = [
  {
    id: "#OR-001",
    name: "Amazon Prime",
    icon: "🛒",
    price: "$850.00",
    status: "Completed" as const,
    date: "12 Dec 2024",
  },
  {
    id: "#OR-002",
    name: "Starbucks",
    icon: "☕",
    price: "$320.00",
    status: "Pending" as const,
    date: "14 Dec 2024",
  },
  {
    id: "#OR-003",
    name: "Spotify",
    icon: "🎵",
    price: "$450.00",
    status: "In Progress" as const,
    date: "18 Dec 2024",
  },
  {
    id: "#OR-004",
    name: "Netflix",
    icon: "🎬",
    price: "$210.00",
    status: "Completed" as const,
    date: "20 Dec 2024",
  },
  {
    id: "#OR-005",
    name: "Nike Store",
    icon: "👟",
    price: "$760.00",
    status: "Completed" as const,
    date: "25 Dec 2024",
  },
];

const statusStyles: Record<string, string> = {
  Completed: "bg-green-100 text-green-700",
  Pending: "bg-red-100 text-red-600",
  "In Progress": "bg-yellow-100 text-yellow-700",
};

export default function RecentActivities() {
  return (
    <div className="flex h-full flex-col rounded-[24px] bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-medium text-[#9A9A9A]">Recent Activities</h3>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9A9A9A]" />
            <input
              type="text"
              placeholder="Search..."
              className="w-52 rounded-full border border-gray-200 bg-gray-50 py-2 pl-9 pr-4 text-sm text-[#6B6B6B] placeholder:text-[#9A9A9A] focus:border-[#B8F25E] focus:outline-none"
            />
          </div>
          <button className="flex items-center gap-1.5 rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-[#6B6B6B] hover:bg-gray-50 transition-colors">
            <SlidersHorizontal size={16} />
            Filter
          </button>
        </div>
      </div>

      <div className="mt-6 flex-1 overflow-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-[#9A9A9A] text-xs uppercase tracking-wider">
              <th className="pb-4 pr-2">
                <input type="checkbox" className="h-4 w-4 rounded border-gray-300 accent-[#B8F25E]" />
              </th>
              <th className="pb-4 pr-6 font-medium">Order ID</th>
              <th className="pb-4 pr-8 font-medium">Activity</th>
              <th className="pb-4 pr-6 font-medium">Price</th>
              <th className="pb-4 pr-6 font-medium">Status</th>
              <th className="pb-4 pr-4 font-medium">Date</th>
              <th className="pb-4 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {activities.map((row) => (
              <tr key={row.id} className="border-t border-gray-100">
                <td className="py-4 pr-2">
                  <input type="checkbox" className="h-4 w-4 rounded border-gray-300 accent-[#B8F25E]" />
                </td>
                <td className="py-4 pr-6 font-medium text-[#202124]">{row.id}</td>
                <td className="py-4 pr-8">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-base">
                      {row.icon}
                    </span>
                    <span className="font-medium text-[#202124]">{row.name}</span>
                  </div>
                </td>
                <td className="py-4 pr-6 font-semibold text-[#202124]">{row.price}</td>
                <td className="py-4 pr-6">
                  <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[row.status]}`}>
                    {row.status}
                  </span>
                </td>
                <td className="py-4 pr-4 text-[#6B6B6B]">{row.date}</td>
                <td className="py-4">
                  <button className="text-[#9A9A9A] hover:text-[#6B6B6B]">
                    <MoreHorizontal size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
