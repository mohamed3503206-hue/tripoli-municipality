// =========== الطلبات - Requests ===========
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  FileText,
  Plus,
  ChevronLeft,
  Save,
  Eye,
  Edit3,
  Printer,
  Loader2,
  Calendar,
  User,
  MapPin,
  Hash,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  FileSpreadsheet,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export default function RequestsPage() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const records = useQuery(api.records.list, {});
  const templates = useQuery(api.templates.list, {});
  const allRecords = records?.records || [];

  const filteredRecords = allRecords.filter((r: any) => {
    const matchesStatus =
      statusFilter === "all" || r.status === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      r.ownerName?.toLowerCase().includes(q) ||
      r.formNumber?.toLowerCase().includes(q) ||
      r.district?.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
            <CheckCircle2 className="ml-1 h-3 w-3" />
            تمت الموافقة
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-700 border-red-200">
            <XCircle className="ml-1 h-3 w-3" />
            مرفوض
          </Badge>
        );
      case "draft":
        return (
          <Badge variant="outline">
            <FileSpreadsheet className="ml-1 h-3 w-3" />
            مسودة
          </Badge>
        );
      default:
        return (
          <Badge className="bg-amber-100 text-amber-700 border-amber-200">
            <Clock className="ml-1 h-3 w-3" />
            قيد الانتظار
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">الطلبات</h2>
          <p className="text-sm text-muted-foreground mt-1">
            إدارة ومتابعة طلبات المواطنين
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن طلب..."
            className="pr-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36">
            <Filter className="ml-2 h-4 w-4" />
            <SelectValue placeholder="الحالة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الطلبات</SelectItem>
            <SelectItem value="pending">قيد الانتظار</SelectItem>
            <SelectItem value="approved">مقبول</SelectItem>
            <SelectItem value="rejected">مرفوض</SelectItem>
            <SelectItem value="draft">مسودة</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Requests List */}
      {filteredRecords.length > 0 ? (
        <div className="space-y-3">
          {filteredRecords.map((record: any) => {
            const template = templates?.find(
              (t: any) => t._id === record.templateId,
            );
            return (
              <Card
                key={record._id}
                className="edge-3d-sm hover:shadow-md transition-all duration-200"
              >
                <CardContent className="p-4">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-[10px]">
                          #{record.formNumber}
                        </Badge>
                        {getStatusBadge(record.status || "pending")}
                        <Badge
                          variant="secondary"
                          className="text-[10px]"
                        >
                          {template?.name || "نموذج"}
                        </Badge>
                      </div>
                      <h3 className="text-base font-semibold text-foreground truncate">
                        {record.ownerName}
                      </h3>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {record.district}
                        </span>
                        <span className="flex items-center gap-1">
                          <Hash className="h-3 w-3" />
                          قطعة {record.pieceNumber}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {record.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {record.requestType}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          navigate(`/forms?template=${record.templateId}`)
                        }
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          navigate(`/forms?template=${record.templateId}`)
                        }
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          navigate(`/preview?record=${record._id}`)
                        }
                      >
                        <Printer className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed border-border rounded-xl">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            لا توجد طلبات
          </h3>
          <p className="text-sm text-muted-foreground">
            لم يتم إضافة أي طلبات بعد. يمكنك إضافة طلب جديد من نموذج الإدخال.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => navigate("/forms")}
          >
            <Plus className="ml-2 h-4 w-4" />
            إضافة طلب جديد
          </Button>
        </div>
      )}
    </div>
  );
}
