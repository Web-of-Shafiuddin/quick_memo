"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, ArrowLeft, MessageSquare } from "lucide-react";
import api from "@/lib/api";
import { format } from "date-fns";
import { ShopReviewDialog } from "@/components/ShopReviewDialog";

interface Review {
  review_id: number;
  customer_name: string;
  rating: number;
  comment: string;
  created_at: string;
  order_date: string;
}

export default function ReviewsPage() {
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [shopName, setShopName] = useState<string>("");
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);

  useEffect(() => {
    const fetchShopInfo = async () => {
      try {
        const shopRes = await api.get(`/shop/${slug}`);
        setShopName(shopRes.data.data.shop_name);
      } catch (error) {
        console.error("Error fetching shop info:", error);
      }
    };

    const fetchReviews = async () => {
      try {
        const res = await api.get(`/shop/${slug}/reviews`);
        setReviews(res.data.data);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchShopInfo();
    fetchReviews();
  }, [slug]);

  const handleReviewSubmitted = async () => {
    if (!slug) return;
    try {
      const res = await api.get(`/shop/${slug}/reviews`);
      setReviews(res.data.data);
    } catch (error) {
      console.error("Error refreshing reviews:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Store Reviews</h1>
        </div>
        <Button
          variant="outline"
          onClick={() => setReviewDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <Star className="w-4 h-4" />
          Write Shop Review
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : reviews.length === 0 ? (
        <Card className="text-center py-20 border-dashed">
          <CardContent>
            <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground opacity-20 mb-4" />
            <h3 className="text-lg font-medium">No reviews yet</h3>
            <p className="text-muted-foreground text-sm">
              Be the first to leave a review after your order is delivered!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {reviews.map((review) => (
            <Card key={review.review_id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {review.customer_name}
                    </CardTitle>
                    <div className="flex items-center gap-1 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground text-right">
                    <p>
                      Ordered:{" "}
                      {format(new Date(review.order_date), "MMM d, yyyy")}
                    </p>
                    <p>
                      Reviewed:{" "}
                      {format(new Date(review.created_at), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed italic">
                  &quot;{review.comment}&quot;
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Shop Review Dialog */}
      {shopName && (
        <ShopReviewDialog
          open={reviewDialogOpen}
          onOpenChange={setReviewDialogOpen}
          slug={slug}
          shopName={shopName}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}
    </div>
  );
}
