"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  CalendarDays, Loader2, GraduationCap, Cpu, Heart,
  Users, Trophy, Palette, Briefcase, PartyPopper, Search, X,
} from "lucide-react";
import ImageLightbox from "@/components/image-lightbox";
import ThreeDotMenu from "@/components/three-dot-menu";
import MultiImageUploader from "@/components/multi-image-uploader";

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

const filterCategories = ["All", "Education", "Technology", "Health & Wellness", "Community", "Sports", "Arts & Culture", "Business", "Social"];
const editCategories = ["Education", "Technology", "Health & Wellness", "Community", "Sports", "Arts & Culture", "Business", "Social"];

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function EventsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [events, setEvents] = useState<Event[]>([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);
  const [editEvent, setEditEvent] = useState<Event | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editCat, setEditCat] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editImages, setEditImages] = useState<string[]>([]);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");

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

  const filtered = events.filter((e) => {
    const matchFilter = filter === "All" || e.category === filter;
    const matchSearch = search === "" || e.title.toLowerCase().includes(search.toLowerCase()) || e.description.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch("/api/events", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setEvents((prev) => prev.filter((e) => e.id !== id));
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const openEditModal = (event: Event) => {
    setEditEvent(event);
    setEditTitle(event.title);
    setEditDesc(event.description);
    setEditCat(event.category);
    setEditDate(event.event_date);
    setEditTime(event.event_time || "");
    setEditLocation(event.location || "");
    setEditImages(event.image_url ? [event.image_url] : []);
    setEditError("");
    setEditSaving(false);
  };

  const handleSaveEdit = async () => {
    if (!editEvent) return;
    setEditError("");
    setEditSaving(true);
    try {
      const res = await fetch(`/api/events/${editEvent.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle,
          description: editDesc,
          category: editCat,
          event_date: editDate,
          event_time: editTime || undefined,
          location: editLocation || undefined,
          image_url: editImages.length > 0 ? editImages[0] : undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setEditError(data.error || "Failed to update");
        setEditSaving(false);
        return;
      }
      const updated = await res.json();
      setEvents((prev) => prev.map((e) => (e.id === updated.id ? { ...e, ...updated } : e)));
      setEditEvent(null);
    } catch {
      setEditError("Something went wrong");
      setEditSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-2" style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl lg:text-5xl font-normal text-text-primary">Events</h1>
        </div>
        <button
          onClick={() => {
            if (session?.user) {
              router.push("/dashboard/events/create");
            } else {
              window.dispatchEvent(new CustomEvent("open-auth-popup", { detail: { redirectTo: "/dashboard/events/create" } }));
            }
          }}
          className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-3 text-base font-semibold text-text-primary transition-colors hover:bg-accent-hover"
        >
          Add Post
        </button>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {filterCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`rounded-full px-5 py-2.5 text-base font-medium transition-all duration-200 cursor-pointer ${
                filter === cat
                  ? "bg-[#1D1B17] text-white shadow-sm"
                  : "bg-surface text-[#666666] hover:bg-border-light hover:text-[#222222]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 rounded-full border border-border-default bg-surface px-4 py-2">
          <Search size={18} className="text-text-muted" />
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-40 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-muted"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center rounded-[24px] bg-surface py-16 shadow-sm">
          <Loader2 size={32} className="animate-spin text-text-muted" />
          <p className="mt-3 text-sm text-text-muted">Loading events...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[24px] bg-surface py-16 shadow-sm">
          <CalendarDays size={48} strokeWidth={1} className="text-text-muted" />
          <p className="mt-4 text-lg font-medium text-text-muted">No events yet</p>
          <p className="mt-1 text-base text-text-muted">Check back later!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filtered.map((event) => {
            const cfg = categoryConfig[event.category] || categoryConfig.Community;
            const Icon = cfg.icon;
            const isOwner = session?.user && String(event.user_id) === String((session.user as { id: string }).id);
            return (
              <Link
                key={event.id}
                href={`/dashboard/events/${event.id}`}
                className="relative rounded-[24px] bg-surface p-3 shadow-sm transition-all hover:shadow-md"
              >
                <div className="absolute right-5 top-5 z-20">
                  <ThreeDotMenu
                    id={event.id}
                    isOwner={!!isOwner}
                    shareUrl={`${window.location.origin}/dashboard/events/${event.id}`}
                    onDelete={handleDelete}
                    onEdit={() => openEditModal(event)}
                  />
                </div>
                <div className={`flex h-[240px] items-center justify-center overflow-hidden rounded-[16px] ${event.image_url ? "bg-surface-alt" : cfg.bg}`}>
                  {event.image_url ? (
                    <img
                      src={event.image_url}
                      alt={event.title}
                      className="cursor-pointer transition-transform hover:scale-105"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setLightbox({ src: event.image_url!, alt: event.title });
                      }}
                    />
                  ) : (
                    <Icon size={80} strokeWidth={1.2} className={cfg.color} />
                  )}
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between">
                    <span className={`rounded-full px-3 py-1 text-base font-semibold ${cfg.badge}`}>
                      {event.category}
                    </span>
                    <span className="text-base text-text-muted">{timeAgo(event.created_at)}</span>
                  </div>
                  <h3 className="mt-3 text-lg font-semibold text-text-primary line-clamp-1">{event.title}</h3>
                  <p className="mt-1 text-base text-text-secondary line-clamp-1">{event.description}</p>
                  <div className="mt-3">
                    <button className="w-full rounded-full bg-accent px-4 py-2.5 text-base font-semibold text-text-primary transition-colors">
                      View Details
                    </button>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Edit Modal */}
      {editEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setEditEvent(null)}>
          <div className="relative w-full max-w-2xl rounded-[24px] bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setEditEvent(null)}
              className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 transition-colors hover:bg-gray-200"
            >
              <X size={18} />
            </button>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Edit Event</h2>
            {editError && (
              <div className="mb-4 rounded-[16px] border border-red-200 bg-red-50 px-5 py-3 text-sm text-red-600">{editError}</div>
            )}
            <div className="grid grid-cols-2 gap-5">
              <div className="col-span-2">
                <label className="mb-1 block text-sm font-semibold text-gray-800">Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full rounded-[14px] border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-gray-300 focus:bg-white focus:ring-2 focus:ring-gray-100"
                  required
                />
              </div>
              <div className="col-span-2">
                <label className="mb-1 block text-sm font-semibold text-gray-800">Description</label>
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  rows={4}
                  className="w-full resize-none rounded-[14px] border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-gray-300 focus:bg-white focus:ring-2 focus:ring-gray-100"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-800">Category</label>
                <div className="flex flex-wrap gap-1.5">
                  {editCategories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setEditCat(cat)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                        editCat === cat ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-800">Date</label>
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full rounded-[14px] border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-gray-300 focus:bg-white focus:ring-2 focus:ring-gray-100"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-800">Time (optional)</label>
                  <input
                    type="time"
                    value={editTime}
                    onChange={(e) => setEditTime(e.target.value)}
                    className="w-full rounded-[14px] border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-gray-300 focus:bg-white focus:ring-2 focus:ring-gray-100"
                  />
                </div>
              </div>
              <div className="col-span-2">
                <label className="mb-1 block text-sm font-semibold text-gray-800">Location (optional)</label>
                <input
                  type="text"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  className="w-full rounded-[14px] border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-gray-300 focus:bg-white focus:ring-2 focus:ring-gray-100"
                  placeholder="e.g. Kathmandu Community Center"
                />
              </div>
              <div className="col-span-2">
                <label className="mb-1 block text-sm font-semibold text-gray-800">Photo</label>
                <MultiImageUploader onUpload={setEditImages} currentImages={editImages} maxImages={1} />
              </div>
            </div>
            <div className="mt-6 flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
              <button
                onClick={() => setEditEvent(null)}
                className="rounded-full border border-gray-200 bg-white px-8 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={editSaving || !editCat}
                className="flex items-center gap-2 rounded-full bg-accent px-8 py-2.5 text-sm font-semibold text-gray-900 transition-colors disabled:opacity-50"
              >
                {editSaving ? <Loader2 size={16} className="animate-spin" /> : null}
                {editSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {lightbox && (
        <ImageLightbox src={lightbox.src} alt={lightbox.alt} onClose={() => setLightbox(null)} />
      )}
    </div>
  );
}
