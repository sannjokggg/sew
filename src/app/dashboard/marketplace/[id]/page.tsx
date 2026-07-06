"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ArrowLeft, Tag, ArrowLeftRight, Gift, UserPlus, Star,
  Loader2, MessageSquare, Send, Clock, Heart, ShoppingCart,
  ChevronRight, Package
} from "lucide-react";

interface Review {
  id: number;
  post_id: number;
  user_id: number;
  rating: number;
  content: string | null;
  user_name: string;
  created_at: string;
}

interface Comment {
  id: number;
  post_id: number;
  user_id: number;
  content: string;
  user_name: string;
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
  user_name: string;
  user_email: string;
  created_at: string;
  reviews: Review[];
  comments: Comment[];
}

const typeConfig: Record<string, { gradient: string; badge: string; icon: typeof Tag; color: string }> = {
  Sell: { gradient: "from-[#B8F25E] to-[#4CAF50]", badge: "bg-[#B8F25E] text-[#202124]", icon: Tag, color: "#B8F25E" },
  Exchange: { gradient: "from-[#60A5FA] to-[#3B82F6]", badge: "bg-[#60A5FA] text-white", icon: ArrowLeftRight, color: "#60A5FA" },
  Giveaway: { gradient: "from-[#A78BFA] to-[#8B5CF6]", badge: "bg-[#A78BFA] text-white", icon: Gift, color: "#A78BFA" },
  Request: { gradient: "from-[#F472B6] to-[#EC4899]", badge: "bg-[#F472B6] text-white", icon: UserPlus, color: "#F472B6" },
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

function StarRating({ rating, size = 18, interactive = false, onChange }: {
  rating: number; size?: number; interactive?: boolean; onChange?: (r: number) => void;
}) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onChange?.(star)}
          className={`${interactive ? "cursor-pointer hover:scale-110" : "cursor-default"} transition-transform`}
        >
          <Star size={size} fill={star <= rating ? "#F59E0B" : "none"} stroke={star <= rating ? "#F59E0B" : "#D1D5DB"} strokeWidth={1.5} />
        </button>
      ))}
    </div>
  );
}

export default function PostDetail() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const myId = Number((session?.user as { id?: string } | undefined)?.id || 0);
  const postId = params.id as string;

  const [post, setPost] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"reviews" | "comments">("reviews");

  const [reviewRating, setReviewRating] = useState(0);
  const [reviewContent, setReviewContent] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const [commentContent, setCommentContent] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  const fetchPost = async () => {
    try {
      const res = await fetch(`/api/posts/${postId}`);
      const data = await res.json();
      if (data.error) { router.push("/dashboard/marketplace"); return; }
      setPost(data);
    } catch { router.push("/dashboard/marketplace"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPost(); }, [postId]);

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewRating) return;
    setSubmittingReview(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_id: Number(postId), rating: reviewRating, content: reviewContent || undefined }),
      });
      if (res.ok) { setReviewRating(0); setReviewContent(""); fetchPost(); }
    } finally { setSubmittingReview(false); }
  };

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

  if (loading) {
    return (
      <div className="flex flex-col gap-6 p-2" style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}>
        <div className="flex items-center justify-center py-40">
          <Loader2 size={32} className="animate-spin text-[#9A9A9A]" />
        </div>
      </div>
    );
  }

  if (!post) return null;

  const cfg = typeConfig[post.type] || typeConfig.Sell;
  const Icon = cfg.icon;
  const avgRating = post.reviews.length > 0
    ? (post.reviews.reduce((s, r) => s + r.rating, 0) / post.reviews.length)
    : 0;

  const ratingBreakdown = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: post.reviews.filter((r) => r.rating === star).length,
    pct: post.reviews.length > 0
      ? (post.reviews.filter((r) => r.rating === star).length / post.reviews.length) * 100
      : 0,
  }));

  return (
    <div className="flex flex-col gap-8 p-2" style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[#9A9A9A]">
        <span className="cursor-pointer hover:text-[#202124]" onClick={() => router.push("/dashboard/marketplace")}>Marketplace</span>
        <ChevronRight size={14} />
        <span className="cursor-pointer hover:text-[#202124]" onClick={() => router.push("/dashboard/marketplace")}>{post.type}</span>
        <ChevronRight size={14} />
        <span className="text-[#6B6B6B]">{post.title}</span>
      </div>

      {/* Main Product Section */}
      <div className="flex gap-8">
        {/* Left: Image */}
        <div className="flex-1">
          <div className={`relative flex h-[480px] items-center justify-center overflow-hidden rounded-[24px] bg-gradient-to-br ${cfg.gradient}`}>
            {post.image_url ? (
              <img src={post.image_url} alt={post.title} className="h-full w-full object-cover" />
            ) : (
              <Icon size={140} strokeWidth={1} className="text-white opacity-80" />
            )}
            <div className="absolute left-5 top-5">
              <span className={`rounded-full px-4 py-1.5 text-xs font-semibold ${cfg.badge}`}>{post.type}</span>
            </div>
          </div>
        </div>

        {/* Right: Info */}
        <div className="w-[440px] flex flex-col">
          <div className="rounded-[24px] bg-white p-8 shadow-sm">
            <div className="flex items-center gap-2 text-xs text-[#9A9A9A]">
              <Clock size={13} />
              <span>Listed {timeAgo(post.created_at)}</span>
              {post.category && (
                <>
                  <span className="mx-1">·</span>
                  <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[10px] font-medium text-[#6B6B6B]">{post.category}</span>
                </>
              )}
            </div>

            <h1 className="mt-4 text-[28px] font-semibold leading-tight text-[#202124]">{post.title}</h1>

            {avgRating > 0 && (
              <div className="mt-3 flex items-center gap-2">
                <StarRating rating={Math.round(avgRating)} size={16} />
                <span className="text-sm font-medium text-[#202124]">{avgRating.toFixed(1)}</span>
                <span className="text-xs text-[#9A9A9A]">({post.reviews.length} reviews)</span>
              </div>
            )}

            <div className="mt-5">
              {post.type === "Sell" && post.price && (
                <div className="flex items-baseline gap-2">
                  <span className="text-[32px] font-bold text-[#202124]">${post.price}</span>
                </div>
              )}
              {post.type === "Exchange" && (
                <span className="text-[28px] font-bold text-[#60A5FA]">Swap</span>
              )}
              {post.type === "Giveaway" && (
                <span className="text-[28px] font-bold text-[#B8F25E]">Free</span>
              )}
              {post.type === "Request" && (
                <span className="text-[28px] font-bold text-[#F472B6]">Request</span>
              )}
            </div>

            <p className="mt-4 text-sm leading-relaxed text-[#6B6B6B]">{post.description}</p>

            <div className="my-6 h-px bg-gray-100" />

            {/* Seller */}
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#B8F25E] to-[#4CAF50] text-sm font-bold text-[#202124]">
                {post.user_name[0]?.toUpperCase() || "?"}
              </div>
              <div>
                <p className="text-sm font-semibold text-[#202124]">{post.user_name}</p>
                <p className="text-xs text-[#9A9A9A]">{post.user_email}</p>
              </div>
            </div>

            <div className="mt-5 flex gap-3">
              {myId === post.user_id ? (
                <button
                  onClick={() => router.push("/dashboard/messages")}
                  className="flex flex-1 items-center justify-center gap-2 rounded-full border border-gray-200 px-5 py-3.5 text-sm font-medium text-[#6B6B6B] transition-colors hover:bg-gray-50"
                >
                  <MessageSquare size={16} /> Inbox
                </button>
              ) : (
                <>
                  <button
                    onClick={() => router.push(`/dashboard/messages?userId=${post.user_id}`)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#B8F25E] px-5 py-3.5 text-sm font-semibold text-[#202124] transition-colors hover:bg-[#a8e04e]"
                  >
                    {post.type === "Sell" ? <ShoppingCart size={16} /> : post.type === "Giveaway" ? <Gift size={16} /> : <MessageSquare size={16} />}
                    {post.type === "Sell" ? "Buy Now" : post.type === "Giveaway" ? "Claim" : post.type === "Exchange" ? "Propose Swap" : "I Have This"}
                  </button>
                  <button className="flex h-[46px] w-[46px] flex-shrink-0 items-center justify-center rounded-full border border-gray-200 text-[#9A9A9A] transition-colors hover:border-red-300 hover:text-red-400">
                    <Heart size={18} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="rounded-[24px] bg-white shadow-sm">
        <div className="flex border-b border-gray-100 px-8">
          <button
            onClick={() => setActiveTab("reviews")}
            className={`relative px-1 py-5 text-sm font-medium transition-colors ${
              activeTab === "reviews" ? "text-[#202124]" : "text-[#9A9A9A] hover:text-[#6B6B6B]"
            }`}
          >
            Reviews ({post.reviews.length})
            {activeTab === "reviews" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#202124]" />}
          </button>
          <button
            onClick={() => setActiveTab("comments")}
            className={`relative ml-8 px-1 py-5 text-sm font-medium transition-colors ${
              activeTab === "comments" ? "text-[#202124]" : "text-[#9A9A9A] hover:text-[#6B6B6B]"
            }`}
          >
            Comments ({post.comments.length})
            {activeTab === "comments" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#202124]" />}
          </button>
        </div>

        <div className="p-8">
          {activeTab === "reviews" ? (
            <div className="flex gap-10">
              {/* Left: Rating Summary */}
              <div className="w-[240px] flex-shrink-0">
                {avgRating > 0 ? (
                  <>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold text-[#202124]">{avgRating.toFixed(1)}</span>
                      <span className="text-lg text-[#9A9A9A]">/5</span>
                    </div>
                    <div className="mt-2">
                      <StarRating rating={Math.round(avgRating)} size={20} />
                    </div>
                    <p className="mt-2 text-xs text-[#9A9A9A]">{post.reviews.length} reviews</p>

                    <div className="mt-6 flex flex-col gap-2.5">
                      {ratingBreakdown.map((row) => (
                        <div key={row.star} className="flex items-center gap-3">
                          <span className="w-3 text-xs text-[#9A9A9A]">{row.star}</span>
                          <Star size={12} fill="#F59E0B" stroke="#F59E0B" strokeWidth={1.5} />
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                            <div
                              className="h-full rounded-full bg-[#F59E0B] transition-all"
                              style={{ width: `${row.pct}%` }}
                            />
                          </div>
                          <span className="w-6 text-right text-xs text-[#9A9A9A]">{row.count}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="py-8 text-center">
                    <Star size={40} strokeWidth={1} className="mx-auto text-[#D1D5DB]" />
                    <p className="mt-3 text-sm text-[#9A9A9A]">No reviews yet</p>
                  </div>
                )}
              </div>

              {/* Right: Review Form + List */}
              <div className="flex-1">
                {myId !== post.user_id && (
                  <form onSubmit={handleReview} className="mb-8 rounded-[16px] border border-gray-100 bg-[#FAFAFA] p-6">
                    <p className="text-sm font-semibold text-[#202124]">Write a review</p>
                    <div className="mt-3 flex items-center gap-3">
                      <StarRating rating={reviewRating} size={22} interactive onChange={setReviewRating} />
                      {reviewRating > 0 && (
                        <span className="text-xs font-medium text-[#9A9A9A]">{["", "Poor", "Fair", "Good", "Very Good", "Excellent"][reviewRating]}</span>
                      )}
                    </div>
                    <textarea
                      value={reviewContent}
                      onChange={(e) => setReviewContent(e.target.value)}
                      placeholder="Share your experience with this item..."
                      rows={3}
                      className="mt-4 w-full resize-none rounded-[12px] border border-gray-200 bg-white p-4 text-sm text-[#202124] outline-none transition-all placeholder:text-[#B0B0B0] focus:border-[#B8F25E] focus:ring-1 focus:ring-[#B8F25E]"
                    />
                    <div className="mt-3 flex justify-end">
                      <button
                        type="submit"
                        disabled={!reviewRating || submittingReview}
                        className="rounded-full bg-[#202124] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#2a2a2a] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {submittingReview ? "Posting..." : "Post Review"}
                      </button>
                    </div>
                  </form>
                )}

                <div className="flex flex-col gap-5">
                  {post.reviews.map((review) => (
                    <div key={review.id} className="flex gap-4">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#B8F25E] to-[#4CAF50] text-sm font-bold text-[#202124]">
                        {review.user_name[0]?.toUpperCase() || "?"}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold text-[#202124]">{review.user_name}</span>
                          <StarRating rating={review.rating} size={14} />
                          <span className="text-[11px] text-[#9A9A9A]">{timeAgo(review.created_at)}</span>
                        </div>
                        {review.content && (
                          <p className="mt-2 text-sm leading-relaxed text-[#6B6B6B]">{review.content}</p>
                        )}
                      </div>
                    </div>
                  ))}
                  {post.reviews.length === 0 && (
                    <div className="py-12 text-center">
                      <p className="text-sm text-[#9A9A9A]">No reviews yet{myId !== post.user_id ? ". Be the first to review!" : ""}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Comments Tab */
            <div className="flex gap-10">
              <div className="flex-1">
                <form onSubmit={handleComment} className="mb-6 flex gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#B8F25E] to-[#4CAF50] text-sm font-bold text-[#202124]">
                    {(session?.user as { name?: string } | undefined)?.name?.[0]?.toUpperCase() || "?"}
                  </div>
                  <input
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    placeholder="Write a comment..."
                    className="flex-1 rounded-full border border-gray-200 bg-[#F8F8F8] px-5 py-3 text-sm text-[#202124] outline-none transition-all placeholder:text-[#B0B0B0] focus:border-[#B8F25E] focus:bg-white focus:ring-1 focus:ring-[#B8F25E]"
                  />
                  <button
                    type="submit"
                    disabled={!commentContent.trim() || submittingComment}
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#202124] text-white transition-colors hover:bg-[#2a2a2a] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submittingComment ? <Loader2 size={16} className="animate-spin" /> : <Send size={15} strokeWidth={2} />}
                  </button>
                </form>

                <div className="flex flex-col gap-5">
                  {post.comments.map((comment) => (
                    <div key={comment.id} className="flex gap-4">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#B8F25E] to-[#4CAF50] text-sm font-bold text-[#202124]">
                        {comment.user_name[0]?.toUpperCase() || "?"}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold text-[#202124]">{comment.user_name}</span>
                          <span className="text-[11px] text-[#9A9A9A]">{timeAgo(comment.created_at)}</span>
                        </div>
                        <p className="mt-1.5 text-sm leading-relaxed text-[#6B6B6B]">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                  {post.comments.length === 0 && (
                    <div className="py-12 text-center">
                      <Package size={32} strokeWidth={1.5} className="mx-auto text-[#D1D5DB]" />
                      <p className="mt-3 text-sm text-[#9A9A9A]">No comments yet. Start the conversation!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
