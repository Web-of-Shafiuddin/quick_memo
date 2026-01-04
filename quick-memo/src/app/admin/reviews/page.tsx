"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Star, Trash2, Store, Box } from "lucide-react";
import { toast } from "sonner";
import adminApi from "@/lib/adminApi";
import { format } from "date-fns";

interface Review {
  review_id: number;
  shop_id: number;
  shop_name: string;
  product_name: string | null;
  customer_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export default function ReviewsModerationPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await adminApi.get("/admin/reviews");
      setReviews(res.data.data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("Failed to fetch reviews");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    try {
      await adminApi.delete(`/admin/reviews/${reviewId}`);
      toast.success("Review deleted successfully");
      fetchReviews();
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error("Failed to delete review");
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Review Moderation</h1>
          <p className="text-slate-400">Manage shop and product reviews</p>
        </div>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            {loading ? (
              <div className="text-center py-10 text-slate-400">Loading...</div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-10 text-slate-400 italic">
                No reviews found
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700">
                    <TableHead className="text-slate-400">
                      Shop / Target
                    </TableHead>
                    <TableHead className="text-slate-400">Rating</TableHead>
                    <TableHead className="text-slate-400 w-[300px]">
                      Comment
                    </TableHead>
                    <TableHead className="text-slate-400">Date</TableHead>
                    <TableHead className="text-slate-400 text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reviews.map((review) => (
                    <TableRow
                      key={review.review_id}
                      className="border-slate-700"
                    >
                      <TableCell>
                        <div className="flex items-center gap-2 text-white font-medium">
                          <Store className="w-3 h-3 text-slate-500" />{" "}
                          {review.shop_name}
                        </div>
                        {review.product_name && (
                          <div className="flex items-center gap-2 text-xs text-blue-400 mt-1">
                            <Box className="w-3 h-3" /> {review.product_name}
                          </div>
                        )}
                        <div className="text-xs text-slate-500 mt-1">
                          By: {review.customer_name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < review.rating
                                  ? "fill-yellow-500 text-yellow-500"
                                  : "text-slate-600"
                              }`}
                            />
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-300 text-sm">
                        <p className="italic">&quot;{review.comment}&quot;</p>
                      </TableCell>
                      <TableCell className="text-slate-400 text-sm">
                        {format(new Date(review.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-500 hover:text-red-400 hover:bg-slate-700"
                          onClick={() => handleDeleteReview(review.review_id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
