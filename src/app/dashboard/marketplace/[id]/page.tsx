"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ArrowLeft, Tag, ArrowLeftRight, Gift, UserPlus, Loader2, MessageSquare,
  Send, Clock, X, Check, Package, ChevronLeft, ChevronRight,
} from "lucide-react";
import ImageLightbox from "@/components/image-lightbox";
import ThreeDotMenu from "@/components/three-dot-menu";
import MultiImageUploader from "@/components/multi-image-uploader";

interface Comment {
  id: number;
  post_id: number;
  user_id: number;
  content: string;
  user_name: string;
  created_at: string;
}

interface Offer {
  id: number;
  post_id: number;
  user_id: number;
  message: string;
  offer_item: string;
  offer_images: string[];
  status: string;
  user_name: string;
  user_email: string;
  created_at: string;
}

interface PostDetail {
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
  user_email: string;
  created_at: string;
  comments: Comment[];
}

interface SimilarPost {
  id: number;
  title: string;
  type: string;
  price: string | null;
  category: string | null;
  image_url: string | null;
  images: string[];
  user_name: string;
}

const typeConfig: Record<string, { badge: string; icon: typeof Tag }> = {
  Sell: { badge: "border border-gray-300 text-text-secondary", icon: Tag },
  Exchange: { badge: "border border-gray-300 text-text-secondary", icon: ArrowLeftRight },
  Giveaway: { badge: "border border-gray-300 text-text-secondary", icon: Gift },
  Request: { badge: "border border-gray-300 text-text-secondary", icon: UserPlus },
};

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

export default function PostDetail() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const myId = Number((session?.user as { id?: string } | undefined)?.id || 0);
  const postId = params.id as string;

  const [post, setPost] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);

  const [deleting, setDeleting] = useState(false);
  const [editPost, setEditPost] = useState<PostDetail | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editType, setEditType] = useState("Sell");
  const [editPrice, setEditPrice] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editImages, setEditImages] = useState<string[]>([]);
  const [editPreviewIdx, setEditPreviewIdx] = useState(0);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");

  const [similarPosts, setSimilarPosts] = useState<SimilarPost[]>([]);

  const [offers, setOffers] = useState<Offer[]>([]);
  const [offerContent, setOfferContent] = useState("");
  const [submittingOffer, setSubmittingOffer] = useState(false);

  const fetchPost = async () => {
    try {
      const res = await fetch(`/api/posts/${postId}`);
      const data = await res.json();
      if (data.error) { router.push("/dashboard/marketplace"); return; }
      setPost(data);

      const allRes = await fetch("/api/posts");
      const allData = await allRes.json();
      if (Array.isArray(allData)) {
        const sameCat = allData.filter((p: SimilarPost) => p.id !== Number(postId) && p.category === data.category);
        const others = allData.filter((p: SimilarPost) => p.id !== Number(postId) && p.category !== data.category);
        setSimilarPosts([...sameCat, ...others].slice(0, 4));
      }

      const offersRes = await fetch(`/api/offers?post_id=${postId}`);
      const offersData = await offersRes.json();
      if (Array.isArray(offersData)) setOffers(offersData);
    } catch { router.push("/dashboard/marketplace"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPost(); }, [postId]);

  const handleOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerContent.trim()) return;
    setSubmittingOffer(true);
    try {
      const res = await fetch("/api/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          post_id: Number(postId),
          offer_item: offerContent,
          message: "",
          offer_images: [],
        }),
      });
      if (res.ok) {
        setOfferContent(""); fetchPost();
      }
    } finally { setSubmittingOffer(false); }
  };

  const handleOfferStatus = async (offerId: number, status: string) => {
    try {
      await fetch("/api/offers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: offerId, status }),
      });
      fetchPost();
    } catch {}
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this listing?")) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/posts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: Number(postId) }),
      });
      if (res.ok) router.push("/dashboard/marketplace");
    } finally { setDeleting(false); }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 p-2" style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}>
        <div className="flex items-center justify-center py-32">
          <Loader2 size={32} className="animate-spin text-text-muted" />
        </div>
      </div>
    );
  }

  if (!post) return null;

  const cfg = typeConfig[post.type] || typeConfig.Sell;
  const Icon = cfg.icon;
  const allImages = post.images?.length > 0 ? post.images : post.image_url ? [post.image_url] : [];

  return (
    <div className="flex flex-col gap-0" style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}>
      {/* Mobile: Full-width Image with Back + Price Overlay */}
      <div className="relative w-full lg:hidden">
        <div className="relative h-[380px] w-full bg-surface-alt">
          {allImages.length > 0 ? (
            <>
              <img
                src={allImages[selectedImage]}
                alt={post.title}
                className="h-full w-full object-cover"
                onClick={() => setLightbox({ src: allImages[selectedImage], alt: post.title })}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/20" />
            </>
          ) : (
            <div className="flex h-full items-center justify-center">
              <Icon size={80} strokeWidth={1.2} className="text-[#B0B0B0]" />
            </div>
          )}

          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="absolute left-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-surface/80 backdrop-blur-sm text-text-primary shadow-sm"
          >
            <ArrowLeft size={20} />
          </button>

          {/* Price Badge */}
          {post.type === "Sell" && post.price && (
            <div className="absolute bottom-4 left-4 z-10 rounded-full bg-surface px-4 py-2 shadow-sm">
              <span className="text-lg font-bold text-text-primary">${post.price}</span>
            </div>
          )}
          {post.type === "Giveaway" && (
            <div className="absolute bottom-4 left-4 z-10 rounded-full bg-accent px-4 py-2 shadow-sm">
              <span className="text-lg font-bold text-text-primary">Free</span>
            </div>
          )}

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
                    alt={post.title}
                    className="h-full w-full cursor-pointer object-cover transition-transform hover:scale-105"
                    onClick={() => setLightbox({ src: allImages[selectedImage], alt: post.title })}
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
                            className={`h-2 rounded-full transition-all ${selectedImage === i ? "w-6 bg-[#202124]" : "w-2 bg-gray-300"}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <Icon size={80} strokeWidth={1.2} className="text-[#B0B0B0]" />
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
                      selectedImage === i ? "border-[#202124] opacity-100" : "border-transparent opacity-50 hover:opacity-100"
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
              <div className="flex items-start justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-3.5 py-1 text-sm font-semibold ${cfg.badge}`}>
                    {post.type}
                  </span>
                  {post.category && (
                    <span className="rounded-full border border-border-default px-3.5 py-1 text-sm font-medium text-text-secondary">
                      {post.category}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-sm text-text-muted">
                    <Clock size={13} />
                    {timeAgo(post.created_at)}
                  </span>
                </div>
                {myId === post.user_id && (
                  <ThreeDotMenu
                    id={post.id}
                    isOwner={true}
                    shareUrl={`${window.location.origin}/dashboard/marketplace/${post.id}`}
                    onDelete={async (id) => {
                      const res = await fetch("/api/posts", {
                        method: "DELETE",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id }),
                      });
                      if (res.ok) router.push("/dashboard/marketplace");
                    }}
                    onEdit={() => {
                      setEditPost(post);
                      setEditTitle(post.title);
                      setEditDesc(post.description);
                      setEditType(post.type);
                      setEditPrice(post.price || "");
                      setEditCategory(post.category || "");
                      setEditImages(post.images || []);
                      setEditPreviewIdx(0);
                      setEditError("");
                      setEditSaving(false);
                    }}
                  />
                )}
              </div>
              <h1 className="mt-4 text-2xl font-semibold text-text-primary">{post.title}</h1>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">{post.description}</p>
              <div className="mt-4">
                {post.type === "Sell" && post.price && (
                  <p className="text-3xl font-bold text-text-primary">${post.price}</p>
                )}
                {post.type === "Exchange" && post.price && (
                  <p className="text-xl font-semibold text-text-primary">{post.price}</p>
                )}
                {post.type === "Giveaway" && (
                  <p className="text-2xl font-bold text-accent">Free</p>
                )}
                {post.type === "Request" && (
                  <p className="text-xl font-semibold text-text-primary">Looking for this</p>
                )}
              </div>
            </div>

            <div className="mt-5 rounded-[24px] bg-surface p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-text-primary">
                Offers
                <span className="ml-2 text-sm font-normal text-text-muted">({offers.length})</span>
              </h2>
              {myId !== post.user_id && (
                <form onSubmit={handleOffer} className="mt-4 flex gap-2">
                  <input
                    value={offerContent}
                    onChange={(e) => setOfferContent(e.target.value)}
                    placeholder="What are you offering?"
                    className="flex-1 rounded-full border border-border-default bg-surface-alt px-4 py-2.5 text-sm text-text-primary outline-none placeholder:text-[#B0B0B0] focus:border-gray-300 focus:bg-surface focus:ring-1 focus:ring-gray-100"
                  />
                  <button
                    type="submit"
                    disabled={!offerContent.trim() || submittingOffer}
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-accent text-text-primary disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submittingOffer ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} strokeWidth={2} />}
                  </button>
                </form>
              )}
              <div className="mt-4 flex flex-col gap-3">
                {offers.map((offer) => (
                  <div key={offer.id} className="rounded-[14px] border border-border-light bg-surface-alt p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#B8F25E] to-[#4CAF50] text-[10px] font-semibold text-text-primary">
                          {offer.user_name[0]?.toUpperCase() || "?"}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-text-primary">{offer.user_name}</p>
                          <p className="text-[11px] text-text-muted">{timeAgo(offer.created_at)}</p>
                        </div>
                      </div>
                      <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                        offer.status === "accepted" ? "bg-green-50 text-green-600" :
                        offer.status === "declined" ? "bg-red-50 text-red-500" :
                        "bg-border-light text-text-muted"
                      }`}>
                        {offer.status}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-text-secondary">{offer.offer_item}</p>
                    {myId === post.user_id && (
                      <div className="mt-2.5 flex gap-2 flex-wrap">
                        {offer.status === "pending" && (
                          <>
                            <button
                              onClick={() => { handleOfferStatus(offer.id, "accepted"); router.push(`/dashboard/messages?userId=${offer.user_id}`); }}
                              className="flex items-center gap-1 rounded-full bg-accent border border-[#B8F25E] px-3.5 py-1.5 text-sm font-medium text-text-primary hover:bg-accent-hover transition-colors"
                            >
                              <Check size={13} /> Accept
                            </button>
                            <button
                              onClick={() => handleOfferStatus(offer.id, "declined")}
                              className="flex items-center gap-1 rounded-full bg-border-light border border-border-default px-3.5 py-1.5 text-sm font-medium text-text-secondary hover:bg-gray-200 transition-colors"
                            >
                              <X size={13} /> Decline
                            </button>
                          </>
                        )}
                        {offer.status === "accepted" && (
                          <button
                            onClick={() => router.push(`/dashboard/messages?userId=${offer.user_id}`)}
                            className="flex items-center gap-1 rounded-full bg-accent border border-[#B8F25E] px-3.5 py-1.5 text-sm font-medium text-text-primary hover:bg-accent-hover transition-colors"
                          >
                            <MessageSquare size={13} /> Message
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                {offers.length === 0 && (
                  <div className="rounded-[14px] border border-border-light bg-surface-alt py-8 text-center">
                    <Package size={28} strokeWidth={1.5} className="mx-auto text-[#D1D5DB]" />
                    <p className="mt-2 text-sm text-text-muted">
                      No offers yet{myId !== post.user_id ? ". Be the first to make an offer!" : ""}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {similarPosts.length > 0 && (
              <div className="mt-5 rounded-[24px] bg-surface p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-text-primary mb-4">Similar Items</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {similarPosts.map((item) => {
                    const itemCfg = typeConfig[item.type] || typeConfig.Sell;
                    const ItemIcon = itemCfg.icon;
                    const itemImages = item.images?.length > 0 ? item.images : item.image_url ? [item.image_url] : [];
                    return (
                      <button
                        key={item.id}
                        onClick={() => router.push(`/dashboard/marketplace/${item.id}`)}
                        className="rounded-[20px] bg-surface p-3 shadow-sm text-left transition-all hover:shadow-md"
                      >
                        <div className="flex h-[150px] items-center justify-center overflow-hidden rounded-[12px] bg-surface-alt">
                          {itemImages.length > 0 ? (
                            <img src={itemImages[0]} alt={item.title} className="h-full w-full object-cover" />
                          ) : (
                            <ItemIcon size={36} strokeWidth={1.2} className="text-[#B0B0B0]" />
                          )}
                        </div>
                        <div className="mt-2">
                          <h3 className="text-sm font-semibold text-text-primary line-clamp-1">{item.title}</h3>
                          <p className="mt-0.5 text-sm font-semibold text-text-primary">
                            {item.type === "Sell" ? `$${item.price || "0"}` :
                             item.type === "Giveaway" ? "Free" :
                             item.type === "Exchange" ? (item.price || "Swap") : "Request"}
                          </p>
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
          <div className="flex items-start justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${cfg.badge}`}>
                {post.type}
              </span>
              {post.category && (
                <span className="rounded-full border border-border-default px-3 py-1 text-xs font-medium text-text-secondary">
                  {post.category}
                </span>
              )}
              <span className="flex items-center gap-1 text-xs text-text-muted">
                <Clock size={12} />
                {timeAgo(post.created_at)}
              </span>
            </div>
            {myId === post.user_id && (
              <ThreeDotMenu
                id={post.id}
                isOwner={true}
                shareUrl={`${window.location.origin}/dashboard/marketplace/${post.id}`}
                onDelete={async (id) => {
                  const res = await fetch("/api/posts", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id }),
                  });
                  if (res.ok) router.push("/dashboard/marketplace");
                }}
                onEdit={() => {
                  setEditPost(post);
                  setEditTitle(post.title);
                  setEditDesc(post.description);
                  setEditType(post.type);
                  setEditPrice(post.price || "");
                  setEditCategory(post.category || "");
                  setEditImages(post.images || []);
                  setEditPreviewIdx(0);
                  setEditError("");
                  setEditSaving(false);
                }}
              />
            )}
          </div>

          <h1 className="mt-3 text-xl font-semibold text-text-primary">{post.title}</h1>
          <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">{post.description}</p>

          <div className="mt-3">
            {post.type === "Sell" && post.price && (
              <p className="text-2xl font-bold text-text-primary">${post.price}</p>
            )}
            {post.type === "Exchange" && post.price && (
              <p className="text-lg font-semibold text-text-primary">{post.price}</p>
            )}
            {post.type === "Giveaway" && (
              <p className="text-xl font-bold text-accent">Free</p>
            )}
            {post.type === "Request" && (
              <p className="text-lg font-semibold text-text-primary">Looking for this</p>
            )}
          </div>

          <hr className="my-4 border-border-light" />

          {/* Offers */}
          <div>
            <h2 className="text-base font-semibold text-text-primary">
              Offers
              <span className="ml-2 text-xs font-normal text-text-muted">({offers.length})</span>
            </h2>

            {myId !== post.user_id && (
              <form onSubmit={handleOffer} className="mt-3 flex gap-2">
                <input
                  value={offerContent}
                  onChange={(e) => setOfferContent(e.target.value)}
                  placeholder="What are you offering?"
                  className="flex-1 rounded-full border border-border-default bg-surface-alt px-3 py-2 text-sm text-text-primary outline-none placeholder:text-[#B0B0B0] focus:border-gray-300 focus:bg-surface focus:ring-1 focus:ring-gray-100"
                />
                <button
                  type="submit"
                  disabled={!offerContent.trim() || submittingOffer}
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-accent text-text-primary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submittingOffer ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} strokeWidth={2} />}
                </button>
              </form>
            )}

            <div className="mt-3 flex flex-col gap-2.5">
              {offers.map((offer) => (
                <div key={offer.id} className="rounded-[12px] border border-border-light bg-surface-alt p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#B8F25E] to-[#4CAF50] text-[9px] font-semibold text-text-primary">
                        {offer.user_name[0]?.toUpperCase() || "?"}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-text-primary">{offer.user_name}</p>
                        <p className="text-[10px] text-text-muted">{timeAgo(offer.created_at)}</p>
                      </div>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      offer.status === "accepted" ? "bg-green-50 text-green-600" :
                      offer.status === "declined" ? "bg-red-50 text-red-500" :
                      "bg-border-light text-text-muted"
                    }`}>
                      {offer.status}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">{offer.offer_item}</p>
                  {myId === post.user_id && (
                    <div className="mt-2 flex gap-2 flex-wrap">
                      {offer.status === "pending" && (
                        <>
                          <button
                            onClick={() => { handleOfferStatus(offer.id, "accepted"); router.push(`/dashboard/messages?userId=${offer.user_id}`); }}
                            className="flex items-center gap-1 rounded-full bg-accent border border-[#B8F25E] px-3 py-1.5 text-xs font-medium text-text-primary hover:bg-accent-hover transition-colors"
                          >
                            <Check size={12} /> Accept
                          </button>
                          <button
                            onClick={() => handleOfferStatus(offer.id, "declined")}
                            className="flex items-center gap-1 rounded-full bg-border-light border border-border-default px-3 py-1.5 text-xs font-medium text-text-secondary hover:bg-gray-200 transition-colors"
                          >
                            <X size={12} /> Decline
                          </button>
                        </>
                      )}
                      {offer.status === "accepted" && (
                        <button
                          onClick={() => router.push(`/dashboard/messages?userId=${offer.user_id}`)}
                          className="flex items-center gap-1 rounded-full bg-accent border border-[#B8F25E] px-3 py-1.5 text-xs font-medium text-text-primary hover:bg-accent-hover transition-colors"
                        >
                          <MessageSquare size={12} /> Message
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {offers.length === 0 && (
                <div className="rounded-[12px] border border-border-light bg-surface-alt py-6 text-center">
                  <Package size={24} strokeWidth={1.5} className="mx-auto text-[#D1D5DB]" />
                  <p className="mt-1.5 text-xs text-text-muted">
                    No offers yet{myId !== post.user_id ? ". Be the first to make an offer!" : ""}
                  </p>
                </div>
              )}
            </div>
          </div>

          {similarPosts.length > 0 && (
            <>
              <hr className="my-4 border-border-light" />
              <div>
                <h2 className="text-base font-semibold text-text-primary mb-3">Similar Items</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {similarPosts.map((item) => {
                    const itemCfg = typeConfig[item.type] || typeConfig.Sell;
                    const ItemIcon = itemCfg.icon;
                    const itemImages = item.images?.length > 0 ? item.images : item.image_url ? [item.image_url] : [];
                    return (
                      <button
                        key={item.id}
                        onClick={() => router.push(`/dashboard/marketplace/${item.id}`)}
                        className="rounded-[16px] bg-surface p-3 shadow-sm text-left transition-all hover:shadow-md"
                      >
                        <div className="flex h-[120px] items-center justify-center overflow-hidden rounded-[10px] bg-surface-alt">
                          {itemImages.length > 0 ? (
                            <img src={itemImages[0]} alt={item.title} className="h-full w-full object-cover" />
                          ) : (
                            <ItemIcon size={32} strokeWidth={1.2} className="text-[#B0B0B0]" />
                          )}
                        </div>
                        <div className="mt-2">
                          <h3 className="text-sm font-semibold text-text-primary line-clamp-1">{item.title}</h3>
                          <p className="mt-0.5 text-sm font-semibold text-text-primary">
                            {item.type === "Sell" ? `$${item.price || "0"}` :
                             item.type === "Giveaway" ? "Free" :
                             item.type === "Exchange" ? (item.price || "Swap") : "Request"}
                          </p>
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
      {editPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setEditPost(null)}>
          <div className="relative w-full max-w-3xl rounded-[24px] bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setEditPost(null)}
              className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 transition-colors hover:bg-gray-200"
            >
              <X size={18} />
            </button>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Edit Listing</h2>
            {editError && (
              <div className="mb-4 rounded-[16px] border border-red-200 bg-red-50 px-5 py-3 text-sm text-red-600">{editError}</div>
            )}
            <div className="flex gap-6">
              <div className="flex-1 space-y-5">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-800">Type</label>
                  <div className="flex gap-2">
                    {[
                      { value: "Sell", label: "Sell", icon: Tag },
                      { value: "Exchange", label: "Exchange", icon: ArrowLeftRight },
                      { value: "Giveaway", label: "Giveaway", icon: Gift },
                      { value: "Request", label: "Request", icon: UserPlus },
                    ].map((t) => {
                      const Icon = t.icon;
                      const isSelected = editType === t.value;
                      return (
                        <button
                          key={t.value}
                          type="button"
                          onClick={() => setEditType(t.value)}
                          className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                            isSelected ? "bg-gray-900 text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          <Icon size={14} /> {t.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="grid grid-cols-[1fr_1fr] gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-800">Title</label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full rounded-[14px] border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-gray-300 focus:bg-white focus:ring-2 focus:ring-gray-100"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-800">
                      {editType === "Sell" ? "Price" : editType === "Exchange" ? "Want in return" : "Type"}
                    </label>
                    {editType === "Sell" ? (
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">$</span>
                        <input
                          type="text"
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                          className="w-full rounded-[14px] border border-gray-200 bg-gray-50 pl-8 pr-4 py-3 text-sm outline-none focus:border-gray-300 focus:bg-white focus:ring-2 focus:ring-gray-100"
                        />
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                        className="w-full rounded-[14px] border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-gray-300 focus:bg-white focus:ring-2 focus:ring-gray-100"
                        placeholder={editType === "Giveaway" ? "Free" : "e.g. Samsung case"}
                        disabled={editType === "Giveaway"}
                      />
                    )}
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-800">Category</label>
                  <div className="relative">
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      className="w-full appearance-none rounded-[14px] border border-gray-200 bg-gray-50 px-4 py-3 pr-10 text-sm outline-none focus:border-gray-300 focus:bg-white focus:ring-2 focus:ring-gray-100"
                    >
                      <option value="">Select</option>
                      {["Electronics", "Furniture", "Clothing", "Books", "Sports", "Home & Garden", "Vehicles", "Toys", "Other"].map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-800">Description</label>
                  <textarea
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    rows={3}
                    className="w-full resize-none rounded-[14px] border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-gray-300 focus:bg-white focus:ring-2 focus:ring-gray-100"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-800">Photos</label>
                  <MultiImageUploader onUpload={setEditImages} currentImages={editImages} maxImages={4} />
                </div>
              </div>
              <div className="w-[260px] flex-shrink-0">
                <span className="text-xs font-medium text-gray-400">Preview</span>
                <div className="mt-2 rounded-[16px] bg-gray-50 p-4">
                  <div className={`flex h-[180px] items-center justify-center overflow-hidden rounded-[12px] ${editImages.length > 0 ? "bg-gray-100" : "border border-gray-200 bg-white"}`}>
                    {editImages.length > 0 ? (
                      <img src={editImages[Math.min(editPreviewIdx, editImages.length - 1)]} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <Tag size={48} strokeWidth={1.5} className="text-gray-300" />
                    )}
                  </div>
                  {editImages.length > 1 && (
                    <div className="mt-2 flex items-center justify-center gap-2">
                      <button
                        onClick={() => setEditPreviewIdx((editPreviewIdx - 1 + editImages.length) % editImages.length)}
                        className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300"
                      >
                        <ChevronLeft size={14} />
                      </button>
                      <span className="text-[10px] text-gray-500">{editPreviewIdx + 1}/{editImages.length}</span>
                      <button
                        onClick={() => setEditPreviewIdx((editPreviewIdx + 1) % editImages.length)}
                        className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300"
                      >
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  )}
                  <div className="mt-3">
                    <span className="rounded-full border border-gray-300 px-2 py-0.5 text-[10px] font-semibold text-gray-500">{editType}</span>
                    <h4 className="mt-1 text-sm font-semibold text-gray-800 line-clamp-1">{editTitle || "Title"}</h4>
                    <p className="text-[11px] text-gray-500 line-clamp-1">{editDesc || "Description..."}</p>
                    <p className="mt-1 text-sm font-semibold text-gray-800">
                      {editType === "Sell" ? `$${editPrice || "0"}` : editType === "Giveaway" ? "Free" : editType === "Exchange" ? (editPrice || "Swap") : "Request"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
              <button
                onClick={() => setEditPost(null)}
                className="rounded-full border border-gray-200 bg-white px-8 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!editPost) return;
                  setEditError("");
                  setEditSaving(true);
                  try {
                    const res = await fetch(`/api/posts/${editPost.id}`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        title: editTitle,
                        description: editDesc,
                        type: editType,
                        price: editPrice,
                        category: editCategory,
                        images: editImages,
                      }),
                    });
                    if (!res.ok) {
                      const data = await res.json();
                      setEditError(data.error || "Failed to update");
                      setEditSaving(false);
                      return;
                    }
                    const updated = await res.json();
                    setPost((prev) => prev ? { ...prev, ...updated } : prev);
                    setEditPost(null);
                  } catch { setEditError("Something went wrong"); setEditSaving(false); }
                }}
                disabled={editSaving}
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
