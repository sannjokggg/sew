import { NextResponse } from "next/server";
import pool from "@/lib/db";

const IQAIR_KEY = "99b11e3a-0fec-4401-a2ca-8e15d13eda57";

const cities = [
  { city: "Kathmandu", lat: 27.7172, lon: 85.324 },
  { city: "Pokhara", lat: 28.2096, lon: 83.9856 },
  { city: "Bharatpur", lat: 27.6833, lon: 84.4333 },
  { city: "Biratnagar", lat: 26.4525, lon: 87.2718 },
  { city: "Lalitpur", lat: 27.671, lon: 85.3181 },
];

async function ensureAqiTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS aqi_cache (
      id SERIAL PRIMARY KEY,
      cities JSONB NOT NULL,
      fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

function getAqiColor(aqi: number | null): string {
  if (aqi === null) return "text-gray-400";
  if (aqi <= 50) return "text-green-500";
  if (aqi <= 100) return "text-yellow-500";
  if (aqi <= 150) return "text-orange-500";
  if (aqi <= 200) return "text-red-500";
  return "text-purple-500";
}

function getAqiLabel(aqi: number | null): string {
  if (aqi === null) return "N/A";
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Unhealthy for Sensitive";
  if (aqi <= 200) return "Unhealthy";
  return "Very Unhealthy";
}

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureAqiTable();

    const cached = await pool.query(
      `SELECT cities, fetched_at FROM aqi_cache ORDER BY id DESC LIMIT 1`
    );

    if (cached.rows.length > 0) {
      const lastFetch = new Date(cached.rows[0].fetched_at);
      const hoursSince = (Date.now() - lastFetch.getTime()) / (1000 * 60 * 60);
      const cachedCities = cached.rows[0].cities;
      if (hoursSince < 24 && Array.isArray(cachedCities) && cachedCities.length >= 5) {
        cachedCities.sort((a: any, b: any) => (b.aqi ?? -1) - (a.aqi ?? -1));
        return NextResponse.json({ cities: cachedCities });
      }
    }

    const results = await Promise.allSettled(
      cities.map(async (c) => {
        const url = `https://api.airvisual.com/v2/nearest_city?lat=${c.lat}&lon=${c.lon}&key=${IQAIR_KEY}`;
        const res = await fetch(url, { cache: "no-store" });
        const json = await res.json();
        if (json.status === "success" && json.data) {
          const d = json.data;
          const aqi = d.current?.pollution?.aqius ?? null;
          const temp = d.current?.weather?.tp ?? null;
          return { city: c.city, aqi, temp, color: getAqiColor(aqi), label: getAqiLabel(aqi) };
        }
        return { city: c.city, aqi: null, temp: null, color: "text-gray-400", label: "N/A" };
      })
    );

    const data = results
      .map((r, i) => {
        if (r.status === "fulfilled") return r.value;
        return { city: cities[i].city, aqi: null, temp: null, color: "text-gray-400", label: "N/A" };
      })
      .sort((a, b) => (b.aqi ?? -1) - (a.aqi ?? -1));

    if (data.length > 0) {
      data.sort((a: any, b: any) => (b.aqi ?? -1) - (a.aqi ?? -1));
      await pool.query(
        `INSERT INTO aqi_cache (cities) VALUES ($1)`,
        [JSON.stringify(data)]
      );
    }

    return NextResponse.json({ cities: data });
  } catch (error) {
    console.error("AQI fetch error:", error);
    try {
      const fallback = await pool.query(
        `SELECT cities FROM aqi_cache ORDER BY id DESC LIMIT 1`
      );
      if (fallback.rows.length > 0) {
        const fallbackCities = fallback.rows[0].cities;
        if (Array.isArray(fallbackCities)) {
          fallbackCities.sort((a: any, b: any) => (b.aqi ?? -1) - (a.aqi ?? -1));
          return NextResponse.json({ cities: fallbackCities });
        }
      }
    } catch {}
    return NextResponse.json({ cities: [] });
  }
}
