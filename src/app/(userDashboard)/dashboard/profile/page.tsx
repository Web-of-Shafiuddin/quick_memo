"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CurrencySelector } from "@/components/CurrencySelector";
import { ImageUpload } from "@/components/ImageUpload";
import { MultipleImageUpload } from "@/components/MultipleImageUpload";
import { userService } from "@/services/userService";
import useAuthStore from "@/store/authStore";
import { useShallow } from "zustand/react/shallow";
import {
  Save,
  Store,
  User as UserIcon,
  DollarSign,
  ExternalLink,
  Copy,
  RefreshCw,
  Facebook,
  Instagram,
  Send,
  Plus,
  Trash2,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

const ProfilePage = () => {
  const { user } = useAuthStore(
    useShallow((state) => ({
      user: state.user,
    })),
  );
console.log("user: ", user)
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    preferred_currency: "USD",
    shop_name: "",
    shop_owner_name: "",
    shop_mobile: "",
    shop_email: "",
    shop_address: "",
    shop_logo_url: "",
    shop_slug: "",
    
    shop_description: "",
    nid_license_url: "",
    verification_images: [] as string[],
    social_links: [] as { platform: string; url: string }[],
  });

  useEffect(() => {
    if (user) {
      // First, populate with data from auth store
      setFormData({
        name: user.name || "",
        email: user.email || "",
        mobile: user.mobile || "",
        preferred_currency: user.preferred_currency || "USD",
        shop_name: user.shop_name || "",
        shop_slug: user.shop_slug || "",
        shop_owner_name: user.shop_owner_name || "",
        shop_mobile: user.shop_mobile || "",
        shop_email: user.shop_email || "",
        shop_address: user.shop_address || "",
        shop_logo_url: user.shop_logo_url || "",
        shop_description: user.shop_description || "",
        nid_license_url: user.nid_license_url || "",
        verification_images: Array.isArray(user.verification_images)
          ? user.verification_images
          : [],
        social_links: Array.isArray(user.social_links) ? user.social_links : [],
      });

      // Then fetch fresh data from API
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user?.user_id) return;

    try {
      const response = await userService.getById(user.user_id.toString());
      const userData = response.data;

      setFormData({
        name: userData.name || "",
        email: userData.email || "",
        mobile: userData.mobile || "",
        preferred_currency: userData.preferred_currency || "USD",
        shop_name: userData.shop_name || "",
        shop_slug: userData.shop_slug || "",
        shop_owner_name: userData.shop_owner_name || "",
        shop_mobile: userData.shop_mobile || "",
        shop_email: userData.shop_email || "",
        shop_address: userData.shop_address || "",
        shop_logo_url: userData.shop_logo_url || "",
        shop_description: userData.shop_description || "",
        nid_license_url: userData.nid_license_url || "",
        is_verified: userData.is_verified,
        verification_images: Array.isArray(userData.verification_images)
          ? userData.verification_images
          : [],
        social_links: Array.isArray(userData.social_links)
          ? userData.social_links
          : [],
      });
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      toast.error(error.response?.data?.error || "Failed to fetch profile");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.user_id) return;

    try {
      setLoading(true);
      await userService.update(user.user_id.toString(), formData);
      toast.success("Profile updated successfully");

      // Update the auth store with new user data
      const response = await userService.getById(user.user_id.toString());
      useAuthStore.setState({ user: response.data });
      localStorage.setItem("user", JSON.stringify(response.data));
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.error || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const generateSlug = () => {
    if (!formData.shop_name) {
      toast.error("Please enter a Shop Name first");
      return;
    }
    const newSlug = formData.shop_name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setFormData({ ...formData, shop_slug: newSlug });
  };

  const copyShopLink = () => {
    if (!formData.shop_slug) {
      toast.error("No shop link to copy");
      return;
    }
    const url = `${window.location.origin}/shop/${formData.shop_slug}`;
    navigator.clipboard.writeText(url);
    toast.success("Shop link copied!");
  };

  const addSocialLink = () => {
    setFormData({
      ...formData,
      social_links: [
        ...formData.social_links,
        { platform: "facebook", url: "" },
      ],
    });
  };

  const removeSocialLink = (index: number) => {
    const newLinks = [...formData.social_links];
    newLinks.splice(index, 1);
    setFormData({ ...formData, social_links: newLinks });
  };

  const updateSocialLink = (index: number, field: string, value: string) => {
    const newLinks = [...formData.social_links];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setFormData({ ...formData, social_links: newLinks });
  };

  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "facebook":
        return <Facebook className="h-4 w-4" />;
      case "instagram":
        return <Instagram className="h-4 w-4" />;
      case "telegram":
        return <Send className="h-4 w-4" />;
      default:
        return <ExternalLink className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and shop information
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="w-5 h-5" />
              Personal Information
            </CardTitle>
            <CardDescription>Your personal account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile</Label>
                <Input
                  id="mobile"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  placeholder="01XXXXXXXXX"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Business Settings
            </CardTitle>
            <CardDescription>
              Configure your business currency for products, orders, and
              invoices.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="preferred_currency">Business Currency</Label>
                <CurrencySelector
                  value={formData.preferred_currency}
                  onChange={(value) =>
                    setFormData({ ...formData, preferred_currency: value })
                  }
                />
                <p className="text-sm text-muted-foreground">
                  This currency will be used for your products, orders, and
                  invoices.
                </p>
              </div>
              {/* Social Links */}
              <div className="space-y-4 col-span-2">
                <div className="flex items-center justify-between">
                  <Label>Business Social Links</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addSocialLink}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Social Link
                  </Button>
                </div>

                <div className="space-y-3">
                  {formData.social_links.map((link, index) => (
                    <div
                      key={index}
                      className="flex gap-3 items-start animate-in slide-in-from-top-1"
                    >
                      <div className="w-1/3">
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={link.platform}
                          onChange={(e) =>
                            updateSocialLink(index, "platform", e.target.value)
                          }
                        >
                          <option value="facebook">Facebook</option>
                          <option value="instagram">Instagram</option>
                          <option value="telegram">Telegram</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div className="flex-1 relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          {getSocialIcon(link.platform)}
                        </div>
                        <Input
                          placeholder="https://..."
                          className="pl-10"
                          value={link.url}
                          onChange={(e) =>
                            updateSocialLink(index, "url", e.target.value)
                          }
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSocialLink(index)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  {formData.social_links.length === 0 && (
                    <div className="text-center py-6 border-2 border-dashed rounded-lg bg-muted/30">
                      <p className="text-sm text-muted-foreground">
                        No social links added yet.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shop Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="w-5 h-5" />
              Shop Information
            </CardTitle>
            <CardDescription>
              This information will appear on your order memos and invoices.
              Make sure to fill in all fields for a professional look.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="shop_name">Shop Name</Label>
                <Input
                  id="shop_name"
                  name="shop_name"
                  value={formData.shop_name}
                  onChange={handleChange}
                  placeholder="Your Shop Name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shop_slug">Shop URL / Slug</Label>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                      /shop/
                    </span>
                    <Input
                      id="shop_slug"
                      name="shop_slug"
                      value={formData.shop_slug}
                      onChange={handleChange}
                      className="pl-14"
                      placeholder="shop-name"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={generateSlug}
                    title="Auto-generate from Shop Name"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  {formData.shop_slug && (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={copyShopLink}
                        title="Copy Shop Link"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        asChild
                        title="Open Public Shop"
                      >
                        <a
                          href={`/shop/${formData.shop_slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Your unique shop address:{" "}
                  {typeof window !== "undefined" ? window.location.host : ""}
                  /shop/
                  {formData.shop_slug || "..."}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="shop_owner_name">Shop Owner Name</Label>
                <Input
                  id="shop_owner_name"
                  name="shop_owner_name"
                  value={formData.shop_owner_name}
                  onChange={handleChange}
                  placeholder="Owner Name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shop_mobile">Shop Mobile</Label>
                <Input
                  id="shop_mobile"
                  name="shop_mobile"
                  value={formData.shop_mobile}
                  onChange={handleChange}
                  placeholder="01XXXXXXXXX"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shop_email">Shop Email</Label>
                <Input
                  id="shop_email"
                  name="shop_email"
                  type="email"
                  value={formData.shop_email}
                  onChange={handleChange}
                  placeholder="shop@example.com"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="shop_address">Shop Address</Label>
                <Textarea
                  id="shop_address"
                  name="shop_address"
                  value={formData.shop_address}
                  onChange={handleChange}
                  placeholder="Enter your shop address"
                  rows={3}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <ImageUpload
                  value={formData.shop_logo_url}
                  onChange={(url) =>
                    setFormData({ ...formData, shop_logo_url: url })
                  }
                  type="logo"
                  label="Shop Logo"
                  disabled={loading}
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="shop_description">Shop Description</Label>
                <Textarea
                  id="shop_description"
                  name="shop_description"
                  value={formData.shop_description}
                  onChange={handleChange}
                  placeholder="Tell customers what makes your shop special..."
                  rows={4}
                />
                <p className="text-sm text-muted-foreground">
                  This description will appear on your public shop landing page.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trust & Verification */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">

            <CardTitle className="flex items-center gap-2 text-primary font-bold">
              <ShieldCheck className="w-5 h-5 text-green-900" />
              Trust & Verification
            </CardTitle>
            {formData?.is_verified && (
              <Badge variant="outline" className="ml-2 bg-green-100 text-green-900">Verified</Badge>
            )}
            </div>
            <CardDescription>
              Build trust with your customers by providing verification details
              and social links. Verified shops get a &quot;Green Badge&quot; and
              better visibility.
            </CardDescription>
          </CardHeader>
          {!formData?.is_verified && <CardContent className="space-y-6">
            {/* NID/Trade License */}
            <div className="space-y-2">
              <MultipleImageUpload
                value={formData.verification_images}
                onChange={(urls) =>
                  setFormData({ ...formData, verification_images: urls })
                }
                label="NID or Trade License (Verification)"
                disabled={loading}
              />
              <p className="text-sm text-muted-foreground">
                Upload clear photos of your NID or Trade License. This is not
                shared publicly but helps us verify your business. You can
                upload up to 5 images.
              </p>
            </div>
          </CardContent>}
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProfilePage;
