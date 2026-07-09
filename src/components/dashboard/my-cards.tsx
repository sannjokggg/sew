"use client";

import { Plus, CreditCard } from "lucide-react";

export default function MyCards() {
  const cards = [
    {
      type: "Dark",
      number: "**** **** 6782",
      exp: "09/29",
      cvv: "611",
      bg: "bg-gradient-to-br from-[#1a1a2e] to-[#16213e]",
    },
    {
      type: "Green",
      number: "**** **** 4356",
      exp: "11/30",
      cvv: "423",
      bg: "bg-gradient-to-br from-[#B8F25E] to-[#4CAF50]",
    },
  ];

  return (
    <div className="rounded-[24px] bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-medium text-[#9A9A9A]">My Cards</h3>
        <button className="flex items-center gap-1.5 rounded-full border border-gray-200 px-4 py-1.5 text-sm font-medium text-[#6B6B6B] hover:bg-gray-50 transition-colors">
          <Plus size={16} />
          Add new
        </button>
      </div>

      <div className="mt-5 flex gap-4">
        {cards.map((card, i) => (
          <div
            key={i}
            className={`flex-1 rounded-[20px] p-5 text-white ${card.bg}`}
          >
            <div className="flex items-center justify-between">
              <span className="flex h-7 w-10 items-center justify-center rounded-md bg-white/20 text-[10px] font-bold tracking-wider">
                MC
              </span>
              <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-medium">
                Active
              </span>
            </div>
            <p className="mt-6 text-lg tracking-widest">{card.number}</p>
            <div className="mt-4 flex gap-6 text-[11px] text-white/80">
              <div>
                <p className="text-white/50">EXP</p>
                <p className="font-medium text-white">{card.exp}</p>
              </div>
              <div>
                <p className="text-white/50">CVV</p>
                <p className="font-medium text-white">{card.cvv}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
