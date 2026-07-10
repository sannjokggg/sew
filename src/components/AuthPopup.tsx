"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import OtpInput from "@/components/OtpInput";

type Step = "welcome" | "phone" | "otp" | "details";

interface AuthPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthPopup({ isOpen, onClose }: AuthPopupProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("welcome");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpExpiresAt, setOtpExpiresAt] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [newUserId, setNewUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!otpExpiresAt) return;
    const interval = setInterval(() => {
      const remaining = Math.max(
        0,
        Math.floor((new Date(otpExpiresAt).getTime() - Date.now()) / 1000)
      );
      setCountdown(remaining);
      if (remaining <= 0) {
        setOtpSent(false);
        setOtpExpiresAt(null);
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [otpExpiresAt]);

  useEffect(() => {
    if (isOpen) {
      setStep("welcome");
      setPhoneNumber("");
      setOtp("");
      setName("");
      setOtpSent(false);
      setOtpExpiresAt(null);
      setError("");
      setLoading(false);
      setNewUserId(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch {
      setError("Google sign-in failed");
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    setError("");
    setLoading(true);
    const fullPhone = `+977${phoneNumber}`;

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: fullPhone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to send OTP");
        setLoading(false);
        return;
      }
      setOtpSent(true);
      setOtpExpiresAt(data.expiresAt);
      setStep("otp");
      setLoading(false);
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const fullPhone = `+977${phoneNumber}`;

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: fullPhone, otp }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Verification failed");
        setLoading(false);
        return;
      }

      setNewUserId(data.user.id);
      setName(data.user.name === "User" ? "" : data.user.name);

      if (data.user.name && data.user.name !== "User") {
        const result = await signIn("credentials", {
          phone: fullPhone,
          otp,
          redirect: false,
        });
        if (result?.error) {
          setError(result.error);
          setLoading(false);
        } else {
          router.push("/dashboard");
          router.refresh();
          onClose();
        }
      } else {
        setStep("details");
        setLoading(false);
      }
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  };

  const handleCompleteDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const fullPhone = `+977${phoneNumber}`;

    try {
      if (newUserId) {
        await fetch("/api/auth/update-profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: newUserId, name }),
        });
      }

      const result = await signIn("credentials", {
        phone: fullPhone,
        otp,
        redirect: false,
      });
      if (result?.error) {
        setError(result.error);
        setLoading(false);
      } else {
        router.push("/dashboard");
        router.refresh();
        onClose();
      }
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  };

  const handleResendOtp = () => {
    setOtp("");
    setOtpSent(false);
    setOtpExpiresAt(null);
    handleSendOtp();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-[28px] bg-surface p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-surface-alt flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-border-light transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {error && (
          <div className="mb-4 rounded-full bg-red-50 px-4 py-2 text-sm text-red-500 text-center">
            {error}
          </div>
        )}

        {step === "welcome" && (
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-accent/20">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#B8F25E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-text-primary mb-2">
              Start Your Journey
            </h2>
            <p className="text-lg text-text-secondary mb-1">
              with <span className="font-semibold text-accent">SewaGo</span>
            </p>
            <p className="text-sm text-text-muted mb-8">
              Join our community and make a difference for our planet.
            </p>

            <div className="space-y-3">
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 rounded-full border border-border-default bg-surface px-4 py-3.5 text-base font-medium text-text-primary transition-colors hover:bg-surface-alt disabled:opacity-50"
              >
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>

              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border-default"></div>
                </div>
                <span className="relative bg-surface px-4 text-sm text-text-muted">or</span>
              </div>

              <button
                onClick={() => setStep("phone")}
                className="w-full flex items-center justify-center gap-3 rounded-full bg-accent px-4 py-3.5 text-base font-semibold text-text-primary transition-colors hover:bg-accent-hover disabled:opacity-50"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                Continue with Phone
              </button>
            </div>

            <p className="mt-6 text-xs text-text-muted">
              By continuing, you agree to our{" "}
              <span className="underline cursor-pointer">Terms of Service</span>
              {" "}and{" "}
              <span className="underline cursor-pointer">Privacy Policy</span>
            </p>
          </div>
        )}

        {step === "phone" && (
          <div>
            <button
              onClick={() => { setStep("welcome"); setError(""); }}
              className="mb-6 flex items-center gap-1 text-sm text-text-muted hover:text-text-primary transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Back
            </button>

            <h2 className="text-2xl font-bold text-text-primary mb-1">Enter your phone</h2>
            <p className="text-sm text-text-muted mb-6">
              We&apos;ll send you a verification code via WhatsApp
            </p>

            <form onSubmit={(e) => { e.preventDefault(); handleSendOtp(); }} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-text-primary">Phone Number</label>
                <div className="flex">
                  <div className="flex items-center rounded-l-full border border-r-0 border-border-default bg-surface-alt px-4 py-3 text-base font-medium text-text-primary">
                    <span className="mr-1">🇳🇵</span> +977
                  </div>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    className="w-full rounded-r-full border border-border-default px-4 py-3 text-base outline-none focus:border-gray-300 focus:ring-1 focus:ring-gray-100"
                    placeholder="98XXXXXXXX"
                    required
                    autoFocus
                    disabled={otpSent}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || phoneNumber.length < 10}
                className="w-full rounded-full bg-accent px-4 py-3.5 text-base font-semibold text-text-primary transition-colors disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send OTP via WhatsApp"}
              </button>
            </form>
          </div>
        )}

        {step === "otp" && (
          <div>
            <button
              onClick={() => { setStep("phone"); setOtp(""); setOtpSent(false); setOtpExpiresAt(null); setError(""); }}
              className="mb-6 flex items-center gap-1 text-sm text-text-muted hover:text-text-primary transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Back
            </button>

            <h2 className="text-2xl font-bold text-text-primary mb-1">Verify your number</h2>
            <p className="text-sm text-text-muted mb-6">
              Enter the 6-digit code sent to <span className="font-medium text-text-primary">+977{phoneNumber}</span>
            </p>

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <OtpInput length={6} value={otp} onChange={setOtp} disabled={loading} />

              <div className="text-center">
                {countdown > 0 ? (
                  <p className="text-xs text-text-muted">
                    Resend OTP in {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, "0")}
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    className="text-xs font-medium text-text-primary hover:underline"
                  >
                    Resend OTP
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full rounded-full bg-accent px-4 py-3.5 text-base font-semibold text-text-primary transition-colors disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Verify & Continue"}
              </button>
            </form>
          </div>
        )}

        {step === "details" && (
          <div>
            <button
              onClick={() => { setStep("otp"); setError(""); }}
              className="mb-6 flex items-center gap-1 text-sm text-text-muted hover:text-text-primary transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Back
            </button>

            <h2 className="text-2xl font-bold text-text-primary mb-1">Almost there!</h2>
            <p className="text-sm text-text-muted mb-6">
              Tell us your name to complete your profile
            </p>

            <form onSubmit={handleCompleteDetails} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-text-primary">Your Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-full border border-border-default px-4 py-3 text-base outline-none focus:border-gray-300 focus:ring-1 focus:ring-gray-100"
                  placeholder="Enter your name"
                  required
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={loading || !name.trim()}
                className="w-full rounded-full bg-accent px-4 py-3.5 text-base font-semibold text-text-primary transition-colors disabled:opacity-50"
              >
                {loading ? "Setting up..." : "Start My Journey"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
