// =========== الصفحة الرئيسية - بلدية طرابلس ===========
import { motion } from "framer-motion";
import {
  BarChart3,
  Building2,
  ChevronLeft,
  FileText,
  MapPin,
  Search,
  Shield,
  Users,
} from "lucide-react";
import { Link, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import logoSvg from "@/assets/logo.svg";

export default function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
  const stats = useQuery(api.records.getStats);

  const features = [
    {
      icon: FileText,
      title: "النماذج الإلكترونية",
      desc: "إدارة النماذج والطلبات إلكترونياً بدلاً من النظام الورقي",
    },
    {
      icon: Search,
      title: "البحث والاستعلام",
      desc: "بحث ذكي ومتقدم في جميع السجلات والمعاملات",
    },
    {
      icon: BarChart3,
      title: "التقارير والإحصائيات",
      desc: "تقارير إحصائية شاملة ومخططات بيانية تفاعلية",
    },
    {
      icon: Shield,
      title: "الأمان والصلاحيات",
      desc: "نظام صلاحيات متكامل لإدارة المستخدمين والأدوار",
    },
    {
      icon: Users,
      title: "إدارة المستخدمين",
      desc: "إدارة كاملة للمستخدمين مع تخصيص الصلاحيات",
    },
    {
      icon: MapPin,
      title: "الأرشفة الإلكترونية",
      desc: "أرشفة ذكية للمستندات مع سجل كامل للتعديلات",
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background" dir="rtl">
        <div className="text-center">
          <Building2 className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    navigate("/dashboard", { replace: true });
    return null;
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img
                src={logoSvg}
                alt="شعار بلدية طرابلس"
                className="h-10 w-10 rounded-xl"
              />
              <div>
                <h1 className="text-sm font-bold text-foreground leading-tight">
                  منصة المسح والتطبيق
                </h1>
                <p className="text-[10px] text-muted-foreground">
                  بلدية طرابلس - إدارة التخطيط الحضري
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/auth">
                <Button variant="ghost" size="sm">
                  دخول
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  تسجيل الدخول
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        {/* Decorative gold line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-l from-secondary via-secondary/50 to-transparent" />

        <div className="max-w-5xl mx-auto text-center relative">
          {/* Gold badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-xs font-medium mb-6 border border-secondary/20"
          >
            <Building2 className="h-3.5 w-3.5" />
            بلدية طرابلس
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6"
          >
            منظومة رقمية متكاملة
            <br />
            <span className="text-primary">لقسم المسح والتطبيق</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            نحو التحول الرقمي الشامل لأعمال قسم المسح والتطبيق
            <br />
            والتخلص من النماذج الورقية عبر أنظمة إلكترونية متطورة وآمنة
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <Link to="/auth">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 text-base px-8 h-12"
              >
                الدخول إلى النظام
                <ChevronLeft className="mr-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/auth">
              <Button
                size="lg"
                variant="outline"
                className="text-base px-8 h-12 border-2"
              >
                إنشاء حساب جديد
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "النماذج", value: "9+", color: "from-primary/80 to-primary" },
              { label: "المستخدمين", value: "—", color: "from-secondary/80 to-secondary" },
              { label: "المعاملات", value: "—", color: "from-chart-3/80 to-chart-3" },
              { label: "البلاغات", value: "—", color: "from-chart-4/80 to-chart-4" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
                className="edge-3d rounded-xl p-5 text-center bg-card"
              >
                <div className={cn(
                  "inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br mb-3 text-white",
                  stat.color
                )}>
                  <BarChart3 className="h-4 w-4" />
                </div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-foreground mb-3">
              مميزات المنظومة
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              منظومة متكاملة لرقمنة جميع أعمال قسم المسح والتطبيق
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="glass rounded-xl p-6 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
              >
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass rounded-2xl p-10 edge-3d"
          >
            <Building2 className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-3">
              انطلق مع التحول الرقمي
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              سجل الآن للاستفادة من المنظومة الرقمية المتكاملة لإدارة معاملات قسم المسح والتطبيق
            </p>
            <Link to="/auth">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 text-base px-8">
                بدء الاستخدام
                <ChevronLeft className="mr-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Building2 className="h-4 w-4 text-primary" />
            <p className="text-sm font-medium text-foreground">
              منصة المسح والتطبيق
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            جميع الحقوق محفوظة © {new Date().getFullYear()} - بلدية طرابلس - إدارة التخطيط الحضري
          </p>
        </div>
      </footer>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
