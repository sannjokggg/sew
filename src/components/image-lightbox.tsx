"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { X, ZoomIn, ZoomOut, RotateCcw, Move } from "lucide-react";

interface ImageLightboxProps {
  src: string;
  alt: string;
  onClose: () => void;
}

export default function ImageLightbox({ src, alt, onClose }: ImageLightboxProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLImageElement>(null);

  const minScale = 1;
  const maxScale = 5;

  const handleZoomIn = useCallback(() => {
    setScale((prev) => Math.min(prev + 0.5, maxScale));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale((prev) => {
      const newScale = Math.max(prev - 0.5, minScale);
      if (newScale === minScale) {
        setPosition({ x: 0, y: 0 });
      }
      return newScale;
    });
  }, []);

  const handleReset = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.2 : 0.2;
      setScale((prev) => {
        const newScale = Math.min(Math.max(prev + delta, minScale), maxScale);
        if (newScale === minScale) {
          setPosition({ x: 0, y: 0 });
        }
        return newScale;
      });
    },
    []
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (scale <= 1) return;
      e.preventDefault();
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    },
    [scale, position]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      setPosition({ x: newX, y: newY });
    },
    [isDragging, dragStart]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setLastPosition(position);
  }, [position]);

  const handleDoubleClick = useCallback(() => {
    if (scale > 1) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    } else {
      setScale(2.5);
    }
  }, [scale]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "+" || e.key === "=") handleZoomIn();
      if (e.key === "-") handleZoomOut();
      if (e.key === "0") handleReset();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, handleZoomIn, handleZoomOut, handleReset]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      onClick={onClose}
      onWheel={handleWheel}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute right-5 top-5 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/30"
      >
        <X size={24} />
      </button>

      {/* Zoom Controls */}
      <div className="absolute right-5 top-20 z-10 flex flex-col gap-2">
        <button
          onClick={(e) => { e.stopPropagation(); handleZoomIn(); }}
          disabled={scale >= maxScale}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ZoomIn size={20} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); handleZoomOut(); }}
          disabled={scale <= minScale}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ZoomOut size={20} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); handleReset(); }}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/30"
        >
          <RotateCcw size={20} />
        </button>
      </div>

      {/* Zoom Level Indicator */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 rounded-full bg-white/20 px-4 py-2 text-sm text-white">
        {Math.round(scale * 100)}%
      </div>

      {/* Pan Hint */}
      {scale > 1 && (
        <div className="absolute bottom-5 right-5 z-10 flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm text-white">
          <Move size={14} />
          Drag to pan
        </div>
      )}

      {/* Image */}
      <img
        ref={imageRef}
        src={src}
        alt={alt}
        className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain select-none"
        style={{
          transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
          cursor: scale > 1 ? (isDragging ? "grabbing" : "grab") : "zoom-in",
          transition: isDragging ? "none" : "transform 0.2s ease-out",
        }}
        onClick={(e) => {
          e.stopPropagation();
          handleDoubleClick();
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        draggable={false}
      />
    </div>
  );
}
