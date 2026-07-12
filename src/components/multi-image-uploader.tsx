"use client";

import { useState, useRef } from "react";
import { ImagePlus, X, Loader2, AlertCircle } from "lucide-react";

interface MultiImageUploaderProps {
  onUpload: (urls: string[]) => void;
  currentImages: string[];
  maxImages?: number;
}

export default function MultiImageUploader({ onUpload, currentImages, maxImages = 4 }: MultiImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [uploadingCount, setUploadingCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File): Promise<string | null> => {
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
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const remaining = maxImages - currentImages.length;
    const toUpload = files.slice(0, remaining);

    if (files.length > remaining) {
      setError(`Max ${maxImages} photos. Only ${remaining} more allowed.`);
    }

    const validFiles = toUpload.filter((f) => {
      if (f.size > 5 * 1024 * 1024) {
        setError(`${f.name} is too large. Max 5MB per file.`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setError("");
    setUploading(true);
    setUploadingCount(validFiles.length);

    const newUrls: string[] = [];
    for (const file of validFiles) {
      let url = await uploadToImageKit(file);
      if (!url) url = await uploadFile(file);
      if (url) newUrls.push(url);
    }

    if (newUrls.length > 0) {
      onUpload([...currentImages, ...newUrls]);
    }

    if (newUrls.length < validFiles.length) {
      setError("Some uploads failed. Please try again.");
    }

    setUploading(false);
    setUploadingCount(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (index: number) => {
    const updated = currentImages.filter((_, i) => i !== index);
    onUpload(updated);
  };

  return (
    <div className="flex flex-col gap-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleUpload}
        className="hidden"
        id="image-upload-multi"
      />

      <div className="flex flex-wrap gap-3">
        {currentImages.map((url, i) => (
          <div key={i} className="relative h-[120px] w-[120px]">
            <img src={url} alt={`Photo ${i + 1}`} className="h-full w-full rounded-[16px] object-cover" />
            <button
              type="button"
              onClick={() => removeImage(i)}
              className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow-md transition-colors hover:bg-red-600"
            >
              <X size={12} strokeWidth={3} />
            </button>
            {i === 0 && (
              <div className="absolute bottom-1 left-1 rounded-full bg-black/50 px-2 py-0.5 text-[9px] font-medium text-white">
                Main
              </div>
            )}
          </div>
        ))}

        {currentImages.length < maxImages && (
          <label
            htmlFor="image-upload-multi"
            className="flex h-[120px] w-[120px] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-[16px] border-2 border-dashed border-gray-200 bg-gray-50 transition-all hover:border-gray-400 hover:bg-gray-100"
          >
            {uploading ? (
              <Loader2 size={24} strokeWidth={1.5} className="animate-spin text-[#9A9A9A]" />
            ) : (
              <ImagePlus size={24} strokeWidth={1.5} className="text-[#9A9A9A]" />
            )}
            <span className="text-[10px] font-medium text-[#9A9A9A]">
              {uploading ? `Uploading ${uploadingCount}...` : `Add (${currentImages.length}/${maxImages})`}
            </span>
          </label>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-xs text-red-500">
          <AlertCircle size={14} />
          {error}
        </div>
      )}
    </div>
  );
}
