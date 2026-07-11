"use client";

import { useEffect, useState } from "react";
import { X, CheckCircle } from "lucide-react";

function ConfettiPiece({ delay, left }: { delay: number; left: number }) {
  const colors = ["#B8F25E", "#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD"];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const rotation = Math.random() * 360;
  const size = Math.random() * 8 + 6;

  return (
    <div
      style={{
        position: "absolute",
        left: `${left}%`,
        top: "-20px",
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: color,
        borderRadius: Math.random() > 0.5 ? "50%" : "2px",
        animation: `confetti-fall ${2 + Math.random() * 2}s ease-in ${delay}s forwards`,
        transform: `rotate(${rotation}deg)`,
        opacity: 0,
      }}
    />
  );
}

export default function VerificationCelebration({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setShow(true), 50);
      return () => clearTimeout(timer);
    } else {
      setShow(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const confettiPieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    delay: Math.random() * 1.5,
    left: Math.random() * 100,
  }));

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center transition-all duration-300 ${
        show ? "bg-black/50" : "bg-black/0"
      }`}
      onClick={onClose}
    >
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes confetti-fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        @keyframes scale-in {
          0% { transform: scale(0.5); opacity: 0; }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
          50% { box-shadow: 0 0 0 20px rgba(34, 197, 94, 0); }
        }
        @keyframes bounce-in {
          0% { transform: scale(0); }
          50% { transform: scale(1.2); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); }
        }
      `}</style>

      {/* Confetti layer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {confettiPieces.map((p) => (
          <ConfettiPiece key={p.id} delay={p.delay} left={p.left} />
        ))}
      </div>

      {/* Modal */}
      <div
        className={`relative w-full max-w-md mx-4 rounded-[24px] bg-white shadow-2xl transition-all duration-300 ${
          show ? "scale-100 opacity-100" : "scale-50 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-700 z-10"
        >
          <X size={18} />
        </button>

        {/* Content */}
        <div className="flex flex-col items-center px-8 pt-10 pb-8 text-center">
          {/* Animated checkmark icon */}
          <div
            className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-100"
            style={{ animation: "pulse-glow 2s ease-in-out infinite" }}
          >
            <div style={{ animation: "bounce-in 0.6s ease-out 0.3s both" }}>
              <CheckCircle size={56} className="text-green-500" strokeWidth={2} />
            </div>
          </div>

          {/* Title */}
          <h2
            className="text-2xl font-bold text-gray-900 mb-2"
            style={{ animation: "scale-in 0.4s ease-out 0.5s both" }}
          >
            Congratulations! 🎉
          </h2>

          {/* Subtitle */}
          <p
            className="text-lg font-medium text-green-600 mb-3"
            style={{ animation: "scale-in 0.4s ease-out 0.7s both" }}
          >
            Your account has been verified!
          </p>

          {/* Description */}
          <p
            className="text-sm text-gray-500 leading-relaxed mb-8 max-w-xs"
            style={{ animation: "scale-in 0.4s ease-out 0.9s both" }}
          >
            Your posts, events, and offers are now visible to everyone. Thank you for being a trusted member of the SewaGo community!
          </p>

          {/* Continue button */}
          <button
            onClick={onClose}
            className="w-full rounded-full bg-accent px-8 py-3.5 text-base font-semibold text-gray-900 transition-all hover:bg-accent-hover hover:shadow-lg active:scale-95"
            style={{
              background: "linear-gradient(90deg, #B8F25E, #4CAF50, #B8F25E)",
              backgroundSize: "200% 100%",
              animation: "scale-in 0.4s ease-out 1.1s both, shimmer 3s linear infinite",
            }}
          >
            Continue Browsing
          </button>
        </div>
      </div>
    </div>
  );
}
