"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MoreVertical, Eye, Pencil, Trash2, Share2, Check } from "lucide-react";

interface ThreeDotMenuProps {
  id: number;
  isOwner: boolean;
  shareUrl: string;
  onDelete: (id: number) => void;
  onEdit?: () => void;
}

export default function ThreeDotMenu({ id, isOwner, shareUrl, onDelete, onEdit }: ThreeDotMenuProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setConfirmDelete(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleShare = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setOpen(false);
      }, 1500);
    });
  };

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    onDelete(id);
    setOpen(false);
    setConfirmDelete(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(!open); setConfirmDelete(false); }}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-sm transition-colors hover:bg-white"
      >
        <MoreVertical size={16} className="text-gray-600" />
      </button>
      {open && (
        <div
          className="absolute right-0 top-10 z-50 w-44 rounded-2xl bg-white border border-gray-200 py-2 shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => { router.push(shareUrl); setOpen(false); }}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
          >
            <Eye size={16} className="text-gray-400" />
            View Details
          </button>
          {isOwner && onEdit && (
            <button
              onClick={() => { onEdit(); setOpen(false); }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
            >
              <Pencil size={16} className="text-gray-400" />
              Edit
            </button>
          )}
          {isOwner && (
            <button
              onClick={handleDelete}
              className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                confirmDelete ? "bg-red-50 text-red-600 font-semibold" : "text-red-600 hover:bg-red-50"
              }`}
            >
              <Trash2 size={16} className="text-red-400" />
              {confirmDelete ? "Confirm Delete?" : "Delete"}
            </button>
          )}
          <div className="mx-3 my-1 border-t border-gray-100" />
          <button
            onClick={handleShare}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
          >
            {copied ? <Check size={16} className="text-green-500" /> : <Share2 size={16} className="text-gray-400" />}
            {copied ? "Link copied!" : "Share"}
          </button>
        </div>
      )}
    </div>
  );
}
