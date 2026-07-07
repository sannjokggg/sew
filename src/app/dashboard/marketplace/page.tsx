"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Tag, ArrowLeftRight, Gift, UserPlus, Loader2, MessageSquare } from "lucide-react";

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
  Sell: { gradient: "from-[#B8F25E] to-[#4CAF50]", badge: "bg-[#B8F25E] text-[#202124]", icon: Tag },
  Exchange: { gradient: "from-[#60A5FA] to-[#3B82F6]", badge: "bg-[#60A5FA] text-white", icon: ArrowLeftRight },
  Giveaway: { gradient: "from-[#A78BFA] to-[#8B5CF6]", badge: "bg-[#A78BFA] text-white", icon: Gift },
  Request: { gradient: "from-[#F472B6] to-[#EC4899]", badge: "bg-[#F472B6] text-white", icon: UserPlus },
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

  const filtered = filter === "All" ? posts : posts.filter((p) => p.type === filter);

  const stats = {
    sell: posts.filter((p) => p.type === "Sell").length,
    exchange: posts.filter((p) => p.type === "Exchange").length,
    giveaway: posts.filter((p) => p.type === "Giveaway").length,
    request: posts.filter((p) => p.type === "Request").length,
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
          className="rounded-full bg-[#B8F25E] px-6 py-3 text-sm font-semibold text-[#202124] shadow-sm transition-colors hover:bg-[#a8e04e]"
        >
          + Post Listing
        </Link>
      </div>

      {/* Stats Row */}
      <div className="flex gap-4">
        <div className="flex-1 rounded-[24px] bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[#9A9A9A]">For Sale</span>
            <Tag size={24} strokeWidth={1.5} />
          </div>
          <p className="mt-1 text-[28px] font-semibold text-[#202124]">{stats.sell}</p>
          <div className="mt-1 flex items-center gap-1">
            <span className="text-[11px] font-semibold text-green-500">Active</span>
            <span className="text-[11px] text-[#9A9A9A]">listings</span>
          </div>
        </div>
        <div className="flex-1 rounded-[24px] bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[#9A9A9A]">Exchanges</span>
            <ArrowLeftRight size={24} strokeWidth={1.5} />
          </div>
          <p className="mt-1 text-[28px] font-semibold text-[#202124]">{stats.exchange}</p>
          <div className="mt-1 flex items-center gap-1">
            <span className="text-[11px] font-semibold text-green-500">Open</span>
            <span className="text-[11px] text-[#9A9A9A]">swaps</span>
          </div>
        </div>
        <div className="flex-1 rounded-[24px] bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[#9A9A9A]">Giveaways</span>
            <Gift size={24} strokeWidth={1.5} />
          </div>
          <p className="mt-1 text-[28px] font-semibold text-[#202124]">{stats.giveaway}</p>
          <div className="mt-1 flex items-center gap-1">
            <span className="text-[11px] font-semibold text-green-500">Free</span>
            <span className="text-[11px] text-[#9A9A9A]">items</span>
          </div>
        </div>
        <div className="flex-1 rounded-[24px] bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[#9A9A9A]">Requests</span>
            <UserPlus size={24} strokeWidth={1.5} />
          </div>
          <p className="mt-1 text-[28px] font-semibold text-[#202124]">{stats.request}</p>
          <div className="mt-1 flex items-center gap-1">
            <span className="text-[11px] text-[#9A9A9A]">Looking for</span>
          </div>
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex gap-2">
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
          <p className="mt-1 text-sm text-[#9A9A9A]">Be the first to post something!</p>
          <Link
            href="/dashboard/marketplace/create"
            className="mt-4 rounded-full bg-[#B8F25E] px-6 py-3 text-sm font-semibold text-[#202124] shadow-sm transition-colors hover:bg-[#a8e04e]"
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
                className="rounded-[24px] bg-white p-5 shadow-sm transition-all hover:shadow-md"
              >
                <div className={`relative flex h-[200px] items-center justify-center overflow-hidden rounded-[16px] ${(item.images && item.images.length > 0) || item.image_url ? "bg-white" : `bg-gradient-to-br ${cfg.gradient}`}`}>
                  {(item.images && item.images.length > 0) || item.image_url ? (
                    <>
                      <img
                        src={(item.images && item.images[0]) || item.image_url || ""}
                        alt=""
                        className="absolute inset-0 h-full w-full scale-110 object-cover blur-sm opacity-30"
                      />
                      <img
                        src={(item.images && item.images[0]) || item.image_url || ""}
                        alt={item.title}
                        className="relative h-full w-full rounded-[16px] object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                          (e.target as HTMLImageElement).parentElement!.querySelector(".fallback-icon")?.classList.remove("hidden");
                        }}
                      />
                    </>
                  ) : null}
                  <Icon size={80} strokeWidth={1.5} className={`text-white ${item.images?.length || item.image_url ? "hidden fallback-icon" : ""}`} />
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between">
                    <span className={`rounded-full px-3 py-1 text-[10px] font-semibold ${cfg.badge}`}>
                      {item.type}
                    </span>
                    <span className="text-[10px] text-[#9A9A9A]">{timeAgo(item.created_at)}</span>
                  </div>
                  <h3 className="mt-3 text-base font-semibold text-[#202124]">{item.title}</h3>
                  <p className="mt-1 text-xs text-[#6B6B6B] line-clamp-2">{item.description}</p>
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
                          className="w-full rounded-full border border-gray-200 px-4 py-2.5 text-sm font-medium text-[#6B6B6B] transition-colors hover:bg-gray-50"
                        >
                          <MessageSquare size={14} className="inline mr-1.5" />Inbox
                        </button>
                      ) : (
                        <button onClick={(e) => e.stopPropagation()} className="w-full rounded-full bg-[#B8F25E] px-4 py-2.5 text-sm font-semibold text-[#202124] transition-colors hover:bg-[#a8e04e]">
                          I Have This
                        </button>
                      )
                    ) : (
                      <>
                        <button onClick={(e) => e.stopPropagation()} className="flex-1 rounded-full bg-[#B8F25E] px-4 py-2.5 text-sm font-semibold text-[#202124] transition-colors hover:bg-[#a8e04e]">
                          {item.type === "Sell" ? "Buy" : item.type === "Exchange" ? "Swap" : "Claim"}
                        </button>
                        {myId === item.user_id ? (
                          <button
                            onClick={(e) => { e.stopPropagation(); router.push("/dashboard/messages"); }}
                            className="flex-1 rounded-full border border-gray-200 px-4 py-2.5 text-sm font-medium text-[#6B6B6B] transition-colors hover:bg-gray-50"
                          >
                            <MessageSquare size={14} className="inline mr-1.5" />Inbox
                          </button>
                        ) : (
                          <button
                            onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/messages?userId=${item.user_id}`); }}
                            className="flex-1 rounded-full border border-gray-200 px-4 py-2.5 text-sm font-medium text-[#6B6B6B] transition-colors hover:bg-gray-50"
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
    </div>
  );
}
