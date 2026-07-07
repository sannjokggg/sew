"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import OtpInput from "@/components/OtpInput";

type Tab = "email" | "phone";

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("email");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpExpiresAt, setOtpExpiresAt] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  const handleSendOtp = async () => {
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to send OTP");
        setLoading(false);
        return;
      }

      setOtpSent(true);
      setOtpExpiresAt(data.expiresAt);
      setLoading(false);
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  };

  const handleOtpLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      phone: phoneNumber,
      otp,
      redirect: false,
    });

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  const handleResendOtp = () => {
    setOtp("");
    setOtpSent(false);
    setOtpExpiresAt(null);
    handleSendOtp();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f3f4f6]">
      <div className="w-full max-w-md rounded-[24px] bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold text-[#202124]">Welcome Back</h1>
          <p className="mt-2 text-sm text-[#9A9A9A]">Sign in to your Sewago account</p>
        </div>

        <div className="mb-6 flex rounded-full bg-[#f3f4f6] p-1">
          <button
            type="button"
            onClick={() => { setTab("email"); setError(""); setOtp(""); setOtpSent(false); }}
            className={`flex-1 rounded-full py-2.5 text-sm font-medium transition-colors ${
              tab === "email"
                ? "bg-white text-[#202124] shadow-sm"
                : "text-[#9A9A9A] hover:text-[#202124]"
            }`}
          >
            Email
          </button>
          <button
            type="button"
            onClick={() => { setTab("phone"); setError(""); setOtp(""); setOtpSent(false); }}
            className={`flex-1 rounded-full py-2.5 text-sm font-medium transition-colors ${
              tab === "phone"
                ? "bg-white text-[#202124] shadow-sm"
                : "text-[#9A9A9A] hover:text-[#202124]"
            }`}
          >
            Phone
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-full bg-red-50 px-4 py-2 text-sm text-red-500">
            {error}
          </div>
        )}

        {tab === "email" && (
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-[#202124]">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-full border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#B8F25E] focus:ring-1 focus:ring-[#B8F25E]"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-[#202124]">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-full border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#B8F25E] focus:ring-1 focus:ring-[#B8F25E]"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-[#B8F25E] px-4 py-3 text-sm font-semibold text-[#202124] transition-colors hover:bg-[#a8e04e] disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        )}

        {tab === "phone" && (
          <form onSubmit={otpSent ? handleOtpLogin : (e) => { e.preventDefault(); handleSendOtp(); }} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-[#202124]">Phone Number</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full rounded-full border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#B8F25E] focus:ring-1 focus:ring-[#B8F25E]"
                placeholder="+91 98765 43210"
                required
                disabled={otpSent}
              />
            </div>

            {otpSent && (
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-[#202124]">Enter OTP</label>
                  <OtpInput
                    length={6}
                    value={otp}
                    onChange={setOtp}
                    disabled={loading}
                  />
                </div>

                <div className="text-center">
                  {countdown > 0 ? (
                    <p className="text-xs text-[#9A9A9A]">
                      Resend OTP in {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, "0")}
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="text-xs font-medium text-[#202124] hover:underline"
                    >
                      Resend OTP
                    </button>
                  )}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || (otpSent && otp.length !== 6)}
              className="w-full rounded-full bg-[#B8F25E] px-4 py-3 text-sm font-semibold text-[#202124] transition-colors hover:bg-[#a8e04e] disabled:opacity-50"
            >
              {loading
                ? otpSent ? "Verifying..." : "Sending..."
                : otpSent ? "Verify & Sign In" : "Send OTP"}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-[#9A9A9A]">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-[#202124] hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
