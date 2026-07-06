"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f3f4f6]">
      <div className="w-full max-w-md rounded-[24px] bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold text-[#202124]">Welcome Back</h1>
          <p className="mt-2 text-sm text-[#9A9A9A]">Sign in to your Sewago account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-full bg-red-50 px-4 py-2 text-sm text-red-500">
              {error}
            </div>
          )}

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
