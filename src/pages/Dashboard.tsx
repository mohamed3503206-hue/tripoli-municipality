// =========== لوحة التحكم - Dashboard ===========
import { motion } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  BarChart3,
  Clock,
  FileText,
  CheckCircle2,
  XCircle,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const stats = useQuery(api.records.getStats);
  const templates = useQuery(api.templates.list, {});
  const recentRecords = useQuery(api.records.list, { limit: 5 });

  const statCards = [
    {
      label: "إجمالي المعاملات",
      value: stats?.total || 0,
      icon: FileText,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "قيد الانتظار",
      value: stats?.pending || 0,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "تمت الموافقة",
      value: stats?.approved || 0,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "مرفوضة",
      value: stats?.rejected || 0,
      icon: XCircle,
      color: "text-red-600",
      bg: "bg-red-50",
    },
  ];

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">لوحة التحكم</h2>
        <p className="text-sm text-muted-foreground mt-1">
          مرحباً بك في نظام إدارة قسم المسح والتطبيق
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.1 }}
          >
            <Card className="edge-3d-sm hover:shadow-md transition-all duration-200">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", stat.bg)}>
                    <stat.icon className={cn("h-5 w-5", stat.color)} />
                  </div>
                  <span className="text-2xl font-bold text-foreground">{stat.value}</span>
                </div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="edge-3d-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                آخر النشاطات
              </CardTitle>
              <Link to="/search">
                <Button variant="ghost" size="sm" className="text-xs">
                  عرض الكل
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {stats?.recent && stats.recent.length > 0 ? (
              <div className="space-y-3">
                {stats.recent.slice(0, 5).map((log: any, i: number) => (
                  <motion.div
                    key={log._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-start gap-3 pb-3 border-b border-border last:border-0 last:pb-0"
                  >
                    <div className="w-2 h-2 rounded-full bg-primary/40 mt-2 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground truncate">
                        {log.description || log.action}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {log.userName || "مستخدم"} · {format(new Date(log.timestamp), "d MMMM yyyy, HH:mm", { locale: ar })}
                      </p>
                    </div>
                    <Badge variant="outline" className="shrink-0 text-[10px]">
                      {log.action === "create" ? "إضافة" : log.action === "update" ? "تحديث" : "حذف"}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                لا توجد نشاطات حديثة
              </p>
            )}
          </CardContent>
        </Card>

        {/* Templates / Quick Actions */}
        <Card className="edge-3d-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                القوالب المتاحة
              </CardTitle>
              <Link to="/templates">
                <Button variant="ghost" size="sm" className="text-xs">
                  إدارة القوالب
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {templates && templates.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {templates.slice(0, 6).map((template: any, i: number) => (
                  <Link key={template._id} to={`/forms?template=${template._id}`}>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="p-3 rounded-lg border border-border hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 cursor-pointer"
                    >
                      <p className="text-xs font-medium text-foreground truncate">
                        {template.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {template.category || "عام"}
                      </p>
                    </motion.div>
                  </Link>
                ))}
                {templates.length > 6 && (
                  <Link
                    to="/templates"
                    className="p-3 rounded-lg border border-dashed border-border flex items-center justify-center text-xs text-muted-foreground hover:border-primary/30 transition-colors"
                  >
                    +{templates.length - 6} قوالب أخرى
                  </Link>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground mb-3">
                  لا توجد قوالب بعد
                </p>
                <Link to="/templates">
                  <Button size="sm" variant="outline">
                    إضافة قالب جديد
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
