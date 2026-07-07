"use client";

import { useState } from "react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setName("");
    setEmail("");
    setMessage("");
  };

  return (
    <div className="flex flex-col gap-6 p-2" style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}>
      <div>
        <h1 className="text-5xl font-normal text-[#202124]">Contact Us</h1>
        <p className="text-lg text-[#6B6B6B]">Get in touch with our team.</p>
      </div>

      <div className="flex gap-5">
        <div className="flex w-[350px] flex-col gap-4">
          <div className="rounded-[24px] bg-white p-6 shadow-sm">
            <span className="text-sm font-medium text-[#9A9A9A]">Email</span>
            <p className="mt-1 text-[#202124]">support@sewago.com</p>
          </div>
          <div className="rounded-[24px] bg-white p-6 shadow-sm">
            <span className="text-sm font-medium text-[#9A9A9A]">Phone</span>
            <p className="mt-1 text-[#202124]">+91 98765 43210</p>
          </div>
          <div className="rounded-[24px] bg-white p-6 shadow-sm">
            <span className="text-sm font-medium text-[#9A9A9A]">Address</span>
            <p className="mt-1 text-[#202124]">123 Sewago Lane, Mumbai, India</p>
          </div>
        </div>

        <div className="flex-1 rounded-[24px] bg-white p-6 shadow-sm">
          {submitted ? (
            <div className="flex flex-col items-center justify-center py-10">
              <p className="text-2xl font-semibold text-[#202124]">Thank you!</p>
              <p className="mt-2 text-sm text-[#6B6B6B]">We&apos;ll get back to you soon.</p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-4 rounded-full bg-[#B8F25E] px-5 py-2 text-sm font-semibold text-[#202124] hover:bg-[#a8e04e]"
              >
                Send Another
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-[#202124]">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-full border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#B8F25E] focus:ring-1 focus:ring-[#B8F25E]"
                  placeholder="Your name"
                  required
                />
              </div>
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
                <label className="mb-1 block text-sm font-medium text-[#202124]">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#B8F25E] focus:ring-1 focus:ring-[#B8F25E]"
                  rows={5}
                  placeholder="How can we help?"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-full bg-[#B8F25E] px-4 py-3 text-sm font-semibold text-[#202124] hover:bg-[#a8e04e]"
              >
                Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
