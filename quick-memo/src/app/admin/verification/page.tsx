"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye } from "lucide-react";
import { toast } from "sonner";
import adminApi from "@/lib/adminApi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface User {
  user_id: number;
  name: string;
  email: string;
  shop_name: string | null;
  is_verified: boolean;
  has_badge: boolean;
  is_active: boolean;
  nid_license_url: string | null;
}

export default function VerificationPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await adminApi.get("/admin/users");
      setUsers(res.data.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (
    userId: number,
    field: string,
    value: boolean
  ) => {
    try {
      await adminApi.put(`/admin/users/${userId}`, { [field]: value });
      toast.success("Status updated successfully");
      fetchUsers();
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update status");
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Seller Verifications
          </h1>
          <p className="text-slate-400">
            Review documents and manage trust badges
          </p>
        </div>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            {loading ? (
              <div className="text-center py-10 text-slate-400">Loading...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700">
                    <TableHead className="text-slate-400">Seller</TableHead>
                    <TableHead className="text-slate-400">Shop</TableHead>
                    <TableHead className="text-slate-400">Documents</TableHead>
                    <TableHead className="text-slate-400">Status</TableHead>
                    <TableHead className="text-slate-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.user_id} className="border-slate-700">
                      <TableCell>
                        <div className="text-white font-medium">
                          {user.name}
                        </div>
                        <div className="text-xs text-slate-400">
                          {user.email}
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {user.shop_name || "N/A"}
                      </TableCell>
                      <TableCell>
                        {user.nid_license_url ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-400 hover:text-blue-300"
                            onClick={() => setSelectedUser(user)}
                          >
                            <Eye className="w-4 h-4 mr-1" /> View NID
                          </Button>
                        ) : (
                          <span className="text-xs text-slate-500 italic">
                            No document
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {user.is_verified ? (
                            <Badge className="bg-green-600">Verified</Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="text-slate-400 border-slate-600"
                            >
                              Unverified
                            </Badge>
                          )}
                          {user.has_badge && (
                            <Badge className="bg-blue-600">
                              Verified Badge
                            </Badge>
                          )}
                          {!user.is_active && (
                            <Badge variant="destructive">Suspended</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant={user.is_verified ? "outline" : "default"}
                            className={
                              user.is_verified
                                ? "border-slate-600 text-slate-400"
                                : "bg-green-600 hover:bg-green-700"
                            }
                            onClick={() =>
                              handleUpdateStatus(
                                user.user_id,
                                "is_verified",
                                !user.is_verified
                              )
                            }
                          >
                            {user.is_verified ? "Revoke" : "Verify"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-slate-600 text-blue-400 hover:bg-slate-700"
                            onClick={() =>
                              handleUpdateStatus(
                                user.user_id,
                                "has_badge",
                                !user.has_badge
                              )
                            }
                          >
                            {user.has_badge ? "Remove Badge" : "Add Badge"}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() =>
                              handleUpdateStatus(
                                user.user_id,
                                "is_active",
                                !user.is_active
                              )
                            }
                          >
                            {user.is_active ? "Suspend" : "Activate"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-3xl">
          <DialogHeader>
            <DialogTitle>Document for {selectedUser?.name}</DialogTitle>
          </DialogHeader>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {selectedUser?.nid_license_url && (
            <img
              src={selectedUser.nid_license_url}
              alt="NID/License"
              className="w-full h-auto rounded-lg shadow-lg"
            />
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
