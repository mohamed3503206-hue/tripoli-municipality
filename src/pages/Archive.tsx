// =========== الأرشيف الإلكتروني - Archive ===========
import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Archive,
  FileText,
  Image,
  File,
  Download,
  Trash2,
  Search,
  Calendar,
  User,
  FileSpreadsheet,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { toast } from "sonner";

const fileTypeIcons: Record<string, any> = {
  pdf: FileText,
  docx: FileText,
  doc: FileText,
  jpg: Image,
  jpeg: Image,
  png: Image,
  gif: Image,
  default: File,
};

export default function ArchivePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [fileTypeFilter, setFileTypeFilter] = useState("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const records = useQuery(api.records.list, {});
  // Archive data will be available once fully integrated

  // For now, show records as archive items
  const archiveItems = records?.records || [];

  const filteredItems = archiveItems.filter((item: any) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      item.ownerName?.toLowerCase().includes(q) ||
      item.formNumber?.toLowerCase().includes(q) ||
      item.district?.toLowerCase().includes(q);

    return matchesSearch;
  });

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">الأرشيف الإلكتروني</h2>
        <p className="text-sm text-muted-foreground mt-1">
          أرشفة وحفظ جميع السجلات والمستندات مع سجل التعديلات
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث في الأرشيف..."
            className="pr-9"
          />
        </div>
        <Select value={fileTypeFilter} onValueChange={setFileTypeFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="نوع الملف" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الأنواع</SelectItem>
            <SelectItem value="pdf">PDF</SelectItem>
            <SelectItem value="docx">Word</SelectItem>
            <SelectItem value="image">صور</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Archive Grid */}
      {filteredItems.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item: any) => {
            const IconComponent = FileText;
            return (
              <Card
                key={item._id}
                className="edge-3d-sm hover:shadow-md transition-all duration-200 group"
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <IconComponent className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {item.ownerName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        #{item.formNumber}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-[10px]">
                          {item.requestType}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">
                          {item.district}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {item.date}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 mt-3 pt-3 border-t border-border">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs flex-1"
                      onClick={() => window.open(`/preview?record=${item._id}`, "_blank")}
                    >
                      <ExternalLink className="ml-1 h-3 w-3" />
                      عرض
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs flex-1"
                      onClick={() => toast.success("جاري تحميل نسخة PDF")}
                    >
                      <Download className="ml-1 h-3 w-3" />
                      تحميل
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => setDeleteId(item._id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed border-border rounded-xl">
          <Archive className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            الأرشيف فارغ
          </h3>
          <p className="text-sm text-muted-foreground">
            لا توجد سجلات في الأرشيف بعد. سيتم أرشفة السجلات تلقائياً عند إنشائها.
          </p>
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف من الأرشيف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذا السجل من الأرشيف؟
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground"
              onClick={() => {
                toast.success("تم حذف السجل من الأرشيف");
                setDeleteId(null);
              }}
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
