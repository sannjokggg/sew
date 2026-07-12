"use client";

import { useState, useRef, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ImagePlus, X, Mail, Phone, CheckCircle, Loader2, ArrowLeft, User } from "lucide-react";

type Step = "phone" | "email" | "details" | "otp";

export default function RegisterPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("phone");

  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [dob, setDob] = useState("");
  const [address, setAddress] = useState("");
  const [profilePhotoPreview, setProfilePhotoPreview] = useState("");
  const [idCardPreview, setIdCardPreview] = useState("");
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [idCardFile, setIdCardFile] = useState<File | null>(null);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [emailOtp, setEmailOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [otpExpiresAt, setOtpExpiresAt] = useState<string | null>(null);
  const [otpError, setOtpError] = useState("");
  const [emailOtpSent, setEmailOtpSent] = useState(false);

  const profileInputRef = useRef<HTMLInputElement>(null);
  const idCardInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!otpExpiresAt) return;
    const interval = setInterval(() => {
      const remaining = Math.max(
        0,
        Math.max(0, Math.floor((new Date(otpExpiresAt).getTime() - Date.now()) / 1000))
      );
      setOtpCountdown(remaining);
      if (remaining <= 0) {
        setOtpExpiresAt(null);
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [otpExpiresAt]);

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

  const handlePhoneContinue = () => {
    setError("");
    if (!phoneNumber || phoneNumber.length < 10) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }
    setStep("email");
  };

  const handleEmailContinue = () => {
    setError("");
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }
    setStep("details");
  };

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!firstName || !lastName || !password) {
      setError("Please fill in all required fields");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setStep("otp");
    await handleSendEmailOtp();
  };

  const handleSendEmailOtp = async () => {
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
      setOtpLoading(false);
      await submitRegistration();
    } catch {
      setOtpError("Something went wrong");
      setOtpLoading(false);
    }
  };

  const submitRegistration = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("firstName", firstName);
      formData.append("lastName", lastName);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("phoneNumber", `+977${phoneNumber}`);
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
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  };

  const goBack = () => {
    setError("");
    if (step === "email") setStep("phone");
    else if (step === "details") setStep("email");
    else if (step === "otp") setStep("details");
  };

  const stepIndicators = [
    { key: "phone", label: "Phone" },
    { key: "email", label: "Email" },
    { key: "details", label: "Details" },
    { key: "otp", label: "Verify" },
  ];
  const stepIndex = stepIndicators.findIndex((s) => s.key === step);

  return (
    <div className="w-full max-w-md rounded-[28px] bg-surface p-6 shadow-2xl">
      {/* Header */}
      <div className="mb-4 text-center">
        <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-brand-dark">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-brand-dark">Create Account</h1>
        <p className="mt-1 text-xs text-text-secondary">Join the SewaGo community</p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-2 mb-5">
        {stepIndicators.map((s, i) => (
          <div key={s.key} className="flex items-center gap-2">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                i < stepIndex
                  ? "bg-accent text-brand-dark"
                  : i === stepIndex
                  ? "bg-brand-dark text-white"
                  : "bg-surface-alt text-text-muted border border-border-default"
              }`}
            >
              {i < stepIndex ? <CheckCircle size={14} /> : i + 1}
            </div>
            {i < stepIndicators.length - 1 && (
              <div
                className={`h-0.5 w-6 rounded ${
                  i < stepIndex ? "bg-accent" : "bg-border-default"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-3 rounded-2xl bg-red-50 px-4 py-2.5 text-xs text-red-600 border border-red-100">
          {error}
        </div>
      )}

      {/* STEP 1: Phone */}
      {step === "phone" && (
        <div className="space-y-4">
          <div className="text-center mb-2">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-surface-alt">
              <Phone size={20} className="text-brand-dark" />
            </div>
            <h2 className="text-lg font-bold text-brand-dark">Enter Phone Number</h2>
            <p className="text-xs text-text-muted">We&apos;ll use this to identify your account</p>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-brand-dark">Phone Number</label>
            <div className="flex">
              <div className="flex items-center rounded-l-[12px] border border-r-0 border-border-default bg-surface-alt px-3 py-2.5 text-sm font-medium text-text-primary">
                <span className="mr-1">🇳🇵</span> +977
              </div>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                className="w-full rounded-r-[12px] border border-border-default px-3 py-2.5 text-sm outline-none transition-colors focus:border-green-500 focus:ring-1 focus:ring-green-500/20 bg-surface text-text-primary"
                placeholder="98XXXXXXXX"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handlePhoneContinue()}
              />
            </div>
          </div>

          <button
            onClick={handlePhoneContinue}
            className="w-full rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-brand-dark"
          >
            Continue
          </button>
        </div>
      )}

      {/* STEP 2: Email */}
      {step === "email" && (
        <div className="space-y-4">
          <button onClick={goBack} className="flex items-center gap-1 text-xs text-text-muted hover:text-text-primary transition-colors">
            <ArrowLeft size={14} /> Back
          </button>

          <div className="text-center mb-2">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-surface-alt">
              <Mail size={20} className="text-brand-dark" />
            </div>
            <h2 className="text-lg font-bold text-brand-dark">Enter Email Address</h2>
            <p className="text-xs text-text-muted">We&apos;ll send a verification code to this email</p>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-brand-dark">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-[12px] border border-border-default px-4 py-2.5 text-sm outline-none transition-colors focus:border-green-500 focus:ring-1 focus:ring-green-500/20 bg-surface text-text-primary"
              placeholder="you@example.com"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleEmailContinue()}
            />
          </div>

          <button
            onClick={handleEmailContinue}
            className="w-full rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-brand-dark"
          >
            Continue
          </button>
        </div>
      )}

      {/* STEP 3: Details */}
      {step === "details" && (
        <form onSubmit={handleDetailsSubmit} className="space-y-4">
          <button type="button" onClick={goBack} className="flex items-center gap-1 text-xs text-text-muted hover:text-text-primary transition-colors">
            <ArrowLeft size={14} /> Back
          </button>

          <div className="text-center mb-2">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-surface-alt">
              <User size={20} className="text-brand-dark" />
            </div>
            <h2 className="text-lg font-bold text-brand-dark">Complete Your Profile</h2>
            <p className="text-xs text-text-muted">Fill in your details to get started</p>
          </div>

          {/* Profile Photo */}
          <div className="flex flex-col items-center mb-1">
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
                  className="h-16 w-16 rounded-full object-cover border-[3px] border-accent"
                />
                <button
                  type="button"
                  onClick={() => {
                    setProfilePhotoPreview("");
                    setProfilePhotoFile(null);
                    if (profileInputRef.current) profileInputRef.current.value = "";
                  }}
                  className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-md"
                >
                  <X size={14} strokeWidth={3} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => profileInputRef.current?.click()}
                className="flex h-16 w-16 flex-col items-center justify-center gap-0.5 rounded-full border-2 border-dashed border-border-default bg-surface-alt"
              >
                <ImagePlus size={16} strokeWidth={1.5} className="text-text-muted" />
                <span className="text-[8px] font-medium text-text-muted">Photo</span>
              </button>
            )}
            <p className="mt-1.5 text-xs text-text-muted">Profile photo (optional)</p>
          </div>

          {/* Name */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-brand-dark">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full rounded-[12px] border border-border-default px-4 py-2.5 text-sm outline-none transition-colors focus:border-green-500 focus:ring-1 focus:ring-green-500/20 bg-surface text-text-primary"
                placeholder="John"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-brand-dark">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full rounded-[12px] border border-border-default px-4 py-2.5 text-sm outline-none transition-colors focus:border-green-500 focus:ring-1 focus:ring-green-500/20 bg-surface text-text-primary"
                placeholder="Doe"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-brand-dark">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-[12px] border border-border-default px-4 py-2.5 text-sm outline-none transition-colors focus:border-green-500 focus:ring-1 focus:ring-green-500/20 bg-surface text-text-primary"
              placeholder="••••••••"
              minLength={6}
              required
            />
          </div>

          {/* DOB & Address */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-brand-dark">Date of Birth</label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full rounded-[12px] border border-border-default px-3 py-2.5 text-sm outline-none transition-colors focus:border-green-500 focus:ring-1 focus:ring-green-500/20 bg-surface text-text-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-brand-dark">Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full rounded-[12px] border border-border-default px-4 py-2.5 text-sm outline-none transition-colors focus:border-green-500 focus:ring-1 focus:ring-green-500/20 bg-surface text-text-primary"
                placeholder="Street, city..."
              />
            </div>
          </div>

          {/* ID Card */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-brand-dark">Valid ID Card</label>
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
                  <img src={idCardPreview} alt="ID preview" className="h-28 w-full rounded-[12px] object-cover" />
                )}
                <button
                  type="button"
                  onClick={() => {
                    setIdCardPreview("");
                    setIdCardFile(null);
                    if (idCardInputRef.current) idCardInputRef.current.value = "";
                  }}
                  className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-md"
                >
                  <X size={14} strokeWidth={3} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => idCardInputRef.current?.click()}
                className="flex w-full items-center justify-center gap-2 rounded-[16px] border-2 border-dashed border-border-default bg-surface-alt px-4 py-3"
              >
                <ImagePlus size={20} strokeWidth={1.5} className="text-text-muted" />
                <span className="text-sm font-medium text-text-muted">Upload ID Card</span>
              </button>
            )}
            <p className="mt-1 text-xs text-text-muted">Passport, National ID, Driving License (optional)</p>
          </div>

          <button
            type="submit"
            disabled={loading || otpLoading}
            className="w-full rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-brand-dark disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Submit & Verify"}
          </button>
        </form>
      )}

      {/* STEP 4: Email OTP Verification */}
      {step === "otp" && (
        <div className="space-y-4">
          <button onClick={goBack} className="flex items-center gap-1 text-xs text-text-muted hover:text-text-primary transition-colors">
            <ArrowLeft size={14} /> Back
          </button>

          <div className="text-center mb-2">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-brand-dark">
              <Mail size={20} className="text-white" />
            </div>
            <h2 className="text-lg font-bold text-brand-dark">Verify Your Email</h2>
            <p className="text-xs text-text-muted">
              Enter the code sent to <strong className="text-text-primary">{email}</strong>
            </p>
          </div>

          {!emailOtpSent && otpLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={32} className="animate-spin text-accent" />
            </div>
          ) : (
            <>
              <div className="flex justify-center">
                <input
                  type="text"
                  value={emailOtp}
                  onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="w-full max-w-[280px] rounded-[14px] border border-border-default px-4 py-4 text-2xl text-center outline-none transition-colors focus:border-green-500 focus:ring-1 focus:ring-green-500/20 bg-surface text-text-primary tracking-[12px] font-mono"
                  placeholder="000000"
                  maxLength={6}
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && handleVerifyEmailOtp()}
                />
              </div>
              <p className="text-center text-xs text-text-muted">6-digit code</p>

              {otpError && (
                <p className="text-center text-xs text-red-500">{otpError}</p>
              )}

              <button
                onClick={handleVerifyEmailOtp}
                disabled={otpLoading || emailOtp.length !== 6}
                className="w-full rounded-full bg-accent px-4 py-3 text-sm font-semibold text-brand-dark disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {otpLoading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                {otpLoading ? "Verifying..." : "Verify & Complete"}
              </button>

              <div className="text-center">
                {otpCountdown > 0 && emailOtpSent ? (
                  <p className="text-xs text-text-muted">
                    Code expires in {Math.floor(otpCountdown / 60)}:{(otpCountdown % 60).toString().padStart(2, "0")}
                  </p>
                ) : (
                  <button
                    onClick={handleSendEmailOtp}
                    disabled={otpLoading}
                    className="text-xs font-semibold text-brand-dark disabled:opacity-50"
                  >
                    Resend Code
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Footer */}
      <p className="mt-5 text-center text-sm text-text-secondary">
        Already have an account?{" "}
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent("open-auth-popup", { detail: { initialStep: "email" } }))}
          className="font-semibold text-brand-dark bg-transparent border-none p-0 cursor-pointer"
        >
          Login
        </button>
      </p>
    </div>
  );
}
