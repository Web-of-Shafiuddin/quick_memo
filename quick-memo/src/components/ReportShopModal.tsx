"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import api from "@/lib/api";

export function ReportShopModal({ slug }: { slug: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_mobile: "",
    customer_email: "",
    reason: "",
  });

  useEffect(() => {
    const handleOpen = () => setOpen(true);
    window.addEventListener("open-report-modal", handleOpen);
    return () => window.removeEventListener("open-report-modal", handleOpen);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.customer_name ||
      !formData.customer_mobile ||
      !formData.customer_email ||
      !formData.reason
    ) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      await api.post(`/shop/${slug}/report`, formData);
      toast.success(
        "Thank you for your report. We will investigate this shop."
      );
      setOpen(false);
      setFormData({
        customer_name: "",
        customer_mobile: "",
        customer_email: "",
        reason: "",
      });
    } catch (error: unknown) {
      console.error("Error reporting shop:", error);
      toast.error("Failed to submit report. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Report this Shop</DialogTitle>
          <DialogDescription>
            Use this form if you suspect this shop is a scam or has failed to
            deliver products.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="customer_name">Your Name</Label>
            <Input
              id="customer_name"
              placeholder="Full Name"
              value={formData.customer_name}
              onChange={(e) =>
                setFormData({ ...formData, customer_name: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="customer_mobile">Mobile Number</Label>
            <Input
              id="customer_mobile"
              placeholder="01XXXXXXXXX"
              value={formData.customer_mobile}
              onChange={(e) =>
                setFormData({ ...formData, customer_mobile: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="customer_email">Email Address</Label>
            <Input
              id="customer_email"
              type="email"
              placeholder="email@example.com"
              value={formData.customer_email}
              onChange={(e) =>
                setFormData({ ...formData, customer_email: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Reporting</Label>
            <Textarea
              id="reason"
              placeholder="Please describe the issue (e.g., Non-delivery after payment)"
              value={formData.reason}
              onChange={(e) =>
                setFormData({ ...formData, reason: e.target.value })
              }
              rows={4}
              required
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="destructive" disabled={loading}>
              {loading ? "Submitting..." : "Submit Report"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
