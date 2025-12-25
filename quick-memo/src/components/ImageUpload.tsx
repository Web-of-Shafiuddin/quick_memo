"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { uploadService } from "@/services/uploadService";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  type?: "product" | "logo";
  label?: string;
  disabled?: boolean;
}

export const ImageUpload = ({
  value,
  onChange,
  type = "product",
  label = "Image",
  disabled = false,
}: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setUploading(true);
    try {
      const result =
        type === "product"
          ? await uploadService.uploadProductImage(file)
          : await uploadService.uploadShopLogo(file);

      onChange(result.url);
      toast.success("Image uploaded successfully");
    } catch (error: any) {
      console.error("Upload error:", error);
      const errorMessage =
        error.response?.data?.error || "Failed to upload image";

      // Check for subscription limit error
      if (error.response?.data?.code === "IMAGE_UPLOAD_NOT_ALLOWED") {
        toast.error(
          "Image upload is not available on your plan. Please upgrade to upload images."
        );
      } else if (error.response?.data?.code === "NO_SUBSCRIPTION") {
        toast.error("Please subscribe to a plan to upload images.");
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemove = () => {
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>

      {value ? (
        // Image preview
        <div className="relative w-full max-w-[200px]">
          <img
            src={value}
            alt="Preview"
            className="w-full h-auto rounded-lg border object-cover aspect-square"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6"
            onClick={handleRemove}
            disabled={disabled || uploading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        // Upload area
        <div
          className={`
            relative border-2 border-dashed rounded-lg p-6 transition-colors
            ${dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"}
            ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-primary/50"}
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleInputChange}
            className="hidden"
            disabled={disabled || uploading}
          />

          <div className="flex flex-col items-center justify-center text-center">
            {uploading ? (
              <>
                <Loader2 className="h-10 w-10 text-muted-foreground animate-spin mb-2" />
                <p className="text-sm text-muted-foreground">Uploading...</p>
              </>
            ) : (
              <>
                <div className="p-3 bg-muted rounded-full mb-2">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG, WEBP up to 5MB
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Manual URL input as fallback */}
      <div className="flex items-center gap-2 mt-2">
        <span className="text-xs text-muted-foreground">or</span>
        <Input
          type="url"
          placeholder="Paste image URL"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled || uploading}
          className="text-sm"
        />
      </div>
    </div>
  );
};
