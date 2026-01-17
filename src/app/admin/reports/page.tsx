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
import { ShieldOff } from "lucide-react";
import { toast } from "sonner";
import adminApi from "@/lib/adminApi";
import { format } from "date-fns";

interface Report {
  report_id: number;
  shop_id: number;
  shop_name: string;
  shop_slug: string;
  customer_name: string;
  customer_mobile: string;
  customer_email: string;
  reason: string;
  created_at: string;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await adminApi.get("/admin/reports");
      setReports(res.data.data);
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error("Failed to fetch reports");
    } finally {
      setLoading(false);
    }
  };

  const handleSuspendShop = async (shopId: number) => {
    try {
      await adminApi.put(`/admin/users/${shopId}`, { is_active: false });
      toast.success("Shop suspended successfully");
    } catch (error) {
      console.error("Error suspending shop:", error);
      toast.error("Failed to suspend shop");
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Shop Reports</h1>
          <p className="text-slate-400">
            Monitor and handle reports against shops
          </p>
        </div>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            {loading ? (
              <div className="text-center py-10 text-slate-400">Loading...</div>
            ) : reports.length === 0 ? (
              <div className="text-center py-10 text-slate-400 italic">
                No reports found
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700">
                    <TableHead className="text-slate-400">
                      Reported Shop
                    </TableHead>
                    <TableHead className="text-slate-400">
                      Reporter Info
                    </TableHead>
                    <TableHead className="text-slate-400 w-[300px]">
                      Reason
                    </TableHead>
                    <TableHead className="text-slate-400">Date</TableHead>
                    <TableHead className="text-slate-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow
                      key={report.report_id}
                      className="border-slate-700"
                    >
                      <TableCell>
                        <div className="text-white font-medium">
                          {report.shop_name}
                        </div>
                        <div className="text-xs text-slate-500">
                          /{report.shop_slug}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-slate-300 font-medium">
                          {report.customer_name}
                        </div>
                        <div className="text-xs text-slate-400">
                          {report.customer_mobile}
                        </div>
                        <div className="text-xs text-slate-400">
                          {report.customer_email}
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-300">
                        <p
                          className="text-sm line-clamp-2"
                          title={report.reason}
                        >
                          {report.reason}
                        </p>
                      </TableCell>
                      <TableCell className="text-slate-400 text-sm">
                        {format(new Date(report.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleSuspendShop(report.shop_id)}
                        >
                          <ShieldOff className="w-4 h-4 mr-1" /> Suspend
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
