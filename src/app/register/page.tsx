"use client";

import { useState, useRef, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ImagePlus, X, Mail, CheckCircle, ArrowLeft, Loader2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [dob, setDob] = useState("");
  const [address, setAddress] = useState("");
  const [profilePhotoPreview, setProfilePhotoPreview] = useState("");
  const [idCardPreview, setIdCardPreview] = useState("");
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [idCardFile, setIdCardFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Email OTP states
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailOtp, setEmailOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [otpExpiresAt, setOtpExpiresAt] = useState<string | null>(null);
  const [otpError, setOtpError] = useState("");

  const profileInputRef = useRef<HTMLInputElement>(null);
  const idCardInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!otpExpiresAt) return;
    const interval = setInterval(() => {
      const remaining = Math.max(
        0,
        Math.floor((new Date(otpExpiresAt).getTime() - Date.now()) / 1000)
      );
      setOtpCountdown(remaining);
      if (remaining <= 0) {
        setEmailOtpSent(false);
        setOtpExpiresAt(null);
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [otpExpiresAt]);

  // Reset email verification when email changes
  useEffect(() => {
    setEmailVerified(false);
    setEmailOtpSent(false);
    setEmailOtp("");
    setOtpExpiresAt(null);
    setOtpError("");
  }, [email]);

  const handleProfilePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("Profile photo must be under 5MB.");
      return;
    }
    setError("");
    setProfilePhotoFile(file);
    setProfilePhotoPreview(URL.createObjectURL(file));
  };

  const handleIdCard = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setError("ID card file must be under 10MB.");
      return;
    }
    setError("");
    setIdCardFile(file);
    setIdCardPreview(URL.createObjectURL(file));
  };

  const handleSendEmailOtp = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setOtpError("Please enter a valid email address");
      return;
    }
    setOtpError("");
    setOtpLoading(true);
    try {
      const res = await fetch("/api/auth/send-email-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setOtpError(data.error || "Failed to send code");
        setOtpLoading(false);
        return;
      }
      setEmailOtpSent(true);
      setOtpExpiresAt(data.expiresAt);
      setOtpLoading(false);
    } catch {
      setOtpError("Something went wrong");
      setOtpLoading(false);
    }
  };

  const handleVerifyEmailOtp = async () => {
    if (emailOtp.length !== 6) {
      setOtpError("Please enter the 6-digit code");
      return;
    }
    setOtpError("");
    setOtpLoading(true);
    try {
      const res = await fetch("/api/auth/verify-email-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: emailOtp }),
      });
      const data = await res.json();
      if (!res.ok) {
        setOtpError(data.error || "Verification failed");
        setOtpLoading(false);
        return;
      }
      setEmailVerified(true);
      setOtpLoading(false);
    } catch {
      setOtpError("Something went wrong");
      setOtpLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("firstName", firstName);
      formData.append("lastName", lastName);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("phoneNumber", phoneNumber);
      formData.append("dob", dob);
      formData.append("address", address);
      if (profilePhotoFile) formData.append("profilePhoto", profilePhotoFile);
      if (idCardFile) formData.append("idCard", idCardFile);

      const res = await fetch("/api/register", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }

      if (email && password) {
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
      } else {
        router.push("/login");
      }
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  };

  const canSubmit = emailVerified || !email;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 pt-24 pb-10 overflow-y-auto thin-scrollbar">
      <div className="w-full max-w-4xl rounded-[28px] bg-surface p-10 shadow-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-dark">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-brand-dark">Create Account</h1>
          <p className="mt-2 text-base text-text-secondary">Join the SewaGo community</p>
        </div>

        <button
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 rounded-full border border-border-default bg-surface px-4 py-3.5 text-base font-semibold text-text-primary transition-all hover:bg-surface-alt disabled:opacity-50"
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <div className="relative flex items-center justify-center my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border-default"></div>
          </div>
          <span className="relative bg-surface px-4 text-sm text-text-muted">or fill in your details</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600 border border-red-100">
              {error}
            </div>
          )}

          <div className="flex flex-col items-center mb-2">
            <input
              ref={profileInputRef}
              type="file"
              accept="image/*"
              onChange={handleProfilePhoto}
              className="hidden"
            />
            {profilePhotoPreview ? (
              <div className="relative">
                <img
                  src={profilePhotoPreview}
                  alt="Profile preview"
                  className="h-24 w-24 rounded-full object-cover border-[3px] border-accent"
                />
                <button
                  type="button"
                  onClick={() => {
                    setProfilePhotoPreview("");
                    setProfilePhotoFile(null);
                    if (profileInputRef.current) profileInputRef.current.value = "";
                  }}
                  className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-md hover:bg-red-600"
                >
                  <X size={14} strokeWidth={3} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => profileInputRef.current?.click()}
                className="flex h-24 w-24 flex-col items-center justify-center gap-1.5 rounded-full border-2 border-dashed border-border-default bg-surface-alt transition-all hover:border-accent hover:bg-accent/5"
              >
                <ImagePlus size={22} strokeWidth={1.5} className="text-text-muted" />
                <span className="text-[10px] font-medium text-text-muted">Profile Photo</span>
              </button>
            )}
            <p className="mt-2 text-xs text-text-muted">Your profile photo</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-brand-dark">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full rounded-[12px] border border-border-default px-4 py-3 text-base outline-none transition-colors focus:border-green-500 focus:ring-1 focus:ring-green-500/20 bg-surface text-text-primary"
                placeholder="John"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-brand-dark">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full rounded-[12px] border border-border-default px-4 py-3 text-base outline-none transition-colors focus:border-green-500 focus:ring-1 focus:ring-green-500/20 bg-surface text-text-primary"
                placeholder="Doe"
                required
              />
            </div>
          </div>

          {/* Email with verification */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-brand-dark">Email</label>
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 rounded-[12px] border border-border-default px-4 py-3 text-base outline-none transition-colors focus:border-green-500 focus:ring-1 focus:ring-green-500/20 bg-surface text-text-primary"
                placeholder="you@example.com"
                disabled={emailVerified}
              />
              {email && !emailVerified && !emailOtpSent && (
                <button
                  type="button"
                  onClick={handleSendEmailOtp}
                  disabled={otpLoading || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)}
                  className="flex items-center gap-2 rounded-[12px] bg-brand-dark px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-brand-dark/90 disabled:opacity-50 whitespace-nowrap"
                >
                  {otpLoading ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
                  Send Code
                </button>
              )}
              {emailVerified && (
                <div className="flex items-center gap-2 rounded-[12px] bg-green-50 border border-green-200 px-5 py-3 text-sm font-semibold text-green-700">
                  <CheckCircle size={16} />
                  Verified
                </div>
              )}
            </div>

            {/* OTP Input Section */}
            {emailOtpSent && !emailVerified && (
              <div className="mt-3 rounded-[16px] border border-border-default bg-surface-alt p-4">
                <div className="flex items-center gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => { setEmailOtpSent(false); setEmailOtp(""); setOtpError(""); }}
                    className="flex items-center gap-1 text-xs text-text-secondary hover:text-text-primary transition-colors"
                  >
                    <ArrowLeft size={14} />
                    Change email
                  </button>
                  <span className="text-xs text-text-muted">|</span>
                  <span className="text-xs text-text-muted">Code sent to {email}</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={emailOtp}
                    onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="flex-1 rounded-[12px] border border-border-default px-4 py-3 text-base outline-none transition-colors focus:border-green-500 focus:ring-1 focus:ring-green-500/20 bg-surface text-text-primary text-center tracking-[8px] font-mono"
                    placeholder="000000"
                    maxLength={6}
                  />
                  <button
                    type="button"
                    onClick={handleVerifyEmailOtp}
                    disabled={otpLoading || emailOtp.length !== 6}
                    className="flex items-center gap-2 rounded-[12px] bg-accent px-6 py-3 text-sm font-semibold text-brand-dark transition-all hover:bg-accent-hover disabled:opacity-50"
                  >
                    {otpLoading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                    Verify
                  </button>
                </div>
                {otpError && (
                  <p className="mt-2 text-xs text-red-500">{otpError}</p>
                )}
                <div className="mt-2 text-center">
                  {otpCountdown > 0 ? (
                    <p className="text-xs text-text-muted">
                      Resend in {Math.floor(otpCountdown / 60)}:{(otpCountdown % 60).toString().padStart(2, "0")}
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendEmailOtp}
                      className="text-xs font-semibold text-brand-dark hover:text-accent transition-colors"
                    >
                      Resend Code
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-brand-dark">Phone Number</label>
            <div className="flex">
              <div className="flex items-center rounded-l-[12px] border border-r-0 border-border-default bg-surface-alt px-4 py-3 text-base font-medium text-text-primary">
                <span className="mr-1">🇳🇵</span> +977
              </div>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                className="w-full rounded-r-[12px] border border-border-default px-4 py-3 text-base outline-none transition-colors focus:border-green-500 focus:ring-1 focus:ring-green-500/20 bg-surface text-text-primary"
                placeholder="98XXXXXXXX"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-brand-dark">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-[12px] border border-border-default px-4 py-3 text-base outline-none transition-colors focus:border-green-500 focus:ring-1 focus:ring-green-500/20 bg-surface text-text-primary"
              placeholder="••••••••"
              minLength={6}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-brand-dark">Date of Birth</label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full rounded-[12px] border border-border-default px-4 py-3 text-base outline-none transition-colors focus:border-green-500 focus:ring-1 focus:ring-green-500/20 bg-surface text-text-primary"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-brand-dark">Address</label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full rounded-[12px] border border-border-default px-4 py-3 text-base outline-none transition-colors focus:border-green-500 focus:ring-1 focus:ring-green-500/20 bg-surface text-text-primary resize-none"
              placeholder="Street address, city, district..."
              rows={3}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-brand-dark">Valid ID Card</label>
            <input
              ref={idCardInputRef}
              type="file"
              accept="image/*,.pdf"
              onChange={handleIdCard}
              className="hidden"
            />
            {idCardPreview ? (
              <div className="relative rounded-[16px] border border-border-default p-3 bg-surface">
                {idCardFile?.type === "application/pdf" ? (
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-red-50 text-red-500 text-xs font-bold">PDF</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">{idCardFile?.name}</p>
                      <p className="text-xs text-text-muted">PDF document</p>
                    </div>
                  </div>
                ) : (
                  <img src={idCardPreview} alt="ID preview" className="h-32 w-full rounded-[12px] object-cover" />
                )}
                <button
                  type="button"
                  onClick={() => {
                    setIdCardPreview("");
                    setIdCardFile(null);
                    if (idCardInputRef.current) idCardInputRef.current.value = "";
                  }}
                  className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-md hover:bg-red-600"
                >
                  <X size={14} strokeWidth={3} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => idCardInputRef.current?.click()}
                className="flex w-full items-center justify-center gap-2 rounded-[16px] border-2 border-dashed border-border-default bg-surface-alt px-4 py-6 transition-all hover:border-accent hover:bg-accent/5"
              >
                <ImagePlus size={20} strokeWidth={1.5} className="text-text-muted" />
                <span className="text-sm font-medium text-text-muted">Upload ID Card (Image or PDF)</span>
              </button>
            )}
            <p className="mt-1.5 text-xs text-text-muted">Accepted: Passport, National ID, Driving License, etc.</p>
          </div>

          <button
            type="submit"
            disabled={loading || !canSubmit}
            className="w-full rounded-full bg-accent px-4 py-3.5 text-base font-semibold text-brand-dark transition-all hover:bg-accent-hover hover:shadow-md disabled:opacity-50"
          >
            {loading ? "Creating account..." : !canSubmit ? "Verify email to continue" : "Sign Up"}
          </button>

          {!canSubmit && email && !emailVerified && (
            <p className="text-center text-xs text-amber-600">
              Please verify your email address to complete registration
            </p>
          )}
        </form>

        <p className="mt-6 text-center text-base text-text-secondary">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-brand-dark hover:text-accent transition-colors">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
