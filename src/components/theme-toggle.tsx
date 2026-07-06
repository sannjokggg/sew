"use client";

import { useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  return (
    <div className="flex w-[70px] flex-col items-center justify-center gap-1 rounded-[36px] bg-white py-2 shadow-sm">
      <button
        className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors ${
          !dark
            ? "bg-gray-100 text-gray-800"
            : "text-gray-400 hover:bg-gray-100 hover:text-gray-700"
        }`}
        onClick={() => setDark(false)}
        title="Light mode"
      >
        <Sun size={22} />
      </button>
      <button
        className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors ${
          dark
            ? "bg-gray-100 text-gray-800"
            : "text-gray-400 hover:bg-gray-100 hover:text-gray-700"
        }`}
        onClick={() => setDark(true)}
        title="Dark mode"
      >
        <Moon size={22} />
      </button>
    </div>
  );
}
