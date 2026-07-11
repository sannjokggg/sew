"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MoreVertical, Eye, Pencil, Trash2, Share2, Check } from "lucide-react";
import ConfirmDialog from "@/components/confirm-dialog";

interface ThreeDotMenuProps {
  id: number;
  isOwner: boolean;
  shareUrl: string;
  onDelete: (id: number) => void;
  onEdit?: () => void;
  type?: string;
}

export default function ThreeDotMenu({ id, isOwner, shareUrl, onDelete, onEdit, type }: ThreeDotMenuProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setOpen(false);
      }, 1500);
    });
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setOpen(false);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    onDelete(id);
    setShowDeleteDialog(false);
  };

  const getItemLabel = () => {
    if (!type) return "this item";
    if (type === "Exchange" || type === "Giveaway" || type === "Request") return "this listing";
    return "this event";
  };

  return (
    <>
      <div className="relative" ref={ref}>
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(!open); }}
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
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); router.push(shareUrl); setOpen(false); }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
            >
              <Eye size={16} className="text-gray-400" />
              View Details
            </button>
            {isOwner && onEdit && (
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(); setOpen(false); }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
              >
                <Pencil size={16} className="text-gray-400" />
                Edit
              </button>
            )}
            {isOwner && (
              <button
                onClick={handleDeleteClick}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-50"
              >
                <Trash2 size={16} className="text-red-400" />
                Delete
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

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        title={`Delete ${getItemLabel()}?`}
        description="This action cannot be undone. Are you sure you want to permanently delete this?"
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </>
  );
}
