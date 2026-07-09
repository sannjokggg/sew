"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const data = [
  { month: "Jan", profit: 15, loss: 22 },
  { month: "Feb", profit: 25, loss: 17 },
  { month: "Mar", profit: 20, loss: 14 },
  { month: "Apr", profit: 18, loss: 20 },
  { month: "May", profit: 27, loss: 17 },
  { month: "Jun", profit: 19, loss: 29 },
  { month: "Jul", profit: 20, loss: 21 },
  { month: "Aug", profit: 18, loss: 15 },
];

const formatYAxis = (value: number) => {
  if (value === 0) return "00";
  return `${value}k`;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-lg">
        <p className="mb-2 text-sm font-semibold text-[#202124]">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-[#6B6B6B]">
              {entry.name}:{" "}
              <span className="font-semibold text-[#202124]">{entry.value}k</span>
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function IncomeChart() {
  return (
    <div
      className="rounded-[24px] bg-white p-6 shadow-sm h-full flex flex-col"
      style={{
        boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
        fontFamily: "var(--font-inter), Inter, sans-serif",
      }}
    >
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-[#202124]">Total Income</h2>
        <p className="mt-1 text-base text-[#9A9A9A]">
          View your income in a certain period of time
        </p>
      </div>

      {/* Chart Container */}
      <div className="rounded-[16px] bg-[#F8F8F8] p-4 flex-1 flex flex-col">
        {/* Chart Header */}
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[#202124]">
            Profit and Loss
          </h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-3.5 w-3.5 rounded-full bg-[#B8F25E]" />
              <span className="text-base text-[#6B6B6B]">Profit</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3.5 w-3.5 rounded-full bg-[#111111]" />
              <span className="text-base text-[#6B6B6B]">Loss</span>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="flex-1 min-h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              barCategoryGap="25%"
              barGap={4}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#E5E7EB"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9A9A9A", fontSize: 14 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9A9A9A", fontSize: 14 }}
                tickFormatter={formatYAxis}
                domain={[0, 50]}
                ticks={[0, 10, 20, 30, 40, 50]}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "rgba(0,0,0,0.02)" }}
              />
              <Bar
                dataKey="loss"
                stackId="stack"
                fill="#111111"
                radius={[0, 0, 6, 6]}
                barSize={28}
                animationDuration={1000}
                animationEasing="ease-out"
              />
              <Bar
                dataKey="profit"
                stackId="stack"
                fill="#B8F25E"
                radius={[6, 6, 0, 0]}
                barSize={28}
                animationDuration={1000}
                animationEasing="ease-out"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
