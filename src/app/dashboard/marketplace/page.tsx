"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Tag, ArrowLeftRight, Gift, UserPlus, Loader2, MessageSquare, MoreHorizontal, Trash2, Pencil, Flag, EyeOff, Share2 } from "lucide-react";
import ImageLightbox from "@/components/image-lightbox";
import LoginPrompt from "@/components/login-prompt";

interface Post {
  id: number;
  user_id: number;
  title: string;
  description: string;
  type: string;
  price: string | null;
  category: string | null;
  image_url: string | null;
  images: string[];
  user_name: string;
  created_at: string;
}

const typeConfig: Record<string, { gradient: string; badge: string; icon: typeof Tag }> = {
  Sell: { gradient: "from-gray-50 to-gray-100", badge: "border border-gray-300 text-[#6B6B6B]", icon: Tag },
  Exchange: { gradient: "from-gray-50 to-gray-100", badge: "border border-gray-300 text-[#6B6B6B]", icon: ArrowLeftRight },
  Giveaway: { gradient: "from-gray-50 to-gray-100", badge: "border border-gray-300 text-[#6B6B6B]", icon: Gift },
  Request: { gradient: "from-gray-50 to-gray-100", badge: "border border-gray-300 text-[#6B6B6B]", icon: UserPlus },
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function Marketplace() {
  const router = useRouter();
  const { data: session } = useSession();
  const myId = Number((session?.user as { id?: string })?.id || 0);
  const [posts, setPosts] = useState<Post[]>([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [loginPrompt, setLoginPrompt] = useState<{ isOpen: boolean; action: string }>({ isOpen: false, action: "" });
  const categories = ["All", "Sell", "Exchange", "Giveaway", "Request"];

  useEffect(() => {
    fetch("/api/posts")
      .then((res) => res.json())
      .then((data) => {
        setPosts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setPosts([]);
        setLoading(false);
      });
  }, []);

  const handleAction = (action: string) => {
    if (!session) {
      setLoginPrompt({ isOpen: true, action });
      return false;
    }
    return true;
  };

  const filtered = filter === "All" ? posts : posts.filter((p) => p.type === filter);

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenMenu(null);
    if (!confirm("Are you sure you want to delete this listing?")) return;
    setDeleting(id);
    try {
      const res = await fetch("/api/posts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) setPosts((prev) => prev.filter((p) => p.id !== id));
    } finally { setDeleting(null); }
  };

  return (
    <div className="flex flex-col gap-6 p-2" style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-5xl font-normal text-[#202124]">Marketplace</h1>
          <p className="text-lg text-[#6B6B6B]">Buy, sell, exchange, giveaway, or ask for what you need.</p>
        </div>
        <Link
          href="/dashboard/marketplace/create"
          className="rounded-full bg-[#B8F25E] px-6 py-3 text-base font-semibold text-[#202124] shadow-sm transition-colors "
        >
          + Post Listing
        </Link>
      </div>

      {/* Category Filters */}
      <div className="flex gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`rounded-full px-5 py-2.5 text-base font-medium transition-all duration-200 cursor-pointer ${
              filter === cat
                ? "bg-[#1D1B17] text-white shadow-sm"
                : "bg-white text-[#666666] hover:bg-gray-100 hover:text-[#222222]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Listings Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center rounded-[24px] bg-white py-16 shadow-sm">
          <Loader2 size={32} className="animate-spin text-[#9A9A9A]" />
          <p className="mt-3 text-sm text-[#9A9A9A]">Loading listings...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[24px] bg-white py-16 shadow-sm">
          <Tag size={48} strokeWidth={1} className="text-[#9A9A9A]" />
          <p className="mt-4 text-lg font-medium text-[#9A9A9A]">No listings yet</p>
          <p className="mt-1 text-base text-[#9A9A9A]">Be the first to post something!</p>
          <Link
            href="/dashboard/marketplace/create"
            className="mt-4 rounded-full bg-[#B8F25E] px-6 py-3 text-base font-semibold text-[#202124] shadow-sm transition-colors "
          >
            + Post Listing
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-5">
          {filtered.map((item) => {
            const cfg = typeConfig[item.type] || typeConfig.Sell;
            const Icon = cfg.icon;
            return (
              <Link
                key={item.id}
                href={`/dashboard/marketplace/${item.id}`}
                className="relative rounded-[24px] bg-white p-5 shadow-sm transition-all hover:shadow-md"
              >
                {myId === item.user_id && (
                  <div className="absolute right-4 top-4 z-10">
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpenMenu(openMenu === item.id ? null : item.id); }}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[#6B6B6B] shadow-sm transition-colors hover:bg-gray-100"
                    >
                      <MoreHorizontal size={16} />
                    </button>
                    {openMenu === item.id && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpenMenu(null); }} />
                        <div className="absolute right-0 top-full z-50 mt-1 w-44 rounded-[16px] border border-gray-100 bg-white py-2 shadow-lg">
                          <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpenMenu(null); router.push(`/dashboard/marketplace/${item.id}`); }}
                            className="flex w-full items-center gap-3 px-4 py-2.5 text-base text-[#202124] hover:bg-gray-50"
                          >
                            <EyeOff size={16} className="text-[#9A9A9A]" />
                            View
                          </button>
                          <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpenMenu(null); router.push(`/dashboard/marketplace/create?edit=${item.id}`); }}
                            className="flex w-full items-center gap-3 px-4 py-2.5 text-base text-[#202124] hover:bg-gray-50"
                          >
                            <Pencil size={16} className="text-[#9A9A9A]" />
                            Edit
                          </button>
                          <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpenMenu(null); }}
                            className="flex w-full items-center gap-3 px-4 py-2.5 text-base text-[#202124] hover:bg-gray-50"
                          >
                            <Share2 size={16} className="text-[#9A9A9A]" />
                            Share
                          </button>
                          <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpenMenu(null); }}
                            className="flex w-full items-center gap-3 px-4 py-2.5 text-base text-[#202124] hover:bg-gray-50"
                          >
                            <Flag size={16} className="text-[#9A9A9A]" />
                            Report
                          </button>
                          <div className="my-1 border-t border-gray-100" />
                          <button
                            onClick={(e) => handleDelete(e, item.id)}
                            disabled={deleting === item.id}
                            className="flex w-full items-center gap-3 px-4 py-2.5 text-base text-red-500 hover:bg-red-50 disabled:opacity-50"
                          >
                            {deleting === item.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
                <div className={`flex h-[240px] items-center justify-center overflow-hidden rounded-[16px] ${(item.images && item.images.length > 0) || item.image_url ? "bg-gray-50" : "border border-gray-200 bg-white"}`}>
                  {(item.images && item.images.length > 0) || item.image_url ? (
                    <img
                      src={(item.images && item.images[0]) || item.image_url || ""}
                      alt={item.title}
                      className="cursor-pointer transition-transform hover:scale-105"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setLightbox({ src: (item.images && item.images[0]) || item.image_url || "", alt: item.title });
                      }}
                    />
                  ) : (
                    <Icon size={80} strokeWidth={1.5} className="text-[#B0B0B0]" />
                  )}
                </div>
                <div className="mt-4">
                   <div className="flex items-center justify-between">
                    <span className={`rounded-full px-3 py-1 text-base font-semibold ${cfg.badge}`}>
                      {item.type}
                    </span>
                    <span className="text-base text-[#9A9A9A]">{timeAgo(item.created_at)}</span>
                  </div>
                  <h3 className="mt-3 text-lg font-semibold text-[#202124]">{item.title}</h3>
                  <p className="mt-1 text-base text-[#6B6B6B] line-clamp-2">{item.description}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-lg font-semibold text-[#202124]">
                      {item.type === "Sell" ? `$${item.price || "0"}` :
                       item.type === "Giveaway" ? "Free" :
                       item.type === "Exchange" ? (item.price || "Swap") :
                       "Request"}
                    </span>
                    <span className="text-xs text-[#9A9A9A]">by {item.user_name}</span>
                  </div>
                  <div className="mt-3 flex gap-2">
                    {item.type === "Request" ? (
                      myId === item.user_id ? (
                         <button
                          onClick={(e) => { e.stopPropagation(); router.push("/dashboard/messages"); }}
                          className="w-full rounded-full border border-gray-200 px-4 py-2.5 text-base font-medium text-[#6B6B6B] transition-colors hover:bg-gray-50"
                        >
                          <MessageSquare size={14} className="inline mr-1.5" />Inbox
                        </button>
                      ) : (
                        <button onClick={(e) => e.stopPropagation()} className="w-full rounded-full bg-[#B8F25E] px-4 py-2.5 text-base font-semibold text-[#202124] transition-colors ">
                          I Have This
                        </button>
                      )
                    ) : (
                      <>
                        <button onClick={(e) => e.stopPropagation()} className="flex-1 rounded-full bg-[#B8F25E] px-4 py-2.5 text-base font-semibold text-[#202124] transition-colors ">
                          {item.type === "Sell" ? "Buy" : item.type === "Exchange" ? "Swap" : "Claim"}
                        </button>
                        {myId === item.user_id ? (
                          <button
                            onClick={(e) => { e.stopPropagation(); router.push("/dashboard/messages"); }}
                            className="flex-1 rounded-full border border-gray-200 px-4 py-2.5 text-base font-medium text-[#6B6B6B] transition-colors hover:bg-gray-50"
                          >
                            <MessageSquare size={14} className="inline mr-1.5" />Inbox
                          </button>
                        ) : (
                          <button
                            onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/messages?userId=${item.user_id}`); }}
                            className="flex-1 rounded-full border border-gray-200 px-4 py-2.5 text-base font-medium text-[#6B6B6B] transition-colors hover:bg-gray-50"
                          >
                            Message
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
      {lightbox && (
        <ImageLightbox src={lightbox.src} alt={lightbox.alt} onClose={() => setLightbox(null)} />
      )}
    </div>
  );
}
