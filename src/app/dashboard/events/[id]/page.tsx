"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ArrowLeft, CalendarDays, Clock, MapPin, Loader2, Share2, Trash2, MoreVertical,
  GraduationCap, Cpu, Heart, Users, Trophy, Palette, Briefcase, PartyPopper,
  ChevronLeft, ChevronRight, X,
} from "lucide-react";
import ImageLightbox from "@/components/image-lightbox";
import ThreeDotMenu from "@/components/three-dot-menu";
import MultiImageUploader from "@/components/multi-image-uploader";

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

interface SimilarEvent {
  id: number;
  title: string;
  category: string;
  event_date: string;
  image_url: string | null;
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

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;
  const { data: session } = useSession();
  const myId = (session?.user as { id?: string })?.id;

  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editEvent, setEditEvent] = useState<EventDetail | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editCat, setEditCat] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editImages, setEditImages] = useState<string[]>([]);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);
  const [similarEvents, setSimilarEvents] = useState<SimilarEvent[]>([]);

  useEffect(() => {
    fetch(`/api/events`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const found = data.find((e: EventDetail) => String(e.id) === eventId);
          if (found) {
            setEvent(found);
            const sameCat = data.filter((e: SimilarEvent) => e.id !== Number(eventId) && e.category === found.category);
            const others = data.filter((e: SimilarEvent) => e.id !== Number(eventId) && e.category !== found.category);
            setSimilarEvents([...sameCat, ...others].slice(0, 4));
          } else {
            router.push("/dashboard/events");
          }
        }
      })
      .catch(() => router.push("/dashboard/events"))
      .finally(() => setLoading(false));
  }, [eventId, router]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/events", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: Number(eventId) }),
      });
      if (res.ok) router.push("/dashboard/events");
    } finally { setDeleting(false); }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 p-2" style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}>
        <div className="flex items-center justify-center py-40">
          <Loader2 size={32} className="animate-spin text-text-muted" />
        </div>
      </div>
    );
  }

  if (!event) return null;

  const cfg = categoryConfig[event.category] || categoryConfig.Community;
  const Icon = cfg.icon;
  const isPast = new Date(event.event_date) < new Date(new Date().toDateString());
  const allImages = event.image_url ? [event.image_url] : [];

  return (
    <div className="flex flex-col gap-0" style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}>
      {/* Mobile: Full-width Image with Back + Badge Overlay */}
      <div className="relative w-full lg:hidden">
        <div className="relative h-[380px] w-full bg-surface-alt">
          {allImages.length > 0 ? (
            <>
              <img
                src={allImages[selectedImage]}
                alt={event.title}
                className="h-full w-full object-cover"
                onClick={() => setLightbox({ src: allImages[selectedImage], alt: event.title })}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/20" />
            </>
          ) : (
            <div className={`flex h-full items-center justify-center ${cfg.bg}`}>
              <Icon size={80} strokeWidth={1.2} className={cfg.color} />
            </div>
          )}

          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="absolute left-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-surface/80 backdrop-blur-sm text-text-primary shadow-sm"
          >
            <ArrowLeft size={20} />
          </button>

          {/* Category Badge */}
          <div className="absolute bottom-4 left-4 z-10 rounded-full bg-surface px-4 py-2 shadow-sm">
            <span className={`text-base font-semibold ${cfg.badge}`}>{event.category}</span>
          </div>

          {/* Image Dots */}
          {allImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {allImages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`h-2 rounded-full transition-all ${selectedImage === i ? "w-6 bg-surface" : "w-2 bg-surface/50"}`}
                />
              ))}
            </div>
          )}

          {/* Thumbnails */}
          {allImages.length > 1 && (
            <div className="absolute bottom-4 right-4 z-10 flex gap-1.5">
              {allImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`h-[52px] w-[52px] flex-shrink-0 overflow-hidden rounded-[10px] border-2 transition-all ${
                    selectedImage === i ? "border-white opacity-100" : "border-transparent opacity-60"
                  }`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Desktop: Side-by-side Layout */}
      <div className="hidden lg:flex justify-center w-full px-6 pt-4">
        <div className="flex max-w-[1200px] w-full gap-8 items-start">
          {/* Image Viewer */}
          <div className="flex w-[560px] flex-shrink-0 flex-col gap-3">
            <div className="relative flex h-[calc(100vh-200px)] items-center justify-center overflow-hidden rounded-[20px] bg-surface-alt">
              {allImages.length > 0 ? (
                <>
                  <img
                    src={allImages[selectedImage]}
                    alt={event.title}
                    className="h-full w-full cursor-pointer object-cover transition-transform hover:scale-105"
                    onClick={() => setLightbox({ src: allImages[selectedImage], alt: event.title })}
                  />
                  {allImages.length > 1 && (
                    <>
                      <button
                        onClick={() => setSelectedImage((prev) => prev > 0 ? prev - 1 : allImages.length - 1)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-surface/80 text-text-primary shadow-sm hover:bg-surface transition-colors"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button
                        onClick={() => setSelectedImage((prev) => prev < allImages.length - 1 ? prev + 1 : 0)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-surface/80 text-text-primary shadow-sm hover:bg-surface transition-colors"
                      >
                        <ChevronRight size={20} />
                      </button>
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {allImages.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setSelectedImage(i)}
                            className={`h-2 rounded-full transition-all ${selectedImage === i ? "w-6 bg-text-primary" : "w-2 bg-gray-300"}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <Icon size={80} strokeWidth={1.2} className={cfg.color} />
                  <span className="text-base text-text-muted">No image</span>
                </div>
              )}
            </div>
            {allImages.length > 1 && (
              <div className="flex gap-2">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`h-[72px] w-[72px] flex-shrink-0 overflow-hidden rounded-[12px] border-2 transition-all ${
                      selectedImage === i ? "border-text-primary opacity-100" : "border-transparent opacity-50 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Desktop Content */}
          <div className="flex-1 pb-8">
            <div className="rounded-[24px] bg-surface p-6 shadow-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-3.5 py-1 text-sm font-semibold ${cfg.badge}`}>
                  {event.category}
                </span>
                {isPast ? (
                  <span className="rounded-full border border-border-default px-3.5 py-1 text-sm font-medium text-text-muted">Past Event</span>
                ) : (
                  <span className="rounded-full border border-border-default px-3.5 py-1 text-sm font-medium text-text-primary">{daysUntil(event.event_date)}</span>
                )}
                <span className="flex items-center gap-1 text-sm text-text-muted ml-auto">
                  <Clock size={13} />
                  {timeAgo(event.created_at)}
                </span>
              </div>
              <h1 className="mt-4 text-2xl font-semibold text-text-primary">{event.title}</h1>
              <div className="mt-4 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <CalendarDays size={15} className="text-text-muted" />
                  {formatDate(event.event_date)}
                </div>
                {event.event_time && (
                  <div className="flex items-center gap-2 text-sm text-text-secondary">
                    <Clock size={15} className="text-text-muted" />
                    {formatTime(event.event_time)}
                  </div>
                )}
                {event.location && (
                  <div className="flex items-center gap-2 text-sm text-text-secondary">
                    <MapPin size={15} className="text-text-muted" />
                    {event.location}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-5 rounded-[24px] bg-surface p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-text-primary">About this event</h2>
              <p className="mt-3 text-sm leading-relaxed text-text-secondary">{event.description}</p>
            </div>

            <div className="mt-5 rounded-[24px] bg-surface p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-accent to-[#4CAF50] text-base font-semibold text-text-primary">
                    {event.organizer_name[0]?.toUpperCase() || "?"}
                  </div>
                  <div>
                    <p className="text-base font-semibold text-text-primary">{event.organizer_name}</p>
                    <p className="text-sm text-text-muted">Organizer</p>
                  </div>
                </div>
                {myId === String(event.user_id) && (
                  <ThreeDotMenu
                    id={event.id}
                    isOwner={true}
                    shareUrl={`${window.location.origin}/dashboard/events/${event.id}`}
                    onDelete={async (id) => {
                      const res = await fetch("/api/events", {
                        method: "DELETE",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id }),
                      });
                      if (res.ok) router.push("/dashboard/events");
                    }}
                    onEdit={() => {
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
                    }}
                  />
                )}
              </div>
              <div className="mt-4 flex gap-2">
                {!isPast && (
                  <button className="flex flex-1 items-center justify-center gap-2 rounded-full bg-accent px-4 py-3 text-base font-semibold text-text-primary transition-colors">
                    RSVP
                  </button>
                )}
                <button className="flex h-[46px] w-[46px] flex-shrink-0 items-center justify-center rounded-full border border-border-default text-text-muted transition-colors hover:text-text-secondary">
                  <Share2 size={18} />
                </button>
              </div>
            </div>

            {similarEvents.length > 0 && (
              <div className="mt-5 rounded-[24px] bg-surface p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-text-primary mb-4">Similar Events</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {similarEvents.map((item) => {
                    const itemCfg = categoryConfig[item.category] || categoryConfig.Community;
                    const ItemIcon = itemCfg.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => router.push(`/dashboard/events/${item.id}`)}
                        className="rounded-[20px] bg-surface p-3 shadow-sm text-left transition-all hover:shadow-md"
                      >
                        <div className={`flex h-[150px] items-center justify-center overflow-hidden rounded-[12px] ${item.image_url ? "bg-surface-alt" : itemCfg.bg}`}>
                          {item.image_url ? (
                            <img src={item.image_url} alt={item.title} className="h-full w-full object-cover" />
                          ) : (
                            <ItemIcon size={36} strokeWidth={1.2} className={itemCfg.color} />
                          )}
                        </div>
                        <div className="mt-2">
                          <h3 className="text-sm font-semibold text-text-primary line-clamp-1">{item.title}</h3>
                          <p className="mt-0.5 text-xs text-text-muted">{formatDate(item.event_date)}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile: Content Below Image */}
      <div className="lg:hidden p-4">
        <div className="rounded-[24px] bg-surface p-5 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${cfg.badge}`}>
              {event.category}
            </span>
            {isPast ? (
              <span className="rounded-full border border-border-default px-3 py-1 text-xs font-medium text-text-muted">Past Event</span>
            ) : (
              <span className="rounded-full border border-border-default px-3 py-1 text-xs font-medium text-text-primary">{daysUntil(event.event_date)}</span>
            )}
            <span className="flex items-center gap-1 text-xs text-text-muted ml-auto">
              <Clock size={12} />
              {timeAgo(event.created_at)}
            </span>
          </div>

          <h1 className="mt-3 text-xl font-semibold text-text-primary">{event.title}</h1>

          <div className="mt-3 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <CalendarDays size={15} className="text-text-muted" />
              {formatDate(event.event_date)}
            </div>
            {event.event_time && (
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <Clock size={15} className="text-text-muted" />
                {formatTime(event.event_time)}
              </div>
            )}
            {event.location && (
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <MapPin size={15} className="text-text-muted" />
                {event.location}
              </div>
            )}
          </div>

          <hr className="my-4 border-border-light" />

          <div>
            <h2 className="text-base font-semibold text-text-primary">About this event</h2>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">{event.description}</p>
          </div>

          <hr className="my-4 border-border-light" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-accent to-[#4CAF50] text-base font-semibold text-text-primary">
                {event.organizer_name[0]?.toUpperCase() || "?"}
              </div>
              <div>
                <p className="text-base font-semibold text-text-primary">{event.organizer_name}</p>
                <p className="text-sm text-text-muted">Organizer</p>
              </div>
            </div>
            {myId === String(event.user_id) && (
              <ThreeDotMenu
                id={event.id}
                isOwner={true}
                shareUrl={`${window.location.origin}/dashboard/events/${event.id}`}
                onDelete={async (id) => {
                  const res = await fetch("/api/events", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id }),
                  });
                  if (res.ok) router.push("/dashboard/events");
                }}
                onEdit={() => {
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
                }}
              />
            )}
          </div>
          <div className="mt-4 flex gap-2">
            {!isPast && (
              <button className="flex flex-1 items-center justify-center gap-2 rounded-full bg-accent px-4 py-3 text-base font-semibold text-text-primary transition-colors">
                RSVP
              </button>
            )}
            <button className="flex h-[46px] w-[46px] flex-shrink-0 items-center justify-center rounded-full border border-border-default text-text-muted transition-colors hover:text-text-secondary">
              <Share2 size={18} />
            </button>
          </div>

          {similarEvents.length > 0 && (
            <>
              <hr className="my-4 border-border-light" />
              <div>
                <h2 className="text-base font-semibold text-text-primary mb-3">Similar Events</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {similarEvents.map((item) => {
                    const itemCfg = categoryConfig[item.category] || categoryConfig.Community;
                    const ItemIcon = itemCfg.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => router.push(`/dashboard/events/${item.id}`)}
                        className="rounded-[16px] bg-surface p-3 shadow-sm text-left transition-all hover:shadow-md"
                      >
                        <div className={`flex h-[120px] items-center justify-center overflow-hidden rounded-[10px] ${item.image_url ? "bg-surface-alt" : itemCfg.bg}`}>
                          {item.image_url ? (
                            <img src={item.image_url} alt={item.title} className="h-full w-full object-cover" />
                          ) : (
                            <ItemIcon size={32} strokeWidth={1.2} className={itemCfg.color} />
                          )}
                        </div>
                        <div className="mt-2">
                          <h3 className="text-sm font-semibold text-text-primary line-clamp-1">{item.title}</h3>
                          <p className="mt-0.5 text-xs text-text-muted">{formatDate(item.event_date)}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {lightbox && (
        <ImageLightbox src={lightbox.src} alt={lightbox.alt} onClose={() => setLightbox(null)} />
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
                  {["Education", "Technology", "Health & Wellness", "Community", "Sports", "Arts & Culture", "Business", "Social"].map((cat) => (
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
                onClick={async () => {
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
                    setEvent((prev) => prev ? { ...prev, ...updated } : prev);
                    setEditEvent(null);
                  } catch { setEditError("Something went wrong"); setEditSaving(false); }
                }}
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
    </div>
  );
}
