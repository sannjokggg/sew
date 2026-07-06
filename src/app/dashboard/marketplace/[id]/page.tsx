"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, Tag, ArrowLeftRight, Gift, UserPlus, Star, Loader2, MessageSquare, Send } from "lucide-react";

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

function StarRating({ rating, interactive, onChange }: { rating: number; interactive?: boolean; onChange?: (r: number) => void }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type={interactive ? "button" : "button"}
          disabled={!interactive}
          onClick={() => interactive && onChange?.(star)}
          className={`${interactive ? "cursor-pointer hover:scale-110" : "cursor-default"} transition-transform`}
        >
          <Star
            size={interactive ? 22 : 16}
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
  const myId = Number((session?.user as { id?: string })?.id || 0);
  const postId = params.id as string;

  const [post, setPost] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(true);

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
      <div className="flex items-center justify-center py-24">
        <Loader2 size={32} className="animate-spin text-[#9A9A9A]" />
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
    <div className="flex flex-col gap-8 p-2" style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}>
      <button
        onClick={() => router.back()}
        className="flex w-fit items-center gap-2 text-sm text-[#6B6B6B] transition-colors hover:text-[#202124]"
      >
        <ArrowLeft size={18} strokeWidth={1.5} />
        Back
      </button>

      <div className="flex gap-8">
        <div className={`flex h-[400px] w-[500px] flex-shrink-0 items-center justify-center rounded-[24px] bg-gradient-to-br ${cfg.gradient}`}>
          {post.image_url ? (
            <img src={post.image_url} alt={post.title} className="h-full w-full rounded-[24px] object-cover" />
          ) : (
            <Icon size={120} strokeWidth={1.5} className="text-white" />
          )}
        </div>

        <div className="flex flex-1 flex-col justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className={`rounded-full px-4 py-1.5 text-xs font-semibold ${cfg.badge}`}>{post.type}</span>
              {post.category && (
                <span className="rounded-full bg-gray-100 px-4 py-1.5 text-xs font-medium text-[#6B6B6B]">{post.category}</span>
              )}
              <span className="text-xs text-[#9A9A9A]">{timeAgo(post.created_at)}</span>
            </div>

            <h1 className="mt-5 text-4xl font-normal text-[#202124]">{post.title}</h1>
            <p className="mt-4 text-lg leading-relaxed text-[#6B6B6B]">{post.description}</p>

            {post.type === "Sell" && post.price && (
              <p className="mt-6 text-3xl font-semibold text-[#202124]">${post.price}</p>
            )}
            {post.type === "Exchange" && post.price && (
              <p className="mt-6 text-3xl font-semibold text-[#202124]">{post.price}</p>
            )}
            {post.type === "Giveaway" && (
              <p className="mt-6 text-2xl font-semibold text-[#B8F25E]">Free</p>
            )}

            {avgRating && (
              <div className="mt-6 flex items-center gap-2">
                <StarRating rating={Math.round(Number(avgRating))} />
                <span className="text-sm text-[#6B6B6B]">
                  {avgRating} ({post.reviews.length} review{post.reviews.length !== 1 ? "s" : ""})
                </span>
              </div>
            )}
          </div>

          <div className="mt-8 rounded-[20px] bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-[#6B6B6B]">
                {post.user_name[0]?.toUpperCase() || "?"}
              </div>
              <div>
                <p className="text-sm font-medium text-[#202124]">{post.user_name}</p>
                <p className="text-xs text-[#9A9A9A]">{post.user_email}</p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              {myId === post.user_id ? (
                <button
                  onClick={() => router.push("/dashboard/messages")}
                  className="flex-1 rounded-full border border-gray-200 px-4 py-2.5 text-sm font-medium text-[#6B6B6B] transition-colors hover:bg-gray-50"
                >
                  <MessageSquare size={14} className="mr-1.5 inline" />Inbox
                </button>
              ) : (
                <button
                  onClick={() => router.push(`/dashboard/messages?userId=${post.user_id}`)}
                  className="flex-1 rounded-full bg-[#B8F25E] px-4 py-2.5 text-sm font-semibold text-[#202124] transition-colors hover:bg-[#a8e04e]"
                >
                  Message Seller
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold text-[#202124]">
            Reviews
            {avgRating && <span className="ml-2 text-sm font-normal text-[#9A9A9A]">({post.reviews.length})</span>}
          </h2>

          {myId !== post.user_id && (
            <form onSubmit={handleReview} className="mt-4 rounded-[20px] bg-white p-5 shadow-sm">
              <p className="mb-3 text-sm font-medium text-[#202124]">Leave a review</p>
              <StarRating rating={reviewRating} interactive onChange={setReviewRating} />
              <textarea
                value={reviewContent}
                onChange={(e) => setReviewContent(e.target.value)}
                placeholder="Write your review (optional)..."
                rows={3}
                className="mt-3 w-full resize-none rounded-[16px] bg-gray-50 p-4 text-sm text-[#202124] outline-none placeholder:text-[#B0B0B0] focus:bg-gray-100 focus:ring-1 focus:ring-[#B8F25E]"
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

          <div className="mt-4 flex flex-col gap-3">
            {post.reviews.map((review) => (
              <div key={review.id} className="rounded-[20px] bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-[#6B6B6B]">
                      {review.user_name[0]?.toUpperCase() || "?"}
                    </div>
                    <span className="text-sm font-medium text-[#202124]">{review.user_name}</span>
                    <span className="text-xs text-[#9A9A9A]">{timeAgo(review.created_at)}</span>
                  </div>
                  <StarRating rating={review.rating} />
                </div>
                {review.content && (
                  <p className="mt-3 text-sm leading-relaxed text-[#6B6B6B]">{review.content}</p>
                )}
              </div>
            ))}
            {post.reviews.length === 0 && (
              <p className="rounded-[20px] bg-white p-5 text-center text-sm text-[#9A9A9A] shadow-sm">
                No reviews yet{myId !== post.user_id ? ". Be the first!" : ""}
              </p>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-[#202124]">Comments</h2>

          <form onSubmit={handleComment} className="mt-4 rounded-[20px] bg-white p-5 shadow-sm">
            <div className="flex gap-3">
              <input
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 rounded-full bg-gray-50 px-5 py-3 text-sm text-[#202124] outline-none placeholder:text-[#B0B0B0] focus:bg-gray-100 focus:ring-1 focus:ring-[#B8F25E]"
              />
              <button
                type="submit"
                disabled={!commentContent.trim() || submittingComment}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-[#B8F25E] text-[#202124] transition-colors hover:bg-[#a8e04e] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submittingComment ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} strokeWidth={2} />}
              </button>
            </div>
          </form>

          <div className="mt-4 flex flex-col gap-3">
            {post.comments.map((comment) => (
              <div key={comment.id} className="rounded-[20px] bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-[#6B6B6B]">
                    {comment.user_name[0]?.toUpperCase() || "?"}
                  </div>
                  <span className="text-sm font-medium text-[#202124]">{comment.user_name}</span>
                  <span className="text-xs text-[#9A9A9A]">{timeAgo(comment.created_at)}</span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-[#6B6B6B]">{comment.content}</p>
              </div>
            ))}
            {post.comments.length === 0 && (
              <p className="rounded-[20px] bg-white p-5 text-center text-sm text-[#9A9A9A] shadow-sm">
                No comments yet. Start the conversation!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
