"use client";

import { useState, useRef } from "react";
import { ImagePlus, X, Loader2, AlertCircle } from "lucide-react";

interface ImageUploaderProps {
  onUpload: (url: string) => void;
  currentImage?: string;
}

export default function ImageUploader({ onUpload, currentImage }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string>(currentImage || "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadToLocal = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    return data.url || null;
  };

  const uploadToImageKit = async (file: File): Promise<string | null> => {
    try {
      const authRes = await fetch("/api/imagekit");
      const auth = await authRes.json();
      if (auth.error) return null;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileName", `sewago-${Date.now()}-${file.name}`);
      formData.append("publicKey", process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "");
      formData.append("signature", auth.signature);
      formData.append("expire", auth.expire.toString());
      formData.append("token", auth.token);

      const uploadRes = await fetch("https://upload.imagekit.io/api/v1/files/upload", { method: "POST", body: formData });
      const data = await uploadRes.json();
      return data.url || null;
    } catch {
      return null;
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("File too large. Max 5MB.");
      return;
    }

    setError("");
    setPreview(URL.createObjectURL(file));
    setUploading(true);

    let url = await uploadToImageKit(file);
    if (!url) url = await uploadToLocal(file);

    if (url) {
      onUpload(url);
      setPreview(url);
    } else {
      setError("Upload failed. Please try again.");
      setPreview("");
    }

    setUploading(false);
  };

  const removeImage = () => {
    setPreview("");
    setError("");
    onUpload("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="flex flex-col gap-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
        id="image-upload"
      />

      {preview ? (
        <div className="relative h-[160px] w-[160px]">
          <img
            src={preview}
            alt="Preview"
            className="h-full w-full rounded-[20px] object-cover"
          />
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center rounded-[20px] bg-black/40">
              <Loader2 size={24} className="animate-spin text-white" />
            </div>
          )}
          <button
            type="button"
            onClick={removeImage}
            className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-md transition-colors hover:bg-red-600"
          >
            <X size={14} strokeWidth={3} />
          </button>
        </div>
      ) : (
        <label
          htmlFor="image-upload"
          className="flex h-[160px] w-[160px] cursor-pointer flex-col items-center justify-center gap-2 rounded-[20px] border-2 border-dashed border-gray-200 bg-gray-50 transition-all hover:border-gray-400 hover:bg-gray-100"
        >
          {uploading ? (
            <Loader2 size={28} strokeWidth={1.5} className="animate-spin text-[#9A9A9A]" />
          ) : (
            <ImagePlus size={28} strokeWidth={1.5} className="text-[#9A9A9A]" />
          )}
          <span className="text-xs font-medium text-[#9A9A9A]">
            {uploading ? "Uploading..." : "Add Photo"}
          </span>
        </label>
      )}

      {error && (
        <div className="flex items-center gap-2 text-xs text-red-500">
          <AlertCircle size={14} />
          {error}
        </div>
      )}
    </div>
  );
}
