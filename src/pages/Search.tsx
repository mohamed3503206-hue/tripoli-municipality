// =========== البحث والاستعلام - Search ===========
import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Search as SearchIcon,
  Eye,
  Edit3,
  Copy,
  Trash2,
  Printer,
  Download,
  FileText,
  X,
  Loader2,
  ChevronLeft,
  Calendar,
  User,
  MapPin,
  Hash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export default function SearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [searchBy, setSearchBy] = useState("all");
  const [results, setResults] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [viewRecord, setViewRecord] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const templates = useQuery(api.templates.list, {});
  const allRecords = useQuery(api.records.list, {});
  const removeRecord = useMutation(api.records.remove);

  const handleSearch = useCallback(() => {
    if (!query.trim() && searchBy !== "all") {
      toast.error("يرجى إدخال مصطلح البحث");
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    // Client-side search for responsiveness
    if (allRecords?.records) {
      let filtered = [...allRecords.records];
      const q = query.toLowerCase();

      if (query.trim()) {
        filtered = filtered.filter((r: any) => {
          const searchField = () => {
            switch (searchBy) {
              case "formNumber":
                return r.formNumber.toLowerCase().includes(q);
              case "ownerName":
                return r.ownerName.toLowerCase().includes(q);
              case "district":
                return r.district.toLowerCase().includes(q);
              case "pieceNumber":
                return r.pieceNumber.toLowerCase().includes(q);
              case "requestType":
                return r.requestType.toLowerCase().includes(q);
              default:
                return (
                  r.formNumber.toLowerCase().includes(q) ||
                  r.ownerName.toLowerCase().includes(q) ||
                  r.district.toLowerCase().includes(q) ||
                  r.pieceNumber.toLowerCase().includes(q) ||
                  r.requestType.toLowerCase().includes(q) ||
                  r.locality?.toLowerCase().includes(q) ||
                  r.date.includes(q)
                );
            }
          };
          return searchField();
        });
      }

      setResults(filtered);
    }
    setIsSearching(false);
  }, [query, searchBy, allRecords]);

  // Auto-search on query change if user pauses
  useEffect(() => {
    if (!query.trim() && hasSearched) {
      setResults([]);
      setHasSearched(false);
      return;
    }
    if (!query.trim()) return;
    const timer = setTimeout(handleSearch, 500);
    return () => clearTimeout(timer);
  }, [query, searchBy, handleSearch, hasSearched]);

  const getTemplateName = (templateId: string) => {
    return templates?.find((t: any) => t._id === templateId)?.name || "نموذج";
  };

  const handlePrint = (record: any) => {
    navigate(`/preview?record=${record._id}`);
  };

  const handleDuplicate = async (record: any) => {
    toast.success("تم نسخ السجل. قم بتعديله وحفظه");
    navigate(`/forms?template=${record.templateId}`);
  };

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await removeRecord({ id: deleteId as any });
        setResults(results.filter((r) => r._id !== deleteId));
        toast.success("تم حذف السجل بنجاح");
      } catch (err) {
        toast.error("حدث خطأ أثناء الحذف");
      }
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Search Header - Google-like */}
      <div className="max-w-2xl mx-auto pt-8 pb-6">
        <div className="text-center mb-6">
          <SearchIcon className="h-10 w-10 text-primary mx-auto mb-3" />
          <h2 className="text-2xl font-bold text-foreground">البحث والاستعلام</h2>
          <p className="text-sm text-muted-foreground mt-1">
            ابحث في جميع السجلات والمعاملات
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <SearchIcon className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ابحث برقم النموذج، اسم المالك، المنطقة، رقم القطعة..."
                className="h-12 pr-11 pl-4 text-base rounded-xl shadow-sm border-2 focus-visible:border-primary"
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button
              onClick={handleSearch}
              className="h-12 px-6 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl"
            >
              بحث
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { value: "all", label: "الكل" },
              { value: "formNumber", label: "رقم النموذج" },
              { value: "ownerName", label: "اسم المالك" },
              { value: "district", label: "المنطقة" },
              { value: "pieceNumber", label: "رقم القطعة" },
              { value: "requestType", label: "نوع الطلب" },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setSearchBy(option.value)}
                className={`
                  px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200
                  ${
                    searchBy === option.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }
                `}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search Results */}
      {hasSearched && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              {isSearching ? (
                "جاري البحث..."
              ) : (
                <>
                  تم العثور على{" "}
                  <span className="font-medium text-foreground">{results.length}</span>{" "}
                  نتيجة
                </>
              )}
            </p>
          </div>

          {isSearching ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-3">
              {results.map((record: any, i: number) => (
                <Card
                  key={record._id}
                  className="edge-3d-sm hover:shadow-md transition-all duration-200"
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-[10px] shrink-0">
                            #{record.formNumber}
                          </Badge>
                          <Badge className="text-[10px] shrink-0 bg-primary/10 text-primary hover:bg-primary/20">
                            {getTemplateName(record.templateId)}
                          </Badge>
                          <Badge
                            variant="secondary"
                            className="text-[10px] shrink-0"
                          >
                            {record.status || "pending"}
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
                          onClick={() => setViewRecord(record)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => navigate(`/forms?template=${record.templateId}`)}
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleDuplicate(record)}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setDeleteId(record._id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handlePrint(record)}
                        >
                          <Printer className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handlePrint(record)}
                        >
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
              <SearchIcon className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                لا توجد نتائج مطابقة للبحث
              </p>
            </div>
          )}
        </div>
      )}

      {/* View Record Dialog */}
      <Dialog open={!!viewRecord} onOpenChange={() => setViewRecord(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              تفاصيل السجل - {viewRecord?.formNumber}
            </DialogTitle>
          </DialogHeader>
          {viewRecord && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">رقم النموذج</p>
                  <p className="text-sm font-medium">{viewRecord.formNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">التاريخ</p>
                  <p className="text-sm font-medium">{viewRecord.date}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">اسم المالك</p>
                  <p className="text-sm font-medium">{viewRecord.ownerName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">رقم القطعة</p>
                  <p className="text-sm font-medium">{viewRecord.pieceNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">المنطقة</p>
                  <p className="text-sm font-medium">{viewRecord.district}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">المحلة</p>
                  <p className="text-sm font-medium">{viewRecord.locality}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">نوع الطلب</p>
                  <p className="text-sm font-medium">{viewRecord.requestType}</p>
                </div>
              </div>
              {viewRecord.notes && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">الملاحظات</p>
                  <div className="p-3 rounded-lg bg-muted/30 border text-sm">
                    {viewRecord.notes}
                  </div>
                </div>
              )}
              {viewRecord.recommendation && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">التوصية</p>
                  <div className="p-3 rounded-lg bg-muted/30 border text-sm">
                    {viewRecord.recommendation}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذا السجل؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground"
              onClick={handleDelete}
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
