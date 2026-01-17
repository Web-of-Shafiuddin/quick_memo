"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { uploadService } from "@/services/uploadService";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface MultipleImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  label?: string;
  disabled?: boolean;
}

export const MultipleImageUpload = ({
  value,
  onChange,
  label = "Images",
  disabled = false,
}: MultipleImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList) => {
    if (!files || files.length === 0) return;

    const currentImageCount = value.length;
    const newFilesCount = files.length;

    if (currentImageCount + newFilesCount > 5) {
      toast.error(`You can upload maximum 5 images. You currently have ${currentImageCount} images.`);
      return;
    }

    const validFiles = Array.from(files).filter((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error(`"${file.name}" is not an image file`);
        return false;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error(`"${file.name}" is too large (max 5MB)`);
        return false;
      }

      return true;
    });

    if (validFiles.length === 0) return;

    setUploading(true);
    try {
      const results = await uploadService.uploadVerificationImages(validFiles);

      const response = results as any;

      if (response.verification_images) {
        onChange(response.verification_images);
      } else {
        const newUrls = results.map((r) => r.url);
        onChange([...value, ...newUrls]);
      }

      toast.success(`${results.length} image(s) uploaded successfully`);
    } catch (error: any) {
      console.error("Upload error:", error);
      const errorMessage =
        error.response?.data?.error || "Failed to upload images";
      toast.error(errorMessage);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileSelect(e.target.files);
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

    if (e.dataTransfer.files) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleRemove = (index: number) => {
    const newUrls = value.filter((_, i) => i !== index);
    onChange(newUrls);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        {value.length > 0 && (
          <span className="text-xs text-muted-foreground">
            {value.length}/5 images
          </span>
        )}
      </div>

      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {value.map((url, index) => (
            <div key={index} className="relative group">
              <div className="relative w-full aspect-square rounded-lg overflow-hidden border bg-muted">
                <img
                  src={url}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleRemove(index)}
                  disabled={disabled || uploading}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}

          {value.length < 5 && !disabled && !uploading && (
            <div
              className={`
                relative border-2 border-dashed rounded-lg transition-colors cursor-pointer
                ${dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"}
              `}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleInputChange}
                className="hidden"
                disabled={disabled || uploading}
              />

              <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                <p className="text-xs font-medium">Add Image</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {5 - value.length} remaining
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {value.length === 0 && (
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
            multiple
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
                  PNG, JPG, WEBP up to 5MB each (max 5 images)
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {value.length === 5 && (
        <p className="text-xs text-muted-foreground">
          Maximum limit of 5 images reached. Remove an image to upload more.
        </p>
      )}
    </div>
  );
};
