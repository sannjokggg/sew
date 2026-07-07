"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CalendarDays, Clock, MapPin, ChevronDown } from "lucide-react";
import MultiImageUploader from "@/components/multi-image-uploader";

const categories = [
  "Education",
  "Technology",
  "Health & Wellness",
  "Community",
  "Sports",
  "Arts & Culture",
  "Business",
  "Social",
];

const categoryColors: Record<string, string> = {
  Education: "bg-blue-100 text-blue-700",
  Technology: "bg-purple-100 text-purple-700",
  "Health & Wellness": "bg-red-100 text-red-700",
  Community: "bg-emerald-100 text-emerald-700",
  Sports: "bg-amber-100 text-amber-700",
  "Arts & Culture": "bg-pink-100 text-pink-700",
  Business: "bg-indigo-100 text-indigo-700",
  Social: "bg-orange-100 text-orange-700",
};

export default function CreateEventPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [location, setLocation] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          category,
          event_date: eventDate,
          event_time: eventTime || undefined,
          location: location || undefined,
          image_url: images.length > 0 ? images[0] : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create event");
        setLoading(false);
        return;
      }

      router.push("/dashboard/events");
      router.refresh();
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-2" style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}>
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/events"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm transition-all hover:bg-gray-100 hover:shadow-md"
        >
          <ArrowLeft size={20} strokeWidth={2} />
        </Link>
        <div>
          <h1 className="text-4xl font-normal text-[#202124]">Create Event</h1>
          <p className="text-base text-[#6B6B6B]">Share an event with your community</p>
        </div>
      </div>

      <div className="flex gap-6">
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-5">
          {error && (
            <div className="rounded-[20px] border border-red-200 bg-red-50 px-5 py-3.5 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Details */}
          <div className="rounded-[24px] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#202124]">Event Details</h2>
            <div className="mt-5 flex flex-col gap-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#202124]">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-[16px] border border-gray-200 bg-gray-50 px-5 py-3.5 text-sm outline-none transition-all placeholder:text-[#B0B0B0] focus:border-[#B8F25E] focus:bg-white focus:ring-2 focus:ring-[#B8F25E]/30"
                  placeholder="e.g. Community Yoga Workshop"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-[#202124]">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full rounded-[16px] border border-gray-200 bg-gray-50 px-5 py-3.5 text-sm outline-none transition-all placeholder:text-[#B0B0B0] focus:border-[#B8F25E] focus:bg-white focus:ring-2 focus:ring-[#B8F25E]/30 resize-none"
                  placeholder="Describe the event, what to expect, who should attend..."
                  required
                />
              </div>
            </div>
          </div>

          {/* Category */}
          <div className="rounded-[24px] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#202124]">Category</h2>
            <p className="mt-1 text-sm text-[#9A9A9A]">Choose a category for your event</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-200 ${
                    category === cat
                      ? "bg-[#1D1B17] text-white shadow-sm"
                      : "bg-white text-[#6B6B6B] border border-gray-200 hover:bg-gray-50 hover:text-[#202124]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Date & Time */}
          <div className="rounded-[24px] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#202124]">Date & Time</h2>
            <div className="mt-5 grid grid-cols-2 gap-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#202124]">
                  <CalendarDays size={14} className="mr-1.5 inline" />
                  Date
                </label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full rounded-[16px] border border-gray-200 bg-gray-50 px-5 py-3.5 text-sm outline-none transition-all focus:border-[#B8F25E] focus:bg-white focus:ring-2 focus:ring-[#B8F25E]/30"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-[#202124]">
                  <Clock size={14} className="mr-1.5 inline" />
                  Time (optional)
                </label>
                <input
                  type="time"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                  className="w-full rounded-[16px] border border-gray-200 bg-gray-50 px-5 py-3.5 text-sm outline-none transition-all focus:border-[#B8F25E] focus:bg-white focus:ring-2 focus:ring-[#B8F25E]/30"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="rounded-[24px] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#202124]">Location</h2>
            <div className="mt-5">
              <label className="mb-2 block text-sm font-medium text-[#202124]">
                <MapPin size={14} className="mr-1.5 inline" />
                Where is it happening?
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full rounded-[16px] border border-gray-200 bg-gray-50 px-5 py-3.5 text-sm outline-none transition-all placeholder:text-[#B0B0B0] focus:border-[#B8F25E] focus:bg-white focus:ring-2 focus:ring-[#B8F25E]/30"
                placeholder="e.g. Kathmandu Community Center"
              />
            </div>
          </div>

          {/* Photo */}
          <div className="rounded-[24px] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#202124]">Photo</h2>
            <p className="mt-1 text-sm text-[#9A9A9A]">Add a cover photo for your event</p>
            <div className="mt-5">
              <MultiImageUploader onUpload={setImages} currentImages={images} maxImages={1} />
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/events"
              className="rounded-full border border-gray-200 bg-white px-8 py-3.5 text-sm font-medium text-[#6B6B6B] shadow-sm transition-all hover:bg-gray-50 hover:shadow-md"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || !category}
              className="rounded-full bg-[#B8F25E] px-10 py-3.5 text-sm font-semibold text-[#202124] shadow-sm transition-all hover:bg-[#a8e04e] hover:shadow-md disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Event"}
            </button>
          </div>
        </form>

        {/* Preview */}
        <div className="w-[320px] flex flex-col gap-3">
          <span className="text-sm font-medium text-[#9A9A9A]">Live Preview</span>
          <div className="rounded-[24px] bg-white p-5 shadow-sm">
            <div className={`flex h-[180px] items-center justify-center rounded-[16px] ${
              category ? "bg-gray-50" : "bg-gradient-to-br from-gray-100 to-gray-200"
            }`}>
              {images.length > 0 ? (
                <img src={images[0]} alt="Preview" className="h-full w-full rounded-[16px] object-contain" />
              ) : category ? (
                <CalendarDays size={56} strokeWidth={1.2} className="text-[#9A9A9A]" />
              ) : (
                <CalendarDays size={56} strokeWidth={1.2} className="text-[#D1D5DB]" />
              )}
            </div>
            <div className="mt-4">
              {category && (
                <span className={`rounded-full px-3 py-1 text-[10px] font-semibold ${categoryColors[category] || "bg-gray-100 text-gray-700"}`}>
                  {category}
                </span>
              )}
              <h3 className="mt-2 text-base font-semibold text-[#202124]">
                {title || "Event title"}
              </h3>
              <p className="mt-1 text-xs text-[#6B6B6B] line-clamp-2">
                {description || "Event description..."}
              </p>
              <div className="mt-3 flex flex-col gap-1">
                {eventDate && (
                  <span className="flex items-center gap-1.5 text-[11px] text-[#9A9A9A]">
                    <CalendarDays size={11} />
                    {new Date(eventDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    {eventTime && ` at ${eventTime}`}
                  </span>
                )}
                {location && (
                  <span className="flex items-center gap-1.5 text-[11px] text-[#9A9A9A]">
                    <MapPin size={11} />
                    {location}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
