// =========== المكون الرئيسي للتطبيق - القائمة الجانبية والتخطيط ===========
import { cn } from "@/lib/utils";
import {
  Archive,
  BarChart3,
  Building2,
  ChevronDown,
  FileEdit,
  FileSearch,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Printer,
  Search,
  Settings,
  Shield,
  Users,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router";
import { Button } from "./ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import logoSvg from "@/assets/logo.svg";

// قائمة التنقل الرئيسية
const navItems = [
  { path: "/dashboard", label: "لوحة التحكم", icon: LayoutDashboard },
  {
    label: "النماذج",
    icon: FileText,
    children: [
      { path: "/forms", label: "إدخال النماذج", icon: FileEdit },
      { path: "/templates", label: "إدارة القوالب", icon: FileSearch },
    ],
  },
  { path: "/search", label: "البحث والاستعلام", icon: Search },
  { path: "/preview", label: "الطباعة والمعاينة", icon: Printer },
  { path: "/archive", label: "الأرشيف", icon: Archive },
  { path: "/reports", label: "التقارير والإحصائيات", icon: BarChart3 },
  { path: "/requests", label: "الطلبات", icon: FileText },
  { path: "/users", label: "إدارة المستخدمين", icon: Users },
  { path: "/settings", label: "الإعدادات", icon: Settings },
];

// قائمة المستخدم المنسدلة - بديل لـ DropdownMenu من Radix UI
function UserMenu({
  user,
  onSignOut,
  onNavigate,
}: {
  user: any;
  onSignOut: () => Promise<void>;
  onNavigate: (path: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [open]);

  const initials = user?.name?.charAt(0) || "م";

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 h-9 px-2 rounded-lg hover:bg-muted/50 transition-colors"
      >
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-medium">
          {initials}
        </div>
        <span className="text-sm font-medium hidden md:block">
          {user?.name || "مستخدم"}
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden md:block" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-56 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="px-3 py-2 border-b border-border">
            <p className="text-sm font-medium text-foreground">{user?.name || "مستخدم"}</p>
            <p className="text-xs text-muted-foreground">{user?.email || ""}</p>
          </div>
          <button
            onClick={() => {
              setOpen(false);
              onNavigate("/settings");
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted/50 transition-colors"
          >
            <Settings className="h-4 w-4" />
            الإعدادات
          </button>
          <div className="border-t border-border mx-2" />
          <button
            onClick={async () => {
              setOpen(false);
              await onSignOut();
              onNavigate("/");
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            تسجيل الخروج
          </button>
        </div>
      )}
    </div>
  );
}

function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const { isAuthenticated, signOut } = useAuth();

  const toggleMenu = (label: string) => {
    setExpandedMenus((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label],
    );
  };

  // Auto-expand parent of current path
  useEffect(() => {
    navItems.forEach((item) => {
      if (item.children) {
        const isActive = item.children.some(
          (child) => location.pathname === child.path,
        );
        if (isActive && !expandedMenus.includes(item.label)) {
          setExpandedMenus((prev) => [...prev, item.label]);
        }
      }
    });
  }, [location.pathname]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
    onClose();
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 right-0 z-50 h-full w-72 bg-sidebar text-sidebar-foreground border-l border-sidebar-border transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto flex flex-col",
          open ? "translate-x-0" : "translate-x-full lg:translate-x-0",
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-3 p-5 border-b border-sidebar-border">
          <img
            src={logoSvg}
            alt="شعار بلدية طرابلس"
            className="w-10 h-10 rounded-lg shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-bold truncate text-sidebar-foreground">
              قسم المسح والتطبيق
            </h2>
            <p className="text-[10px] text-sidebar-foreground/60 truncate">
              بلدية طرابلس
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent h-8 w-8"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => {
            if (item.children) {
              const isExpanded = expandedMenus.includes(item.label);
              const isChildActive = item.children.some(
                (child) => location.pathname === child.path,
              );

              return (
                <div key={item.label}>
                  <button
                    onClick={() => toggleMenu(item.label)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                      isChildActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span className="flex-1 text-right">{item.label}</span>
                    <ChevronDown
                      className={cn(
                        "h-3.5 w-3.5 transition-transform duration-200",
                        isExpanded && "rotate-180",
                      )}
                    />
                  </button>
                  <div
                    className={cn(
                      "overflow-hidden transition-all duration-200",
                      isExpanded ? "max-h-96 opacity-100 mt-1" : "max-h-0 opacity-0",
                    )}
                  >
                    <div className="mr-4 pr-3 border-r border-sidebar-border/50 space-y-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.path}
                          to={child.path}
                          onClick={onClose}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-all duration-200",
                            location.pathname === child.path
                              ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                              : "text-sidebar-foreground/60 hover:bg-sidebar-accent/30 hover:text-sidebar-foreground",
                          )}
                        >
                          <child.icon className="h-3.5 w-3.5 shrink-0" />
                          <span>{child.label}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <Link
                key={item.path}
                to={item.path!}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  location.pathname === item.path
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-sidebar-border">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground/60 hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated, user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const systemName = useQuery(api.settings.getSystemName);

  // Get page title
  const getPageTitle = () => {
    for (const item of navItems) {
      if (item.path === location.pathname) return item.label;
      if (item.children) {
        const child = item.children.find(
          (c) => c.path === location.pathname,
        );
        if (child) return child.label;
      }
    }
    return "منصة المسح والتطبيق";
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background" dir="rtl">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header */}
        <header className="h-16 glass border-b border-border flex items-center justify-between px-4 lg:px-6 shrink-0 no-print">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-9 w-9"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-base font-semibold text-foreground hidden sm:block">
              {getPageTitle()}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:block">
              <p className="text-xs text-muted-foreground">
                {systemName || "منصة المسح والتطبيق"}
              </p>
              <p className="text-[10px] text-muted-foreground/60">
                بلدية طرابلس - إدارة التخطيط الحضري
              </p>
            </div>

            <UserMenu user={user} onSignOut={signOut} onNavigate={navigate} />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 rtl">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
