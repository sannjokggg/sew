"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, CalendarDays, Clock, MapPin, Loader2, Share2,
  GraduationCap, Cpu, Heart, Users, Trophy, Palette, Briefcase, PartyPopper,
} from "lucide-react";

interface EventDetail {
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

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

function formatTime(timeStr: string | null) {
  if (!timeStr) return "";
  const [h, m] = timeStr.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const h12 = hour % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

function daysUntil(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days < 0) return `${Math.abs(days)} day${Math.abs(days) !== 1 ? "s" : ""} ago`;
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `In ${days} days`;
}

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/events`)
      .then((res) => res.json())
      .then((data) => {
        const found = Array.isArray(data) ? data.find((e: EventDetail) => String(e.id) === eventId) : null;
        if (found) setEvent(found);
        else router.push("/dashboard/events");
      })
      .catch(() => router.push("/dashboard/events"))
      .finally(() => setLoading(false));
  }, [eventId, router]);

  if (loading) {
    return (
      <div className="flex flex-col gap-6 p-2" style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}>
        <div className="flex items-center justify-center py-40">
          <Loader2 size={32} className="animate-spin text-[#9A9A9A]" />
        </div>
      </div>
    );
  }

  if (!event) return null;

  const cfg = categoryConfig[event.category] || categoryConfig.Community;
  const Icon = cfg.icon;
  const isPast = new Date(event.event_date) < new Date(new Date().toDateString());

  return (
    <div className="flex flex-col gap-6 p-2" style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}>
      <button
        onClick={() => router.back()}
        className="flex w-fit items-center gap-2 text-sm text-[#9A9A9A] transition-colors hover:text-[#202124]"
      >
        <ArrowLeft size={18} strokeWidth={1.5} />
        Back to events
      </button>

      <div className="flex gap-8">
        <div className="w-[480px] flex-shrink-0">
          <div className={`flex h-[380px] items-center justify-center rounded-[20px] ${cfg.bg}`}>
            {event.image_url ? (
              <img src={event.image_url} alt={event.title} className="h-full w-full rounded-[20px] object-cover" />
            ) : (
              <Icon size={100} strokeWidth={1.2} className={cfg.color} />
            )}
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-4 max-w-[380px]">
          <div className="rounded-[24px] bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <span className={`rounded-full px-4 py-1.5 text-xs font-semibold ${cfg.badge}`}>
                {event.category}
              </span>
              {isPast ? (
                <span className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-[#9A9A9A]">Past Event</span>
              ) : (
                <span className="rounded-full bg-[#B8F25E]/20 px-3 py-1.5 text-xs font-semibold text-[#202124]">{daysUntil(event.event_date)}</span>
              )}
            </div>

            <h1 className="mt-5 text-3xl font-normal text-[#202124]">{event.title}</h1>

            <div className="mt-5 flex flex-col gap-3">
              <div className="flex items-center gap-3 text-sm text-[#6B6B6B]">
                <CalendarDays size={18} className="text-[#9A9A9A]" />
                {formatDate(event.event_date)}
              </div>
              {event.event_time && (
                <div className="flex items-center gap-3 text-sm text-[#6B6B6B]">
                  <Clock size={18} className="text-[#9A9A9A]" />
                  {formatTime(event.event_time)}
                </div>
              )}
              {event.location && (
                <div className="flex items-center gap-3 text-sm text-[#6B6B6B]">
                  <MapPin size={18} className="text-[#9A9A9A]" />
                  {event.location}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[24px] bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#B8F25E] to-[#4CAF50] text-base font-semibold text-[#202124]">
                {event.organizer_name[0]?.toUpperCase() || "?"}
              </div>
              <div>
                <p className="text-sm font-semibold text-[#202124]">{event.organizer_name}</p>
                <p className="text-xs text-[#9A9A9A]">Organizer</p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              {!isPast && (
                <button className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#B8F25E] px-4 py-3 text-sm font-semibold text-[#202124] transition-colors hover:bg-[#a8e04e]">
                  RSVP
                </button>
              )}
              <button className="flex h-[46px] w-[46px] flex-shrink-0 items-center justify-center rounded-full border border-gray-200 text-[#9A9A9A] transition-colors hover:border-gray-300 hover:text-[#6B6B6B]">
                <Share2 size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="rounded-[24px] bg-white p-8 shadow-sm">
        <h2 className="text-xl font-semibold text-[#202124]">About this event</h2>
        <p className="mt-4 text-sm leading-relaxed text-[#6B6B6B]">{event.description}</p>
      </div>
    </div>
  );
}
