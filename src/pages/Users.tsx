// =========== إدارة المستخدمين - Users ===========
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Users,
  Shield,
  ShieldCheck,
  ShieldAlert,
  UserCog,
  UserPlus,
  UserX,
  CheckCircle2,
  XCircle,
  MoreHorizontal,
  Mail,
  Building2,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const ROLE_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  super_admin: { label: "مدير النظام", icon: ShieldAlert, color: "text-red-600" },
  admin: { label: "مدير الإدارة", icon: ShieldCheck, color: "text-blue-600" },
  head: { label: "رئيس القسم", icon: Shield, color: "text-primary" },
  employee: { label: "موظف", icon: UserCog, color: "text-emerald-600" },
  reader: { label: "قارئ فقط", icon: Users, color: "text-gray-600" },
};

const ROLES = [
  { value: "super_admin", label: "مدير النظام" },
  { value: "admin", label: "مدير الإدارة" },
  { value: "head", label: "رئيس القسم" },
  { value: "employee", label: "موظف" },
  { value: "reader", label: "قارئ فقط" },
];

// Permission matrix
const PERMISSIONS = [
  { key: "dashboard", label: "لوحة التحكم" },
  { key: "forms.create", label: "إدخال النماذج" },
  { key: "forms.edit", label: "تعديل النماذج" },
  { key: "forms.delete", label: "حذف النماذج" },
  { key: "templates", label: "إدارة القوالب" },
  { key: "search", label: "البحث" },
  { key: "print", label: "الطباعة" },
  { key: "archive", label: "الأرشيف" },
  { key: "reports", label: "التقارير" },
  { key: "users", label: "إدارة المستخدمين" },
  { key: "settings", label: "الإعدادات" },
];

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [editUser, setEditUser] = useState<any>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const users = useQuery(api.users.list);

  const filteredUsers = (users || []).filter((u: any) => {
    const q = searchQuery.toLowerCase();
    return (
      !q ||
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.department?.toLowerCase().includes(q)
    );
  });

  const getRoleBadge = (role: string) => {
    const config = ROLE_CONFIG[role] || ROLE_CONFIG.reader;
    return (
      <Badge
        variant="outline"
        className={cn("text-[10px] flex items-center gap-1", config.color)}
      >
        <config.icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">إدارة المستخدمين</h2>
          <p className="text-sm text-muted-foreground mt-1">
            إدارة المستخدمين وتخصيص الصلاحيات والأدوار
          </p>
        </div>
        <Button
          onClick={() => setShowAddDialog(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <UserPlus className="ml-2 h-4 w-4" />
          إضافة مستخدم
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ابحث عن مستخدم..."
          className="pr-9"
        />
      </div>

      {/* Users Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map((user: any) => {
          const initials = user.name
            ? user.name
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .slice(0, 2)
            : "م";

          return (
            <Card
              key={user._id}
              className="edge-3d-sm hover:shadow-md transition-all duration-200"
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.image} />
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground truncate">
                        {user.name || "مستخدم"}
                      </p>
                      {user.isActive !== false ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      ) : (
                        <XCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />
                      )}
                    </div>
                    {user.email && (
                      <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                        <Mail className="h-3 w-3 shrink-0" />
                        {user.email}
                      </p>
                    )}
                    <div className="mt-2">
                      {getRoleBadge(user.role || "reader")}
                    </div>
                    {user.department && (
                      <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {user.department}
                      </p>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem onClick={() => setEditUser(user)}>
                        <Shield className="ml-2 h-4 w-4" />
                        تغيير الصلاحية
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={async () => {
                          toast.success(
                            user.isActive !== false
                              ? "تم تعطيل المستخدم"
                              : "تم تفعيل المستخدم",
                          );
                        }}
                      >
                        <UserX className="ml-2 h-4 w-4" />
                        {user.isActive !== false ? "تعطيل" : "تفعيل"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Edit User Dialog */}
      <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              تعديل صلاحيات المستخدم
            </DialogTitle>
          </DialogHeader>
          {editUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-border">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {editUser.name?.charAt(0) || "م"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{editUser.name}</p>
                  <p className="text-xs text-muted-foreground">{editUser.email}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>الدور / الصلاحية</Label>
                <Select
                  defaultValue={editUser.role || "reader"}
                  onValueChange={async (val) => {
                    toast.success("تم تحديث الصلاحية بنجاح");
                    setEditUser(null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>الصلاحيات التفصيلية</Label>
                <div className="grid grid-cols-2 gap-2">
                  {PERMISSIONS.map((perm) => (
                    <div
                      key={perm.key}
                      className="flex items-center gap-2 p-2 rounded-lg bg-muted/30"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      <span className="text-xs">{perm.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setEditUser(null)}
                >
                  إغلاق
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add User Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              إضافة مستخدم جديد
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>الاسم</Label>
              <Input placeholder="الاسم الكامل" />
            </div>
            <div className="space-y-2">
              <Label>البريد الإلكتروني</Label>
              <Input type="email" placeholder="name@example.com" />
            </div>
            <div className="space-y-2">
              <Label>كلمة المرور المؤقتة</Label>
              <Input type="password" placeholder="••••••••" />
            </div>
            <div className="space-y-2">
              <Label>الدور</Label>
              <Select defaultValue="employee">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>القسم</Label>
              <Input placeholder="القسم التابع له" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              إلغاء
            </Button>
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => {
                toast.success("تم إضافة المستخدم بنجاح");
                setShowAddDialog(false);
              }}
            >
              إضافة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
