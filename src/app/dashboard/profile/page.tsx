"use client";

import { useSession } from "next-auth/react";

export default function ProfilePage() {
  const { data: session } = useSession();
  const user = session?.user;
  const initial = user?.name?.charAt(0)?.toUpperCase() || "U";

  return (
    <div className="flex flex-col gap-6 p-2" style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}>
      <div>
        <h1 className="text-3xl lg:text-5xl font-normal text-text-primary">Profile</h1>
        <p className="text-lg text-text-secondary">Manage your account settings.</p>
      </div>

      <div className="flex gap-5">
        <div className="w-[350px] flex flex-col items-center rounded-[24px] bg-surface p-6 shadow-sm">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-300 text-3xl font-medium text-white">
            {initial}
          </div>
          <h2 className="mt-4 text-xl font-semibold text-text-primary">{user?.name || "User"}</h2>
          <p className="text-sm text-text-muted">{user?.email || ""}</p>
          <button className="mt-4 rounded-full border border-border-default px-5 py-2 text-base font-medium text-text-secondary hover:bg-surface-alt">
            Edit Photo
          </button>
        </div>

        <div className="flex-1 rounded-[24px] bg-surface p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-text-primary">Personal Information</h3>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-lg font-medium text-text-muted">Full Name</label>
              <input
                type="text"
                defaultValue={user?.name || ""}
                className="w-full rounded-full border border-border-default px-4 py-3 text-lg outline-none focus:border-gray-300 focus:ring-1 focus:ring-gray-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-lg font-medium text-text-muted">Email</label>
              <input
                type="email"
                defaultValue={user?.email || ""}
                className="w-full rounded-full border border-border-default px-4 py-3 text-lg outline-none focus:border-gray-300 focus:ring-1 focus:ring-gray-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-lg font-medium text-text-muted">Phone</label>
              <input
                type="tel"
                placeholder="Not set"
                className="w-full rounded-full border border-border-default px-4 py-3 text-lg outline-none focus:border-gray-300 focus:ring-1 focus:ring-gray-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-lg font-medium text-text-muted">Location</label>
              <input
                type="text"
                placeholder="Not set"
                className="w-full rounded-full border border-border-default px-4 py-3 text-lg outline-none focus:border-gray-300 focus:ring-1 focus:ring-gray-100"
              />
            </div>
          </div>
          <button className="mt-6 rounded-full bg-accent px-6 py-3 text-lg font-semibold text-text-primary ">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
