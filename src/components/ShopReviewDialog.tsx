"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star, CheckCircle, MessageSquare } from "lucide-react";
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

interface ShopReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slug: string;
  shopName: string;
  onReviewSubmitted?: () => void;
}

export function ShopReviewDialog({
  open,
  onOpenChange,
  slug,
  shopName,
  onReviewSubmitted,
}: ShopReviewDialogProps) {
  const router = useRouter();
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [customerMobile, setCustomerMobile] = useState<string>("");
  const [transactionId, setTransactionId] = useState<number | null>(null);
  const [eligible, setEligible] = useState<boolean | null>(null);
  const [ordersNeeded, setOrdersNeeded] = useState<number>(2);
  const [checkingEligibility, setCheckingEligibility] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerMobile.trim()) {
      toast.error("Please enter your mobile number");
      return;
    }

    if (!transactionId) {
      toast.error("Please select an order");
      return;
    }

    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setLoading(true);

    try {
      await api.post(`/shop/${slug}/review`, {
        transaction_id: transactionId,
        product_id: null, // Shop review
        rating,
        comment: comment.trim() || null,
      });

      setSubmitted(true);
      toast.success("Shop review submitted successfully!");

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

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomerMobile(e.target.value);
    setEligible(null);
    setTransactionId(null);
  };

  const handleMobileBlur = async () => {
    if (!customerMobile.trim() || customerMobile.length < 5) return;

    setCheckingEligibility(true);
    setEligible(null);

    try {
      const eligibilityRes = await api.get(`/shop/${slug}/check-review-eligibility`, {
        params: { mobile_number: customerMobile.trim() },
      });

      const eligibilityData = eligibilityRes.data;
      setEligible(eligibilityData.can_review);
      setOrdersNeeded(eligibilityData.orders_needed);

      if (!eligibilityData.can_review) {
        toast.error(eligibilityData.message);
        setTransactionId(null);
      } else {
        toast.success(eligibilityData.message);
        const ordersRes = await api.get(`/shop/${slug}/orders`, {
          params: { customer_mobile: customerMobile.trim() },
        });
        const deliveredOrders = ordersRes.data.data.filter(
          (order: any) => order.order_status === "DELIVERED"
        );
        if (deliveredOrders.length > 0) {
          setTransactionId(deliveredOrders[0].transaction_id);
        } else {
          setTransactionId(null);
        }
      }
    } catch (error) {
      console.error("Error checking eligibility:", error);
      toast.error("Failed to check eligibility");
    } finally {
      setCheckingEligibility(false);
    }
  };

  const handleClose = () => {
    setSubmitted(false);
    setRating(0);
    setComment("");
    setCustomerMobile("");
    setTransactionId(null);
    setEligible(null);
    setOrdersNeeded(2);
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
          <DialogTitle>Write a Shop Review</DialogTitle>
          <DialogDescription>
            Share your overall experience with {shopName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6 py-4">
            {/* Disclaimer */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-900 font-medium mb-1">
                ⚠️ Shop Review Requirements
              </p>
              <p className="text-sm text-blue-700">
                You must have placed at least <strong>2 orders</strong> before
                writing a shop review. This helps ensure you have a comprehensive
                understanding of our services.
              </p>
            </div>

            {/* Customer Mobile */}
            <div className="space-y-2">
              <Label htmlFor="customerMobile">Your Mobile Number</Label>
              <Input
                id="customerMobile"
                type="tel"
                placeholder="Enter your mobile number"
                value={customerMobile}
                onChange={handleMobileChange}
                onBlur={handleMobileBlur}
                disabled={loading || checkingEligibility}
              />
              <p className="text-xs text-muted-foreground">
                Enter mobile number used when placing your orders
              </p>
              {checkingEligibility && (
                <p className="text-xs text-muted-foreground">Checking eligibility...</p>
              )}
            </div>

            {/* Eligibility Check Result */}
            {eligible === false && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-900 font-medium mb-2">
                  You need {ordersNeeded} more order(s) to review this shop
                </p>
                <p className="text-sm text-amber-700 mb-3">
                  Shop reviews require at least 2 delivered orders.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => router.push(`/s/${slug}/reviews`)}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  View Shop Reviews
                </Button>
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
                placeholder="Share your overall experience with this shop..."
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
              disabled={loading || !transactionId || rating === 0 || eligible !== true}
            >
              {loading ? "Submitting..." : "Submit Review"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
