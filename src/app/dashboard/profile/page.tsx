"use client";

import { useSession } from "next-auth/react";

export default function ProfilePage() {
  const { data: session } = useSession();
  const user = session?.user;
  const initial = user?.name?.charAt(0)?.toUpperCase() || "U";

  return (
    <div className="flex flex-col gap-6 p-2" style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}>
      <div>
        <h1 className="text-5xl font-normal text-[#202124]">Profile</h1>
        <p className="text-lg text-[#6B6B6B]">Manage your account settings.</p>
      </div>

      <div className="flex gap-5">
        <div className="w-[350px] flex flex-col items-center rounded-[24px] bg-white p-6 shadow-sm">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-300 text-3xl font-medium text-white">
            {initial}
          </div>
          <h2 className="mt-4 text-xl font-semibold text-[#202124]">{user?.name || "User"}</h2>
          <p className="text-sm text-[#9A9A9A]">{user?.email || ""}</p>
          <button className="mt-4 rounded-full border border-gray-200 px-5 py-2 text-sm font-medium text-[#6B6B6B] hover:bg-gray-50">
            Edit Photo
          </button>
        </div>

        <div className="flex-1 rounded-[24px] bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-[#202124]">Personal Information</h3>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-[#9A9A9A]">Full Name</label>
              <input
                type="text"
                defaultValue={user?.name || ""}
                className="w-full rounded-full border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#B8F25E] focus:ring-1 focus:ring-[#B8F25E]"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[#9A9A9A]">Email</label>
              <input
                type="email"
                defaultValue={user?.email || ""}
                className="w-full rounded-full border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#B8F25E] focus:ring-1 focus:ring-[#B8F25E]"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[#9A9A9A]">Phone</label>
              <input
                type="tel"
                placeholder="Not set"
                className="w-full rounded-full border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#B8F25E] focus:ring-1 focus:ring-[#B8F25E]"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[#9A9A9A]">Location</label>
              <input
                type="text"
                placeholder="Not set"
                className="w-full rounded-full border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#B8F25E] focus:ring-1 focus:ring-[#B8F25E]"
              />
            </div>
          </div>
          <button className="mt-6 rounded-full bg-[#B8F25E] px-6 py-3 text-sm font-semibold text-[#202124] hover:bg-[#a8e04e]">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
