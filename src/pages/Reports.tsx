// =========== التقارير والإحصائيات - Reports ===========
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  BarChart3,
  FileText,
  PieChart,
  Download,
  Calendar,
  Activity,
  MapPin,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";

export default function ReportsPage() {
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [month, setMonth] = useState("all");

  const stats = useQuery(api.records.getStats);
  const records = useQuery(api.records.list, {});
  const templates = useQuery(api.templates.list, {});
  const districts = useQuery(api.districts.list, {});

  const allRecords = records?.records || [];

  // Calculate stats by template
  const byTemplate = (templates || []).map((t: any) => ({
    name: t.name,
    count: allRecords.filter((r: any) => r.templateId === t._id).length,
  }));

  // Calculate stats by district
  const byDistrict: Record<string, number> = {};
  allRecords.forEach((r: any) => {
    if (r.district) {
      byDistrict[r.district] = (byDistrict[r.district] || 0) + 1;
    }
  });

  // Calculate stats by request type
  const byRequestType: Record<string, number> = {};
  allRecords.forEach((r: any) => {
    byRequestType[r.requestType] = (byRequestType[r.requestType] || 0) + 1;
  });

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">التقارير والإحصائيات</h2>
          <p className="text-sm text-muted-foreground mt-1">
            تقارير إحصائية شاملة ومخططات بيانية تفاعلية
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => toast.success("جاري تصدير التقرير")}
        >
          <Download className="ml-2 h-4 w-4" />
          تصدير تقرير
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[2024, 2025, 2026].map((y) => (
                <SelectItem key={y} value={y.toString()}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Select value={month} onValueChange={setMonth}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="الشهر" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الشهور</SelectItem>
            {[
              "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
              "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
            ].map((m, i) => (
              <SelectItem key={i} value={(i + 1).toString()}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="edge-3d-sm">
          <CardContent className="p-4 text-center">
            <FileText className="h-5 w-5 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{allRecords.length}</p>
            <p className="text-xs text-muted-foreground">إجمالي السجلات</p>
          </CardContent>
        </Card>
        <Card className="edge-3d-sm">
          <CardContent className="p-4 text-center">
            <TemplateIcon className="h-5 w-5 text-chart-2 mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{templates?.length || 0}</p>
            <p className="text-xs text-muted-foreground">القوالب</p>
          </CardContent>
        </Card>
        <Card className="edge-3d-sm">
          <CardContent className="p-4 text-center">
            <MapPin className="h-5 w-5 text-chart-3 mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{Object.keys(byDistrict).length}</p>
            <p className="text-xs text-muted-foreground">المناطق المسجلة</p>
          </CardContent>
        </Card>
        <Card className="edge-3d-sm">
          <CardContent className="p-4 text-center">
            <BarChart3 className="h-5 w-5 text-chart-4 mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{Object.keys(byRequestType).length}</p>
            <p className="text-xs text-muted-foreground">أنواع الطلبات</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* By Template */}
        <Card className="edge-3d-sm">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              السجلات حسب القالب
            </CardTitle>
          </CardHeader>
          <CardContent>
            {byTemplate.length > 0 ? (
              <div className="space-y-3">
                {byTemplate.map((item) => {
                  const max = Math.max(...byTemplate.map((t) => t.count), 1);
                  const percentage = (item.count / max) * 100;
                  return (
                    <div key={item.name}>
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm text-foreground">{item.name}</p>
                        <p className="text-sm font-medium">{item.count}</p>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(percentage, 5)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                لا توجد بيانات
              </p>
            )}
          </CardContent>
        </Card>

        {/* By Request Type */}
        <Card className="edge-3d-sm">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <PieChart className="h-4 w-4 text-primary" />
              السجلات حسب نوع الطلب
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(byRequestType).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(byRequestType)
                  .sort(([, a], [, b]) => b - a)
                  .map(([type, count]) => {
                    const total = allRecords.length || 1;
                    const percentage = (count / total) * 100;
                    return (
                      <div key={type} className="flex items-center gap-3">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm text-foreground">{type}</p>
                            <p className="text-sm font-medium">{count}</p>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-chart-2 rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                لا توجد بيانات
              </p>
            )}
          </CardContent>
        </Card>

        {/* By District */}
        <Card className="edge-3d-sm">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              السجلات حسب المنطقة
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(byDistrict).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(byDistrict)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 10)
                  .map(([district, count]) => {
                    const max = Math.max(...Object.values(byDistrict), 1);
                    const percentage = (count / max) * 100;
                    return (
                      <div key={district}>
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm text-foreground">{district}</p>
                          <p className="text-sm font-medium">{count}</p>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-chart-3 rounded-full transition-all duration-500"
                            style={{ width: `${Math.max(percentage, 5)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                لا توجد بيانات
              </p>
            )}
          </CardContent>
        </Card>

        {/* Status Summary */}
        <Card className="edge-3d-sm">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              ملخص الحالات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "قيد الانتظار", value: stats?.pending || 0, color: "text-amber-600", bg: "bg-amber-50" },
                { label: "تمت الموافقة", value: stats?.approved || 0, color: "text-emerald-600", bg: "bg-emerald-50" },
                { label: "مرفوضة", value: stats?.rejected || 0, color: "text-red-600", bg: "bg-red-50" },
                { label: "مسودة", value: allRecords.filter((r: any) => r.status === "draft").length, color: "text-gray-600", bg: "bg-gray-50" },
              ].map((item) => (
                <div key={item.label} className={cn("p-4 rounded-xl", item.bg)}>
                  <p className={cn("text-2xl font-bold", item.color)}>{item.value}</p>
                  <p className="text-sm text-muted-foreground mt-1">{item.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}

function TemplateIcon(props: any) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="9" y1="3" x2="9" y2="21" />
    </svg>
  );
}
