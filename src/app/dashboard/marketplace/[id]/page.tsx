"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, Tag, ArrowLeftRight, Gift, UserPlus, Star, Loader2, MessageSquare, Send, Clock } from "lucide-react";

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
  images: string[];
  user_name: string;
  user_email: string;
  created_at: string;
  reviews: Review[];
  comments: Comment[];
}

const typeConfig: Record<string, { gradient: string; badge: string; icon: typeof Tag; label: string }> = {
  Sell: { gradient: "from-[#B8F25E] to-[#4CAF50]", badge: "bg-[#B8F25E] text-[#202124]", icon: Tag, label: "For Sale" },
  Exchange: { gradient: "from-[#60A5FA] to-[#3B82F6]", badge: "bg-[#60A5FA] text-white", icon: ArrowLeftRight, label: "Exchange" },
  Giveaway: { gradient: "from-[#A78BFA] to-[#8B5CF6]", badge: "bg-[#A78BFA] text-white", icon: Gift, label: "Free" },
  Request: { gradient: "from-[#F472B6] to-[#EC4899]", badge: "bg-[#F472B6] text-white", icon: UserPlus, label: "Request" },
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

function StarRating({ rating, interactive, onChange }: { rating: number; interactive?: boolean; onChange?: (r: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onChange?.(star)}
          className={`${interactive ? "cursor-pointer hover:scale-110" : "cursor-default"} transition-transform`}
        >
          <Star
            size={interactive ? 24 : 18}
            fill={star <= rating ? "#F59E0B" : "none"}
            stroke={star <= rating ? "#F59E0B" : "#D1D5DB"}
            strokeWidth={1.5}
          />
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
  const [selectedImage, setSelectedImage] = useState(0);

  const [reviewRating, setReviewRating] = useState(0);
  const [reviewContent, setReviewContent] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const [commentContent, setCommentContent] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  const fetchPost = async () => {
    try {
      const res = await fetch(`/api/posts/${postId}`);
      const data = await res.json();
      if (data.error) {
        router.push("/dashboard/marketplace");
        return;
      }
      setPost(data);
    } catch {
      router.push("/dashboard/marketplace");
    } finally {
      setLoading(false);
    }
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
      if (res.ok) {
        setReviewRating(0);
        setReviewContent("");
        fetchPost();
      }
    } finally {
      setSubmittingReview(false);
    }
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
      if (res.ok) {
        setCommentContent("");
        fetchPost();
      }
    } finally {
      setSubmittingComment(false);
    }
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
  const avgRating = post.reviews.length > 0
    ? (post.reviews.reduce((s, r) => s + r.rating, 0) / post.reviews.length).toFixed(1)
    : null;

  return (
    <div className="flex flex-col gap-6 p-2" style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}>
      <button
        onClick={() => router.back()}
        className="flex w-fit items-center gap-2 text-sm text-[#9A9A9A] transition-colors hover:text-[#202124]"
      >
        <ArrowLeft size={18} strokeWidth={1.5} />
        Back to listings
      </button>

      <div className="flex gap-8">
        <div className="w-[560px] flex-shrink-0">
          <div className={`flex h-[440px] items-center justify-center rounded-[20px] bg-gradient-to-br ${cfg.gradient}`}>
            {post.images && post.images.length > 0 ? (
              <img src={post.images[selectedImage] || post.images[0]} alt={post.title} className="h-full w-full rounded-[20px] object-contain" />
            ) : post.image_url ? (
              <img src={post.image_url} alt={post.title} className="h-full w-full rounded-[20px] object-contain" />
            ) : (
              <Icon size={100} strokeWidth={1.5} className="text-white" />
            )}
          </div>
          {post.images && post.images.length > 1 && (
            <div className="mt-3 flex gap-2.5">
              {post.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`h-[72px] w-[72px] flex-shrink-0 overflow-hidden rounded-[12px] border-2 transition-all ${
                    selectedImage === i
                      ? "border-[#202124] opacity-100"
                      : "border-transparent opacity-50 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt={`Photo ${i + 1}`} className="h-full w-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-4 max-w-[380px]">
          <div className="rounded-[24px] bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <span className={`rounded-full px-4 py-1.5 text-xs font-semibold ${cfg.badge}`}>
                {post.type}
              </span>
              {post.category && (
                <span className="rounded-full bg-gray-100 px-4 py-1.5 text-xs font-medium text-[#6B6B6B]">
                  {post.category}
                </span>
              )}
              <span className="flex items-center gap-1 text-xs text-[#9A9A9A]">
                <Clock size={12} />
                {timeAgo(post.created_at)}
              </span>
            </div>

            <h1 className="mt-5 text-3xl font-normal text-[#202124]">{post.title}</h1>
            <p className="mt-3 text-sm leading-relaxed text-[#6B6B6B]">{post.description}</p>

            <div className="mt-5">
              {post.type === "Sell" && post.price && (
                <p className="text-4xl font-semibold text-[#202124]">${post.price}</p>
              )}
              {post.type === "Exchange" && post.price && (
                <p className="text-4xl font-semibold text-[#202124]">{post.price}</p>
              )}
              {post.type === "Giveaway" && (
                <p className="text-3xl font-semibold text-[#B8F25E]">Free</p>
              )}
              {post.type === "Request" && (
                <p className="text-3xl font-semibold text-[#F472B6]">Looking for this</p>
              )}
            </div>

            {avgRating && (
              <div className="mt-5 flex items-center gap-3">
                <StarRating rating={Math.round(Number(avgRating))} />
                <span className="text-sm font-medium text-[#202124]">{avgRating}</span>
                <span className="text-xs text-[#9A9A9A]">
                  ({post.reviews.length} review{post.reviews.length !== 1 ? "s" : ""})
                </span>
              </div>
            )}
          </div>

          <div className="rounded-[24px] bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#B8F25E] to-[#4CAF50] text-base font-semibold text-[#202124]">
                {post.user_name[0]?.toUpperCase() || "?"}
              </div>
              <div>
                <p className="text-sm font-semibold text-[#202124]">{post.user_name}</p>
                <p className="text-xs text-[#9A9A9A]">{post.user_email}</p>
              </div>
            </div>
            <div className="mt-4">
              {myId === post.user_id ? (
                <button
                  onClick={() => router.push("/dashboard/messages")}
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-200 px-4 py-3 text-sm font-medium text-[#6B6B6B] transition-colors hover:bg-gray-50"
                >
                  <MessageSquare size={16} /> Go to Inbox
                </button>
              ) : (
                <button
                  onClick={() => router.push(`/dashboard/messages?userId=${post.user_id}`)}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-[#B8F25E] px-4 py-3 text-sm font-semibold text-[#202124] transition-colors hover:bg-[#a8e04e]"
                >
                  <MessageSquare size={16} /> Message Seller
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        <div className="flex-1">
          <div className="rounded-[24px] bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-[#202124]">
              Reviews
              {avgRating && (
                <span className="ml-2 text-sm font-normal text-[#9A9A9A]">
                  {avgRating} ({post.reviews.length})
                </span>
              )}
            </h2>

            {myId !== post.user_id && (
              <form onSubmit={handleReview} className="mt-5 rounded-[16px] border border-gray-100 bg-[#F8F8F8] p-5">
                <p className="mb-3 text-sm font-medium text-[#202124]">Leave a review</p>
                <StarRating rating={reviewRating} interactive onChange={setReviewRating} />
                <textarea
                  value={reviewContent}
                  onChange={(e) => setReviewContent(e.target.value)}
                  placeholder="Write your review (optional)..."
                  rows={3}
                  className="mt-3 w-full resize-none rounded-[12px] border border-gray-200 bg-white p-4 text-sm text-[#202124] outline-none placeholder:text-[#B0B0B0] focus:border-[#B8F25E] focus:ring-1 focus:ring-[#B8F25E]"
                />
                <button
                  type="submit"
                  disabled={!reviewRating || submittingReview}
                  className="mt-3 rounded-full bg-[#B8F25E] px-6 py-2.5 text-sm font-semibold text-[#202124] transition-colors hover:bg-[#a8e04e] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            )}

            <div className="mt-5 flex flex-col gap-4">
              {post.reviews.map((review) => (
                <div key={review.id} className="rounded-[16px] border border-gray-100 bg-[#F8F8F8] p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#B8F25E] to-[#4CAF50] text-xs font-semibold text-[#202124]">
                        {review.user_name[0]?.toUpperCase() || "?"}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#202124]">{review.user_name}</p>
                        <p className="text-[10px] text-[#9A9A9A]">{timeAgo(review.created_at)}</p>
                      </div>
                    </div>
                    <StarRating rating={review.rating} />
                  </div>
                  {review.content && (
                    <p className="mt-3 text-sm leading-relaxed text-[#6B6B6B]">{review.content}</p>
                  )}
                </div>
              ))}
              {post.reviews.length === 0 && (
                <div className="rounded-[16px] border border-gray-100 bg-[#F8F8F8] py-10 text-center">
                  <Star size={32} strokeWidth={1.5} className="mx-auto text-[#D1D5DB]" />
                  <p className="mt-3 text-sm text-[#9A9A9A]">
                    No reviews yet{myId !== post.user_id ? ". Be the first!" : ""}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="w-[420px]">
          <div className="rounded-[24px] bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-[#202124]">
              Comments
              <span className="ml-2 text-sm font-normal text-[#9A9A9A]">({post.comments.length})</span>
            </h2>

            <form onSubmit={handleComment} className="mt-5 flex gap-3">
              <input
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 rounded-full border border-gray-200 bg-[#F8F8F8] px-5 py-3 text-sm text-[#202124] outline-none placeholder:text-[#B0B0B0] focus:border-[#B8F25E] focus:bg-white focus:ring-1 focus:ring-[#B8F25E]"
              />
              <button
                type="submit"
                disabled={!commentContent.trim() || submittingComment}
                className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[#B8F25E] text-[#202124] transition-colors hover:bg-[#a8e04e] disabled:cursor-not-allowed disabled:opacity-50"
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
                      <p className="text-sm font-semibold text-[#202124]">{comment.user_name}</p>
                      <p className="text-[10px] text-[#9A9A9A]">{timeAgo(comment.created_at)}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-[#6B6B6B]">{comment.content}</p>
                </div>
              ))}
              {post.comments.length === 0 && (
                <div className="rounded-[16px] border border-gray-100 bg-[#F8F8F8] py-10 text-center">
                  <MessageSquare size={32} strokeWidth={1.5} className="mx-auto text-[#D1D5DB]" />
                  <p className="mt-3 text-sm text-[#9A9A9A]">No comments yet. Start the conversation!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
