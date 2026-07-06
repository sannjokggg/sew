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

    try {
      const authRes = await fetch("/api/imagekit");
      const auth = await authRes.json();

      if (auth.error) {
        setError("Upload config error");
        setUploading(false);
        return;
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileName", `sewago-${Date.now()}-${file.name}`);
      formData.append("publicKey", process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "");
      formData.append("signature", auth.signature);
      formData.append("expire", auth.expire.toString());
      formData.append("token", auth.token);

      const uploadRes = await fetch(
        "https://upload.imagekit.io/api/v1/files/upload",
        { method: "POST", body: formData }
      );

      const data = await uploadRes.json();

      if (data.url) {
        onUpload(data.url);
        setPreview(data.url);
      } else {
        console.error("ImageKit upload failed:", JSON.stringify(data));
        setError(data.error?.message || data.error || "Upload failed — check ImageKit config");
        setPreview("");
      }
    } catch (err) {
      console.error("Upload failed:", err);
      setError("Upload failed. Check your connection.");
      setPreview("");
    } finally {
      setUploading(false);
    }
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
          className="flex h-[160px] w-[160px] cursor-pointer flex-col items-center justify-center gap-2 rounded-[20px] border-2 border-dashed border-gray-200 bg-gray-50 transition-all hover:border-[#B8F25E] hover:bg-[#B8F25E]/5"
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
