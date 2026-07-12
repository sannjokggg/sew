import { NextResponse } from "next/server";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Deterministic values based on month index
const globalBase = [2.6, 2.5, 2.7, 2.8, 2.9, 3.0, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6];
const nepalBase = [0.8, 0.7, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8];

export const dynamic = "force-dynamic";

export async function GET() {
  const now = new Date();
  const monthlyData = Array.from({ length: 8 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 8 + i, 1);
    const idx = d.getMonth();
    return {
      month: months[idx],
      global: globalBase[idx],
      nepal: nepalBase[idx],
    };
  });

  return NextResponse.json({
    monthly: monthlyData,
    note: "Global data in gigatonnes (Gt). Nepal data in megatonnes (Mt). For real data: https://ourworldindata.org/co2-emissions",
  });
}
