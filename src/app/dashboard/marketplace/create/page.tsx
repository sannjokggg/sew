"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Tag, ArrowLeftRight, Gift, UserPlus, ArrowLeft, ChevronDown, Loader2 } from "lucide-react";
import Link from "next/link";
import MultiImageUploader from "@/components/multi-image-uploader";

const postTypes = [
  { value: "Sell", label: "Sell", icon: Tag, gradient: "from-[#B8F25E] to-[#4CAF50]" },
  { value: "Exchange", label: "Exchange", icon: ArrowLeftRight, gradient: "from-[#60A5FA] to-[#3B82F6]" },
  { value: "Giveaway", label: "Giveaway", icon: Gift, gradient: "from-[#A78BFA] to-[#8B5CF6]" },
  { value: "Request", label: "Request", icon: UserPlus, gradient: "from-[#F472B6] to-[#EC4899]" },
];

const categories = [
  "Electronics", "Furniture", "Clothing", "Books", "Sports",
  "Home & Garden", "Vehicles", "Toys", "Other",
];

export default function CreatePostPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("Sell");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedType = postTypes.find((t) => t.value === type);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, type, price, category, images }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create post");
        setLoading(false);
        return;
      }

      router.push("/dashboard/marketplace");
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
          href="/dashboard/marketplace"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm transition-all hover:bg-gray-100 hover:shadow-md"
        >
          <ArrowLeft size={22} strokeWidth={2} />
        </Link>
        <div>
          <h1 className="text-4xl font-normal text-[#202124]">Create Listing</h1>
          <p className="text-lg text-[#6B6B6B]">Post something to the community</p>
        </div>
      </div>

      <div className="flex gap-6 items-stretch">
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
          <div className="rounded-[24px] bg-white p-6 shadow-sm flex-1 flex flex-col">
            {error && (
              <div className="mb-6 rounded-[16px] border border-red-200 bg-red-50 px-5 py-4 text-base text-red-600">
                {error}
              </div>
            )}

            <div className="mb-6">
              <label className="mb-1 block text-base font-semibold text-[#202124]">What are you posting?</label>
              <p className="text-sm text-[#9A9A9A]">Select the type of listing</p>
              <div className="mt-4 flex gap-3">
                {postTypes.map((t) => {
                  const Icon = t.icon;
                  const isSelected = type === t.value;
                  return (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setType(t.value)}
                      className={`flex items-center gap-3 rounded-full px-6 py-3.5 text-base font-medium transition-all duration-200 ${
                        isSelected
                          ? "bg-white text-[#202124] shadow-md ring-2 ring-[#B8F25E]"
                          : "bg-gray-50 text-[#6B6B6B] hover:bg-gray-100 hover:text-[#202124]"
                      }`}
                    >
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br ${t.gradient}`}>
                        <Icon size={16} strokeWidth={2.5} className="text-white" />
                      </div>
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mb-6 grid grid-cols-[1fr_140px_160px] gap-5">
              <div>
                <label className="mb-2 block text-base font-medium text-[#202124]">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-[14px] border border-gray-200 bg-gray-50 px-5 py-3.5 text-base outline-none transition-all placeholder:text-[#B0B0B0] focus:border-[#B8F25E] focus:bg-white focus:ring-2 focus:ring-[#B8F25E]/30"
                  placeholder="e.g. MacBook Pro 2021"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-base font-medium text-[#202124]">
                  {type === "Sell" ? "Price" : type === "Exchange" ? "Want in return" : "Type"}
                </label>
                {type === "Sell" ? (
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-base font-medium text-[#9A9A9A]">$</span>
                    <input
                      type="text"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full rounded-[14px] border border-gray-200 bg-gray-50 pl-10 pr-5 py-3.5 text-base outline-none transition-all placeholder:text-[#B0B0B0] focus:border-[#B8F25E] focus:bg-white focus:ring-2 focus:ring-[#B8F25E]/30"
                      placeholder="0.00"
                    />
                  </div>
                ) : type === "Exchange" ? (
                  <input
                    type="text"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full rounded-[14px] border border-gray-200 bg-gray-50 px-5 py-3.5 text-base outline-none transition-all placeholder:text-[#B0B0B0] focus:border-[#B8F25E] focus:bg-white focus:ring-2 focus:ring-[#B8F25E]/30"
                    placeholder="e.g. Samsung case"
                  />
                ) : (
                  <div className="flex items-center rounded-[14px] border border-gray-100 bg-gray-50 px-5 py-3.5 text-base text-[#9A9A9A]">
                    {type === "Giveaway" ? "Free" : "Looking for this"}
                  </div>
                )}
              </div>
              <div>
                <label className="mb-2 block text-base font-medium text-[#202124]">Category</label>
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full appearance-none rounded-[14px] border border-gray-200 bg-gray-50 px-5 py-3.5 pr-10 text-base outline-none transition-all focus:border-[#B8F25E] focus:bg-white focus:ring-2 focus:ring-[#B8F25E]/30"
                  >
                    <option value="">Select</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <ChevronDown size={18} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#9A9A9A]" />
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="mb-2 block text-base font-medium text-[#202124]">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full resize-none rounded-[14px] border border-gray-200 bg-gray-50 px-5 py-3.5 text-base outline-none transition-all placeholder:text-[#B0B0B0] focus:border-[#B8F25E] focus:bg-white focus:ring-2 focus:ring-[#B8F25E]/30"
                placeholder="Describe your item, condition, any details buyers should know..."
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-base font-medium text-[#202124]">Photos</label>
              <p className="mb-2 text-xs text-[#9A9A9A]">Up to 4 photos</p>
              <MultiImageUploader onUpload={setImages} currentImages={images} maxImages={4} />
            </div>

            <div className="flex items-center gap-4 mt-auto pt-4">
              <Link
                href="/dashboard/marketplace"
                className="rounded-full border border-gray-200 bg-white px-10 py-3.5 text-base font-medium text-[#6B6B6B] transition-all hover:bg-gray-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2.5 rounded-full bg-[#B8F25E] px-12 py-3.5 text-base font-semibold text-[#202124] transition-all hover:bg-[#a8e04e] disabled:opacity-50"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : null}
                {loading ? "Posting..." : "Post Listing"}
              </button>
            </div>
          </div>
        </form>

        <div className="w-[380px] flex-shrink-0">
          <div className="rounded-[24px] bg-white p-6 shadow-sm h-full flex flex-col">
            <span className="text-sm font-medium text-[#9A9A9A] mb-4">Live Preview</span>
            <div className={`flex-1 flex items-center justify-center overflow-hidden rounded-[16px] ${images.length > 0 ? "bg-gray-50" : `bg-gradient-to-br ${selectedType?.gradient || "from-gray-200 to-gray-300"}`}`}>
              {images.length > 0 ? (
                <img src={images[0]} alt="Preview" className="h-full w-full object-contain" />
              ) : (
                selectedType && <selectedType.icon size={72} strokeWidth={1.5} className="text-white" />
              )}
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between">
                <span className={`rounded-full px-3 py-1 text-[10px] font-semibold ${
                  type === "Sell" ? "bg-[#B8F25E] text-[#202124]" :
                  type === "Exchange" ? "bg-[#60A5FA] text-white" :
                  type === "Giveaway" ? "bg-[#A78BFA] text-white" :
                  "bg-[#F472B6] text-white"
                }`}>
                  {type}
                </span>
                <span className="text-[10px] text-[#9A9A9A]">Just now</span>
              </div>
              <h3 className="mt-3 text-base font-semibold text-[#202124]">
                {title || "Your title here"}
              </h3>
              <p className="mt-1 text-sm text-[#6B6B6B] line-clamp-2">
                {description || "Your description will appear here..."}
              </p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xl font-semibold text-[#202124]">
                  {type === "Sell" ? (price ? `$${price}` : "$0") :
                   type === "Giveaway" ? "Free" :
                   type === "Exchange" ? (price || "Swap") :
                   "Request"}
                </span>
                <span className="text-sm text-[#9A9A9A]">by you</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
