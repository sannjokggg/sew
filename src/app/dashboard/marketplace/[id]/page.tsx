"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ArrowLeft, Tag, ArrowLeftRight, Gift, UserPlus, Loader2, MessageSquare,
  Send, Clock, Trash2, X, Check, Package, Eye, ChevronLeft, ChevronRight,
} from "lucide-react";
import ImageLightbox from "@/components/image-lightbox";

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
  Sell: { badge: "border border-gray-300 text-[#6B6B6B]", icon: Tag },
  Exchange: { badge: "border border-gray-300 text-[#6B6B6B]", icon: ArrowLeftRight },
  Giveaway: { badge: "border border-gray-300 text-[#6B6B6B]", icon: Gift },
  Request: { badge: "border border-gray-300 text-[#6B6B6B]", icon: UserPlus },
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

  const [commentContent, setCommentContent] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [similarPosts, setSimilarPosts] = useState<SimilarPost[]>([]);

  const [offers, setOffers] = useState<Offer[]>([]);
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [offerMessage, setOfferMessage] = useState("");
  const [offerItem, setOfferItem] = useState("");
  const [offerImages, setOfferImages] = useState<string[]>([]);
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

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim()) return;
    setSubmittingComment(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_id: Number(postId), content: commentContent }),
      });
      if (res.ok) { setCommentContent(""); fetchPost(); }
    } finally { setSubmittingComment(false); }
  };

  const handleOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerItem.trim()) return;
    setSubmittingOffer(true);
    try {
      const res = await fetch("/api/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          post_id: Number(postId),
          message: offerMessage,
          offer_item: offerItem,
          offer_images: offerImages,
        }),
      });
      if (res.ok) {
        setOfferMessage(""); setOfferItem(""); setOfferImages([]); setShowOfferForm(false);
        fetchPost();
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

  const handleOfferImageUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) setOfferImages((prev) => [...prev, data.url]);
    } catch {}
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 p-2" style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}>
        <div className="flex items-center justify-center py-32">
          <Loader2 size={32} className="animate-spin text-[#9A9A9A]" />
        </div>
      </div>
    );
  }

  if (!post) return null;

  const cfg = typeConfig[post.type] || typeConfig.Sell;
  const Icon = cfg.icon;
  const allImages = post.images?.length > 0 ? post.images : post.image_url ? [post.image_url] : [];

  return (
    <div className="flex flex-col gap-6 p-2" style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}>
      <button
        onClick={() => router.back()}
        className="flex w-fit items-center gap-2 text-base text-[#9A9A9A] transition-colors hover:text-[#202124]"
      >
        <ArrowLeft size={18} strokeWidth={1.5} />
        Back to listings
      </button>

      {/* Main Content */}
      <div className="flex gap-8">
        {/* Image Gallery */}
        <div className="w-[560px] flex-shrink-0">
          <div className="relative flex h-[440px] items-center justify-center overflow-hidden rounded-[20px] bg-gray-50">
            {allImages.length > 0 ? (
              <>
                <img
                  src={allImages[selectedImage]}
                  alt={post.title}
                  className="cursor-pointer transition-transform hover:scale-105"
                  onClick={() => setLightbox({ src: allImages[selectedImage], alt: post.title })}
                />
                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedImage((prev) => prev > 0 ? prev - 1 : allImages.length - 1)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-[#202124] shadow-sm hover:bg-white transition-colors"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={() => setSelectedImage((prev) => prev < allImages.length - 1 ? prev + 1 : 0)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-[#202124] shadow-sm hover:bg-white transition-colors"
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
                <span className="text-base text-[#9A9A9A]">No image</span>
              </div>
            )}
          </div>
          {allImages.length > 1 && (
            <div className="mt-3 flex gap-2.5">
              {allImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`h-[72px] w-[72px] flex-shrink-0 overflow-hidden rounded-[12px] border-2 transition-all ${
                    selectedImage === i ? "border-[#202124] opacity-100" : "border-transparent opacity-50 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info Panel */}
        <div className="flex flex-1 flex-col gap-4 max-w-[420px]">
          <div className="rounded-[24px] bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <span className={`rounded-full px-4 py-1.5 text-base font-semibold ${cfg.badge}`}>
                {post.type}
              </span>
              {post.category && (
                <span className="rounded-full border border-gray-200 px-4 py-1.5 text-base font-medium text-[#6B6B6B]">
                  {post.category}
                </span>
              )}
              <span className="flex items-center gap-1 text-base text-[#9A9A9A]">
                <Clock size={14} />
                {timeAgo(post.created_at)}
              </span>
            </div>

            <h1 className="mt-5 text-3xl font-normal text-[#202124]">{post.title}</h1>
            <p className="mt-3 text-base leading-relaxed text-[#6B6B6B]">{post.description}</p>

            <div className="mt-5">
              {post.type === "Sell" && post.price && (
                <p className="text-4xl font-semibold text-[#202124]">${post.price}</p>
              )}
              {post.type === "Exchange" && post.price && (
                <p className="text-4xl font-semibold text-[#202124]">{post.price}</p>
              )}
              {post.type === "Giveaway" && (
                <p className="text-3xl font-semibold text-[#202124]">Free</p>
              )}
              {post.type === "Request" && (
                <p className="text-3xl font-semibold text-[#202124]">Looking for this</p>
              )}
            </div>
          </div>

          {/* Seller Card */}
          <div className="rounded-[24px] bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#B8F25E] to-[#4CAF50] text-base font-semibold text-[#202124]">
                {post.user_name[0]?.toUpperCase() || "?"}
              </div>
              <div>
                <p className="text-base font-semibold text-[#202124]">{post.user_name}</p>
                <p className="text-base text-[#9A9A9A]">{post.user_email}</p>
              </div>
            </div>
            <div className="mt-4">
              {myId === post.user_id ? (
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => router.push("/dashboard/messages")}
                    className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-200 px-4 py-3 text-base font-medium text-[#6B6B6B] transition-colors hover:bg-gray-50"
                  >
                    <MessageSquare size={16} /> Go to Inbox
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-red-50 border border-red-200 px-4 py-3 text-base font-medium text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50"
                  >
                    {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />} Delete
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => router.push(`/dashboard/messages?userId=${post.user_id}`)}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-[#B8F25E] px-4 py-3 text-base font-semibold text-[#202124]"
                >
                  <MessageSquare size={16} /> Message Seller
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Offers + Comments */}
      <div className="flex gap-6">
        {/* Offers Section */}
        <div className="flex-1">
          <div className="rounded-[24px] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-[#202124]">
                Offers
                <span className="ml-2 text-base font-normal text-[#9A9A9A]">({offers.length})</span>
              </h2>
              {myId !== post.user_id && (post.type === "Exchange" || post.type === "Request") && (
                <button
                  onClick={() => setShowOfferForm(!showOfferForm)}
                  className="rounded-full bg-[#B8F25E] px-5 py-2.5 text-base font-semibold text-[#202124]"
                >
                  {showOfferForm ? "Cancel" : "Make an Offer"}
                </button>
              )}
            </div>

            {showOfferForm && (
              <form onSubmit={handleOffer} className="mt-5 rounded-[16px] border border-gray-100 bg-[#F8F8F8] p-5">
                <div className="mb-4">
                  <label className="mb-2 block text-base font-medium text-[#202124]">What are you offering?</label>
                  <input
                    value={offerItem}
                    onChange={(e) => setOfferItem(e.target.value)}
                    placeholder="e.g. iPhone 12, Old bicycle, Designer bag..."
                    className="w-full rounded-full border border-gray-200 bg-white px-5 py-3 text-base text-[#202124] outline-none placeholder:text-[#B0B0B0] focus:border-gray-300 focus:ring-1 focus:ring-gray-100"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="mb-2 block text-base font-medium text-[#202124]">Message (optional)</label>
                  <textarea
                    value={offerMessage}
                    onChange={(e) => setOfferMessage(e.target.value)}
                    placeholder="Why is this a good swap?"
                    rows={3}
                    className="w-full resize-none rounded-[12px] border border-gray-200 bg-white p-4 text-base text-[#202124] outline-none placeholder:text-[#B0B0B0] focus:border-gray-300 focus:ring-1 focus:ring-gray-100"
                  />
                </div>
                <div className="mb-4">
                  <label className="mb-2 block text-base font-medium text-[#202124]">Photos (optional)</label>
                  <div className="flex gap-3 flex-wrap">
                    {offerImages.map((img, i) => (
                      <div key={i} className="relative h-20 w-20">
                        <img src={img} alt="" className="h-full w-full rounded-xl object-cover" />
                        <button
                          type="button"
                          onClick={() => setOfferImages((prev) => prev.filter((_, j) => j !== i))}
                          className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-gray-800 text-white text-xs"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                    {offerImages.length < 3 && (
                      <label className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-gray-300 text-[#9A9A9A] hover:border-gray-400 transition-colors">
                        <span className="text-2xl">+</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleOfferImageUpload(file);
                          }}
                        />
                      </label>
                    )}
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={!offerItem.trim() || submittingOffer}
                  className="rounded-full bg-[#B8F25E] px-6 py-2.5 text-base font-semibold text-[#202124] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submittingOffer ? "Submitting..." : "Submit Offer"}
                </button>
              </form>
            )}

            <div className="mt-5 flex flex-col gap-4">
              {offers.map((offer) => (
                <div key={offer.id} className="rounded-[16px] border border-gray-100 bg-[#F8F8F8] p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#B8F25E] to-[#4CAF50] text-xs font-semibold text-[#202124]">
                        {offer.user_name[0]?.toUpperCase() || "?"}
                      </div>
                      <div>
                        <p className="text-base font-semibold text-[#202124]">{offer.user_name}</p>
                        <p className="text-xs text-[#9A9A9A]">{timeAgo(offer.created_at)}</p>
                      </div>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                      offer.status === "accepted" ? "bg-green-50 text-green-600" :
                      offer.status === "declined" ? "bg-red-50 text-red-500" :
                      "bg-gray-100 text-[#9A9A9A]"
                    }`}>
                      {offer.status}
                    </span>
                  </div>
                  <div className="mt-3 rounded-[12px] bg-white p-4 border border-gray-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Package size={14} className="text-[#9A9A9A]" />
                      <span className="text-base font-semibold text-[#202124]">{offer.offer_item}</span>
                    </div>
                    {offer.message && (
                      <p className="text-base text-[#6B6B6B] mt-1">{offer.message}</p>
                    )}
                  </div>
                  {offer.offer_images && offer.offer_images.length > 0 && (
                    <div className="mt-3 flex gap-2">
                      {offer.offer_images.map((img, i) => (
                        <img key={i} src={img} alt="" className="h-16 w-16 rounded-lg object-cover" />
                      ))}
                    </div>
                  )}
                  {myId === post.user_id && offer.status === "pending" && (
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => handleOfferStatus(offer.id, "accepted")}
                        className="flex items-center gap-1.5 rounded-full bg-green-50 border border-green-200 px-4 py-2 text-base font-medium text-green-600 hover:bg-green-100 transition-colors"
                      >
                        <Check size={14} /> Accept
                      </button>
                      <button
                        onClick={() => handleOfferStatus(offer.id, "declined")}
                        className="flex items-center gap-1.5 rounded-full bg-red-50 border border-red-200 px-4 py-2 text-base font-medium text-red-500 hover:bg-red-100 transition-colors"
                      >
                        <X size={14} /> Decline
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {offers.length === 0 && (
                <div className="rounded-[16px] border border-gray-100 bg-[#F8F8F8] py-10 text-center">
                  <Package size={32} strokeWidth={1.5} className="mx-auto text-[#D1D5DB]" />
                  <p className="mt-3 text-base text-[#9A9A9A]">
                    No offers yet{myId !== post.user_id ? ". Be the first to make an offer!" : ""}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="w-[420px]">
          <div className="rounded-[24px] bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-[#202124]">
              Comments
              <span className="ml-2 text-base font-normal text-[#9A9A9A]">({post.comments.length})</span>
            </h2>

            <form onSubmit={handleComment} className="mt-5 flex gap-3">
              <input
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 rounded-full border border-gray-200 bg-[#F8F8F8] px-5 py-3 text-base text-[#202124] outline-none placeholder:text-[#B0B0B0] focus:border-gray-300 focus:bg-white focus:ring-1 focus:ring-gray-100"
              />
              <button
                type="submit"
                disabled={!commentContent.trim() || submittingComment}
                className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[#B8F25E] text-[#202124] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submittingComment ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} strokeWidth={2} />}
              </button>
            </form>

            <div className="mt-5 flex flex-col gap-4">
              {post.comments.map((comment) => (
                <div key={comment.id} className="rounded-[16px] border border-gray-100 bg-[#F8F8F8] p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#B8F25E] to-[#4CAF50] text-xs font-semibold text-[#202124]">
                      {comment.user_name[0]?.toUpperCase() || "?"}
                    </div>
                    <div>
                      <p className="text-base font-semibold text-[#202124]">{comment.user_name}</p>
                      <p className="text-xs text-[#9A9A9A]">{timeAgo(comment.created_at)}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-base leading-relaxed text-[#6B6B6B]">{comment.content}</p>
                </div>
              ))}
              {post.comments.length === 0 && (
                <div className="rounded-[16px] border border-gray-100 bg-[#F8F8F8] py-10 text-center">
                  <MessageSquare size={32} strokeWidth={1.5} className="mx-auto text-[#D1D5DB]" />
                  <p className="mt-3 text-base text-[#9A9A9A]">No comments yet. Start the conversation!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Similar Items */}
      {similarPosts.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-[#202124] mb-4">Similar Items</h2>
          <div className="grid grid-cols-4 gap-5">
            {similarPosts.map((item) => {
              const itemCfg = typeConfig[item.type] || typeConfig.Sell;
              const ItemIcon = itemCfg.icon;
              const itemImages = item.images?.length > 0 ? item.images : item.image_url ? [item.image_url] : [];
              return (
                <button
                  key={item.id}
                  onClick={() => router.push(`/dashboard/marketplace/${item.id}`)}
                  className="rounded-[24px] bg-white p-4 shadow-sm text-left transition-all hover:shadow-md"
                >
                  <div className="flex h-[160px] items-center justify-center overflow-hidden rounded-[16px] bg-gray-50">
                    {itemImages.length > 0 ? (
                      <img src={itemImages[0]} alt={item.title} className="h-full w-full object-cover" />
                    ) : (
                      <ItemIcon size={48} strokeWidth={1.2} className="text-[#B0B0B0]" />
                    )}
                  </div>
                  <div className="mt-3">
                    <h3 className="text-base font-semibold text-[#202124] line-clamp-1">{item.title}</h3>
                    <p className="mt-1 text-base font-semibold text-[#202124]">
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

      {lightbox && (
        <ImageLightbox src={lightbox.src} alt={lightbox.alt} onClose={() => setLightbox(null)} />
      )}
    </div>
  );
}
