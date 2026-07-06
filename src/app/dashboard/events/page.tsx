"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarDays, MapPin, Clock, Loader2, GraduationCap, Cpu, Heart,
  Users, Trophy, Palette, Briefcase, PartyPopper, Plus,
} from "lucide-react";

interface Event {
  id: number;
  user_id: number;
  title: string;
  description: string;
  category: string;
  event_date: string;
  event_time: string | null;
  location: string | null;
  image_url: string | null;
  organizer_name: string;
  created_at: string;
}

const categoryConfig: Record<string, { icon: typeof GraduationCap; color: string; bg: string; badge: string }> = {
  Education: { icon: GraduationCap, color: "text-[#3B82F6]", bg: "bg-blue-50", badge: "bg-blue-100 text-blue-700" },
  Technology: { icon: Cpu, color: "text-[#8B5CF6]", bg: "bg-purple-50", badge: "bg-purple-100 text-purple-700" },
  "Health & Wellness": { icon: Heart, color: "text-[#EF4444]", bg: "bg-red-50", badge: "bg-red-100 text-red-700" },
  Community: { icon: Users, color: "text-[#10B981]", bg: "bg-emerald-50", badge: "bg-emerald-100 text-emerald-700" },
  Sports: { icon: Trophy, color: "text-[#F59E0B]", bg: "bg-amber-50", badge: "bg-amber-100 text-amber-700" },
  "Arts & Culture": { icon: Palette, color: "text-[#EC4899]", bg: "bg-pink-50", badge: "bg-pink-100 text-pink-700" },
  Business: { icon: Briefcase, color: "text-[#6366F1]", bg: "bg-indigo-50", badge: "bg-indigo-100 text-indigo-700" },
  Social: { icon: PartyPopper, color: "text-[#F97316]", bg: "bg-orange-50", badge: "bg-orange-100 text-orange-700" },
};

const categories = ["All", "Education", "Technology", "Health & Wellness", "Community", "Sports", "Arts & Culture", "Business", "Social"];

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatTime(timeStr: string | null) {
  if (!timeStr) return "";
  const [h, m] = timeStr.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const h12 = hour % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

function isPast(dateStr: string) {
  return new Date(dateStr) < new Date(new Date().toDateString());
}

export default function EventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/events")
      .then((res) => res.json())
      .then((data) => {
        setEvents(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setEvents([]);
        setLoading(false);
      });
  }, []);

  const filtered = filter === "All" ? events : events.filter((e) => e.category === filter);
  const upcoming = filtered.filter((e) => !isPast(e.event_date));
  const past = filtered.filter((e) => isPast(e.event_date));

  return (
    <div className="flex flex-col gap-6 p-2" style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-5xl font-normal text-[#202124]">Events</h1>
          <p className="text-lg text-[#6B6B6B]">Discover and join events happening in your community.</p>
        </div>
        <Link
          href="/dashboard/events/create"
          className="flex items-center gap-2 rounded-full bg-[#B8F25E] px-6 py-3 text-sm font-semibold text-[#202124] shadow-sm transition-colors hover:bg-[#a8e04e]"
        >
          <Plus size={18} strokeWidth={2.5} />
          Create Event
        </Link>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-200 cursor-pointer ${
              filter === cat
                ? "bg-[#1D1B17] text-white shadow-sm"
                : "bg-white text-[#666666] hover:bg-gray-100 hover:text-[#222222]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Events List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center rounded-[24px] bg-white py-16 shadow-sm">
          <Loader2 size={32} className="animate-spin text-[#9A9A9A]" />
          <p className="mt-3 text-sm text-[#9A9A9A]">Loading events...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[24px] bg-white py-16 shadow-sm">
          <CalendarDays size={48} strokeWidth={1} className="text-[#9A9A9A]" />
          <p className="mt-4 text-lg font-medium text-[#9A9A9A]">No events found</p>
          <p className="mt-1 text-sm text-[#9A9A9A]">Be the first to create an event!</p>
          <Link
            href="/dashboard/events/create"
            className="mt-4 rounded-full bg-[#B8F25E] px-6 py-3 text-sm font-semibold text-[#202124] shadow-sm transition-colors hover:bg-[#a8e04e]"
          >
            Create Event
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {/* Upcoming */}
          {upcoming.length > 0 && (
            <div>
              <h2 className="mb-4 text-lg font-semibold text-[#202124]">Upcoming Events</h2>
              <div className="grid grid-cols-3 gap-5">
                {upcoming.map((event) => {
                  const cfg = categoryConfig[event.category] || categoryConfig.Community;
                  const Icon = cfg.icon;
                  return (
                    <div key={event.id} className="rounded-[24px] bg-white shadow-sm transition-shadow hover:shadow-md overflow-hidden">
                      <div className={`flex h-[160px] items-center justify-center ${cfg.bg}`}>
                        {event.image_url ? (
                          <img src={event.image_url} alt={event.title} className="h-full w-full object-cover" />
                        ) : (
                          <Icon size={56} strokeWidth={1.2} className={cfg.color} />
                        )}
                      </div>
                      <div className="p-5">
                        <div className="flex items-center gap-2">
                          <span className={`rounded-full px-3 py-1 text-[10px] font-semibold ${cfg.badge}`}>
                            {event.category}
                          </span>
                          <span className="text-[10px] text-[#9A9A9A]">{formatDate(event.event_date)}</span>
                        </div>
                        <h3 className="mt-3 text-base font-semibold text-[#202124] line-clamp-1">{event.title}</h3>
                        <p className="mt-1 text-xs text-[#6B6B6B] line-clamp-2">{event.description}</p>
                        <div className="mt-3 flex flex-col gap-1.5">
                          {event.event_time && (
                            <div className="flex items-center gap-1.5 text-xs text-[#9A9A9A]">
                              <Clock size={12} />
                              {formatTime(event.event_time)}
                            </div>
                          )}
                          {event.location && (
                            <div className="flex items-center gap-1.5 text-xs text-[#9A9A9A]">
                              <MapPin size={12} />
                              {event.location}
                            </div>
                          )}
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                          <span className="text-xs text-[#9A9A9A]">by {event.organizer_name}</span>
                          <button
                            onClick={() => router.push(`/dashboard/events/${event.id}`)}
                            className="rounded-full bg-[#B8F25E] px-4 py-2 text-xs font-semibold text-[#202124] transition-colors hover:bg-[#a8e04e]"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Past */}
          {past.length > 0 && (
            <div>
              <h2 className="mb-4 text-lg font-semibold text-[#9A9A9A]">Past Events</h2>
              <div className="grid grid-cols-3 gap-5">
                {past.map((event) => {
                  const cfg = categoryConfig[event.category] || categoryConfig.Community;
                  const Icon = cfg.icon;
                  return (
                    <div key={event.id} className="rounded-[24px] bg-white shadow-sm overflow-hidden opacity-60">
                      <div className={`flex h-[140px] items-center justify-center ${cfg.bg}`}>
                        {event.image_url ? (
                          <img src={event.image_url} alt={event.title} className="h-full w-full object-cover" />
                        ) : (
                          <Icon size={48} strokeWidth={1.2} className={cfg.color} />
                        )}
                      </div>
                      <div className="p-5">
                        <span className={`rounded-full px-3 py-1 text-[10px] font-semibold ${cfg.badge}`}>
                          {event.category}
                        </span>
                        <h3 className="mt-2 text-base font-semibold text-[#202124] line-clamp-1">{event.title}</h3>
                        <p className="mt-1 text-xs text-[#9A9A9A]">{formatDate(event.event_date)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
