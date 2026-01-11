"use client";

import { useState } from "react";
import { Star, CheckCircle, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import api from "@/lib/api";
import { format } from "date-fns";

interface ProductReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slug: string;
  product: {
    product_id: number;
    name: string;
  };
  onReviewSubmitted?: () => void;
}

export function ProductReviewDialog({
  open,
  onOpenChange,
  slug,
  product,
  onReviewSubmitted,
}: ProductReviewDialogProps) {
  const [verificationResult, setVerificationResult] = useState<{
    has_ordered: boolean;
    transaction_id?: number;
    customer_name?: string;
    order_date?: string;
    product_name?: string;
  } | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [customerMobile, setCustomerMobile] = useState<string>("");

  const handleMobileBlur = async () => {
    if (!customerMobile.trim() || customerMobile.length < 5) return;

    setVerifying(true);
    setVerificationResult(null);

    try {
      const res = await api.post(`/shop/${slug}/verify-product-order`, {
        mobile_number: customerMobile.trim(),
        product_id: product.product_id,
      });

      setVerificationResult(res.data);
      if (!res.data.has_ordered) {
        toast.error(
          "We couldn't find this product in your delivered orders. Please check your mobile number."
        );
      }
    } catch (error: any) {
      console.error("Verification failed:", error);
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error("Failed to verify your order");
      }
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setLoading(true);

    try {
      await api.post(`/shop/${slug}/review`, {
        transaction_id: verificationResult!.transaction_id,
        product_id: product.product_id,
        rating,
        comment: comment.trim() || null,
      });

      setSubmitted(true);
      toast.success("Review submitted successfully!");

      setTimeout(() => {
        onReviewSubmitted?.();
        handleClose();
      }, 1500);
    } catch (error: any) {
      console.error("Error submitting review:", error);
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error("Failed to submit review");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSubmitted(false);
    setRating(0);
    setComment("");
    setCustomerMobile("");
    setVerificationResult(null);
    onOpenChange(false);
  };

  if (submitted) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <DialogTitle className="text-center">Review Submitted!</DialogTitle>
            <DialogDescription className="text-center mt-2">
              Thank you for sharing your experience
            </DialogDescription>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Write a Review</DialogTitle>
          <DialogDescription>
            Verify your order to review {product.name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6 py-4">
            {/* Customer Mobile */}
            <div className="space-y-2">
              <Label htmlFor="customerMobile">Your Mobile Number</Label>
              <Input
                id="customerMobile"
                type="tel"
                placeholder="Enter your mobile number"
                value={customerMobile}
                onChange={(e) => setCustomerMobile(e.target.value)}
                onBlur={handleMobileBlur}
                disabled={verifying}
              />
              <p className="text-xs text-muted-foreground">
                Enter the mobile number used when placing your order
              </p>
              {verifying && (
                <p className="text-xs text-primary animate-pulse">
                  Verifying your order...
                </p>
              )}
            </div>

            {/* Verification Status */}
            {verificationResult?.has_ordered && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-green-900 mb-1">
                      Order Verified!
                    </p>
                    <p className="text-sm text-green-700">
                      {verificationResult.product_name}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {verificationResult?.has_ordered === false && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-red-900 mb-1">
                      Order Not Found
                    </p>
                    <p className="text-sm text-red-700">
                      We couldn't find this product in your delivered orders.
                      Please check your mobile number.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Order Details - shown when verified */}
            {verificationResult?.has_ordered && verificationResult.order_date && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Order:</span>
                  <span className="font-medium">
                    #{verificationResult.transaction_id}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Date:</span>
                  <span className="font-medium">
                    {format(new Date(verificationResult.order_date), "MMM d, yyyy")}
                  </span>
                </div>
              </div>
            )}

            {/* Star Rating */}
            <div className="space-y-2">
              <Label>Rating *</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="p-1 hover:scale-110 transition-transform"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= (hoverRating || rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-sm text-muted-foreground">
                  {rating === 1 && "Poor"}
                  {rating === 2 && "Fair"}
                  {rating === 3 && "Good"}
                  {rating === 4 && "Very Good"}
                  {rating === 5 && "Excellent"}
                </p>
              )}
            </div>

            {/* Comment */}
            <div className="space-y-2">
              <Label htmlFor="comment">Comment (Optional)</Label>
              <Textarea
                id="comment"
                placeholder="Share your experience with this product..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                maxLength={1000}
              />
              <p className="text-xs text-muted-foreground text-right">
                {comment.length}/1000
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !verificationResult?.has_ordered || rating === 0}
            >
              {loading ? "Submitting..." : "Submit Review"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
