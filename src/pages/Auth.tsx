// =========== صفحة تسجيل الدخول - رمز التحقق عبر البريد ===========
import { ArrowLeft, Loader2, Mail, UserX, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import logoSvg from "@/assets/logo.svg";

interface AuthProps {
  redirectAfterAuth?: string;
}

function Auth({ redirectAfterAuth = "/dashboard" }: AuthProps) {
  const { isLoading: authLoading, isAuthenticated, signIn } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<"email" | { email: string }>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate(redirectAfterAuth, { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate, redirectAfterAuth]);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.set("email", email);
      await signIn("email-otp", formData);
      setStep({ email });
      setIsLoading(false);
    } catch (err: any) {
      console.error("Send code error:", err);
      setError("فشل إرسال رمز التحقق. تحقق من البريد الإلكتروني وحاول مرة أخرى.");
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const code = otp.join("");
      const formData = new FormData();
      formData.set("email", typeof step === "object" ? step.email : "");
      formData.set("code", code);
      await signIn("email-otp", formData);
      navigate(redirectAfterAuth, { replace: true });
    } catch (err: any) {
      console.error("Verify code error:", err);
      setError("رمز التحقق غير صحيح. حاول مرة أخرى.");
      setIsLoading(false);
      setOtp(["", "", "", "", "", ""]);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const next = document.getElementById(`otp-${index + 1}`);
      next?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prev = document.getElementById(`otp-${index - 1}`);
      prev?.focus();
    }
  };

  const handleGuestLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signIn("anonymous");
      navigate(redirectAfterAuth, { replace: true });
    } catch (err: any) {
      console.error("Guest login error:", err);
      setError("فشل تسجيل الدخول كزائر");
      setIsLoading(false);
    }
  };

  const currentEmail = typeof step === "object" ? step.email : email;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4" dir="rtl">
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-l from-secondary via-secondary/50 to-transparent" />
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      {step === "email" ? (
        /* ===== الخطوة 1: إدخال البريد الإلكتروني ===== */
        <Card className="w-full max-w-md relative glass edge-3d">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-4">
              <img
                src={logoSvg}
                alt="شعار بلدية طرابلس"
                className="w-16 h-16 rounded-2xl shadow-lg shadow-primary/20"
              />
            </div>
            <CardTitle className="text-xl font-bold text-foreground">
              منصة المسح والتطبيق
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              بلدية طرابلس - إدارة التخطيط الحضري
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSendCode}>
            <CardContent className="space-y-4">
              {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg border border-destructive/20">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 pr-9 text-right"
                    required
                    dir="ltr"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="remember"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 shrink-0 rounded-[4px] border border-input shadow-xs accent-primary focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 cursor-pointer"
                />
                <Label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer select-none">
                  تذكرني
                </Label>
              </div>
            </CardContent>

            <CardFooter className="flex-col gap-3">
              <Button
                type="submit"
                className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
                disabled={isLoading || !email}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    جاري الإرسال...
                  </>
                ) : (
                  <>
                    إرسال رمز التحقق
                    <ArrowLeft className="mr-2 h-4 w-4" />
                  </>
                )}
              </Button>

              <div className="relative w-full my-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">أو</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full h-11"
                onClick={handleGuestLogin}
                disabled={isLoading}
              >
                <UserX className="ml-2 h-4 w-4" />
                دخول كزائر
              </Button>
            </CardFooter>
          </form>

          <div className="px-6 pb-4 text-center text-xs text-muted-foreground border-t border-border pt-4">
            جميع الحقوق محفوظة © {new Date().getFullYear()} - بلدية طرابلس
          </div>
        </Card>
      ) : (
        /* ===== الخطوة 2: إدخال رمز التحقق ===== */
        <Card className="w-full max-w-md relative glass edge-3d">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-4">
              <img
                src={logoSvg}
                alt="شعار بلدية طرابلس"
                className="w-16 h-16 rounded-2xl shadow-lg shadow-emerald-200"
              />
            </div>
            <CardTitle className="text-xl font-bold text-foreground">
              رمز التحقق
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              تم إرسال رمز مكون من 6 أرقام إلى
              <br />
              <span className="font-medium text-foreground" dir="ltr">
                {currentEmail}
              </span>
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleVerifyCode}>
            <CardContent className="space-y-6">
              {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg border border-destructive/20">
                  {error}
                </div>
              )}

              <div className="flex justify-center gap-2" dir="ltr">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-12 h-14 text-center text-lg font-bold border-2 border-border rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200"
                    autoFocus={index === 0}
                    disabled={isLoading}
                  />
                ))}
              </div>

              <p className="text-xs text-center text-muted-foreground">
                لم يصلك الرمز؟{" "}
                <button
                  type="button"
                  onClick={() => setStep("email")}
                  className="text-primary hover:underline font-medium"
                >
                  إرسال رمز جديد
                </button>
              </p>
            </CardContent>

            <CardFooter>
              <Button
                type="submit"
                className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
                disabled={isLoading || otp.some((d) => !d)}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    جاري التحقق...
                  </>
                ) : (
                  <>
                    <CheckCircle className="ml-2 h-4 w-4" />
                    تأكيد الدخول
                  </>
                )}
              </Button>
            </CardFooter>
          </form>

          <div className="px-6 pb-4 text-center text-xs text-muted-foreground border-t border-border pt-4">
            جميع الحقوق محفوظة © {new Date().getFullYear()} - بلدية طرابلس
          </div>
        </Card>
      )}
    </div>
  );
}

export default function AuthPage(props: AuthProps) {
  return <Auth {...props} />;
}
