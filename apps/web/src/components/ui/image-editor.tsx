"use client";

import React, { useRef, useEffect, useState } from "react";
import { Cropper, CropperRef } from "react-advanced-cropper";
import "react-advanced-cropper/dist/style.css";

import Modal from "@/components/ui/modal";
import { Button } from "@/components/ui/new-button";

export interface ImageEditorProps {
  /** Show / hide modal */
  open: boolean;
  /** Image source – File URL, data-URI, whatever <img> accepts */
  src?: string;
  /** Emit processed file */
  onSave: (file: File) => void;
  /** Called when user closes the modal (either Cancel or after Save) */
  onClose: () => void;
  /** Fixed crop aspect ratio, e.g. 1 (square), 16 / 9, omit for free-form */
  aspectRatio?: number;
  /** Canvas size restriction. Defaults 2048×2048. */
  maxWidth?: number;
  maxHeight?: number;
}

// Default canvas size limits (avoid megabyte bitmaps)
const DEFAULT_CANVAS_LIMIT = 2048;

export function ImageEditor({
  open,
  src,
  onSave,
  onClose,
  aspectRatio,
  maxWidth = DEFAULT_CANVAS_LIMIT,
  maxHeight = DEFAULT_CANVAS_LIMIT,
}: ImageEditorProps) {
  const cropperRef = useRef<CropperRef>(null);

  const [size, setSize] = useState<{ w: number; h: number } | undefined>();

  // Measure image once to fit cropper exactly and avoid empty gray areas
  useEffect(() => {
    if (!src) return;
    const img = new Image();

    const handleLoad = () => {
      if (img.naturalWidth && img.naturalHeight) {
        setSize({ w: img.naturalWidth, h: img.naturalHeight });
      }
    };

    img.addEventListener("load", handleLoad);
    img.src = src;

    return () => {
      img.removeEventListener("load", handleLoad);
    };
  }, [src]);

  if (!open || !src || !size) return;
  
  function handleSave() {
    const cropper = cropperRef.current;
    if (!cropper) return;

    const canvas = cropper.getCanvas({ maxWidth, maxHeight });
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], "image.jpeg", { type: blob.type || "image/jpeg" });
      onSave(file);
      onClose();
    }, "image/jpeg");
  }

  return (
    <Modal onClose={onClose} size="lg" hideCloseButton>
      <div className="">
        <Cropper
          ref={cropperRef}
          src={src}
          stencilProps={{
            aspectRatio: aspectRatio ?? undefined,
            grid: true,
            overlayClassName: "bg-transparent"
          }}
          className="mx-auto max-w-[90vw] max-h-[75vh] bg-transparent"
          backgroundClassName="bg-transparent"
        />

        <div className="flex justify-end gap-2">
          <Button type="text" size="small" onClick={onClose}>
            Cancel
          </Button>
          <Button size="small" onClick={handleSave}>
            Save
          </Button>
        </div>
      </div>
    </Modal>
  );
} 