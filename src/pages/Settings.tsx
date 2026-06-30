// =========== الإعدادات - Settings ===========
import { useState } from "react";
import {
  Building2,
  Globe,
  Image,
  QrCode,
  Save,
  Palette,
  Type,
  Printer,
  Layout,
  FileText,
  ZoomIn,
  Mail,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const TABS = [
  { id: "general", label: "عام", icon: Globe },
  { id: "fonts", label: "الخطوط", icon: Type },
  { id: "qr-barcode", label: "QR والباركود", icon: QrCode },
  { id: "printing", label: "الطباعة", icon: Printer },
  { id: "appearance", label: "المظهر", icon: Palette },
];

const FONT_OPTIONS = [
  { value: "Cairo", label: "Cairo" },
  { value: "Noto Sans Arabic", label: "Noto Sans Arabic" },
  { value: "Amiri", label: "Amiri" },
  { value: "Readex Pro", label: "Readex Pro" },
  { value: "Tajawal", label: "Tajawal" },
  { value: "Almarai", label: "Almarai" },
];

const PAPER_SIZES = [
  { value: "A4", label: "A4 (210×297 مم)" },
  { value: "A3", label: "A3 (297×420 مم)" },
  { value: "Legal", label: "Legal (216×356 مم)" },
  { value: "Letter", label: "Letter (216×279 مم)" },
];

const MARGIN_OPTIONS = [
  { value: "10", label: "10 مم" },
  { value: "15", label: "15 مم" },
  { value: "20", label: "20 مم" },
  { value: "25", label: "25 مم" },
  { value: "30", label: "30 مم" },
];

const LOGO_POSITIONS = [
  { value: "right", label: "اليمين" },
  { value: "center", label: "الوسط" },
  { value: "left", label: "اليسار" },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [saving, setSaving] = useState(false);

  // General Settings
  const [systemName, setSystemName] = useState("منصة المسح والتطبيق");
  const [systemShortName, setSystemShortName] = useState("قسم المسح");
  const [municipality, setMunicipality] = useState("بلدية طرابلس");
  const [department, setDepartment] = useState("إدارة التخطيط الحضري");
  const [phone, setPhone] = useState("021-3330000");
  const [address, setAddress] = useState("طرابلس - ليبيا");
  const [email, setEmail] = useState("info@tripoli.ly");

  // Font Settings
  const [uiFont, setUiFont] = useState("Cairo");
  const [printFont, setPrintFont] = useState("Cairo");
  const [uiFontSize, setUiFontSize] = useState("14");
  const [printFontSize, setPrintFontSize] = useState("12");

  // QR & Barcode settings
  const [qrSize, setQrSize] = useState("150");
  const [showQr, setShowQr] = useState(true);
  const [showBarcode, setShowBarcode] = useState(true);
  const [barcodeFormat, setBarcodeFormat] = useState("code128");

  // Print settings
  const [showWatermark, setShowWatermark] = useState(true);
  const [watermarkText, setWatermarkText] = useState("بلدية طرابلس - قسم المسح والتطبيق");
  const [paperSize, setPaperSize] = useState("A4");
  const [pageMargin, setPageMargin] = useState("15");
  const [showLogoInPrint, setShowLogoInPrint] = useState(true);
  const [showHeaderInPrint, setShowHeaderInPrint] = useState(true);
  const [showFooterInPrint, setShowFooterInPrint] = useState(true);
  const [showSignatureInPrint, setShowSignatureInPrint] = useState(true);
  const [logoPosition, setLogoPosition] = useState("right");
  const [showEmailInHeader, setShowEmailInHeader] = useState(true);
  const [showPhoneInHeader, setShowPhoneInHeader] = useState(true);

  const handleSave = async () => {
    setSaving(true);
    try {
      toast.success("تم حفظ الإعدادات بنجاح");
    } catch (err) {
      toast.error("حدث خطأ أثناء حفظ الإعدادات");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">الإعدادات</h2>
          <p className="text-sm text-muted-foreground mt-1">
            إعدادات النظام العامة والتخصيص
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Save className="ml-2 h-4 w-4" />
          {saving ? "جاري الحفظ..." : "حفظ الإعدادات"}
        </Button>
      </div>

      {/* Tab Buttons */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-border pb-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
              activeTab === tab.id
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ===== General Tab ===== */}
      {activeTab === "general" && (
        <div className="space-y-6">
          <Card className="edge-3d-sm">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                معلومات البلدية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { label: "اسم النظام", val: systemName, set: setSystemName },
                  { label: "الاسم المختصر", val: systemShortName, set: setSystemShortName },
                  { label: "اسم البلدية", val: municipality, set: setMunicipality },
                  { label: "الإدارة", val: department, set: setDepartment },
                  { label: "رقم الهاتف", val: phone, set: setPhone },
                  { label: "العنوان", val: address, set: setAddress },
                  { label: "البريد الإلكتروني", val: email, set: setEmail },
                ].map((f) => (
                  <div key={f.label} className="space-y-2">
                    <Label>{f.label}</Label>
                    <Input value={f.val} onChange={(e) => f.set(e.target.value)} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="edge-3d-sm">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Image className="h-4 w-4 text-primary" />
                شعار البلدية
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <img
                  src="/logo.svg"
                  alt="الشعار الحالي"
                  className="w-24 h-24 rounded-xl border-2 border-border object-contain bg-white p-2"
                />
                <div className="space-y-2">
                  <p className="text-sm text-foreground">الشعار الحالي</p>
                  <p className="text-xs text-muted-foreground">
                    SVG, PNG أو JPG - يمكن تغييره من مجلد public/logo.svg
                  </p>
                  <Button variant="outline" size="sm" disabled>
                    تغيير الشعار
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ===== Fonts Tab ===== */}
      {activeTab === "fonts" && (
        <div className="space-y-6">
          <Card className="edge-3d-sm">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Type className="h-4 w-4 text-primary" />
                خطوط الواجهات
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>خط الواجهات العام</Label>
                  <NativeSelect value={uiFont} onChange={setUiFont} options={FONT_OPTIONS} />
                  <p className="text-[10px] text-muted-foreground">
                    يستخدم في جميع صفحات النظام
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>حجم الخط (px)</Label>
                  <NativeSelect value={uiFontSize} onChange={setUiFontSize} options={[
                    { value: "12", label: "12px - صغير" },
                    { value: "13", label: "13px" },
                    { value: "14", label: "14px - افتراضي" },
                    { value: "15", label: "15px" },
                    { value: "16", label: "16px - كبير" },
                    { value: "18", label: "18px" },
                  ]} />
                </div>
              </div>
              {/* Preview */}
              <div className="border-t border-border pt-4">
                <p className="text-sm font-medium mb-2">معاينة الخط</p>
                <div
                  className="p-4 rounded-lg bg-muted/30 border border-border"
                  style={{ fontFamily: uiFont, fontSize: `${uiFontSize}px` }}
                >
                  <p className="font-bold">نص عنوان تجريبي - بسم الله الرحمن الرحيم</p>
                  <p className="mt-2 opacity-70">
                    هذا النص هو مثال لنص عربي يمكن أن يحل في نفس المسافة. نظام المسح والتطبيق - بلدية طرابلس - إدارة التخطيط الحضري.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="edge-3d-sm">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                خطوط الطباعة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>خط الطباعة</Label>
                  <NativeSelect value={printFont} onChange={setPrintFont} options={FONT_OPTIONS} />
                  <p className="text-[10px] text-muted-foreground">
                    يستخدم في المستندات المطبوعة
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>حجم خط الطباعة (pt)</Label>
                  <NativeSelect value={printFontSize} onChange={setPrintFontSize} options={[
                    { value: "10", label: "10pt" },
                    { value: "11", label: "11pt" },
                    { value: "12", label: "12pt - افتراضي" },
                    { value: "13", label: "13pt" },
                    { value: "14", label: "14pt" },
                    { value: "16", label: "16pt" },
                  ]} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ===== QR & Barcode Tab ===== */}
      {activeTab === "qr-barcode" && (
        <div className="space-y-6">
          <Card className="edge-3d-sm">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <QrCode className="h-4 w-4 text-primary" />
                إعدادات QR Code والباركود
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">إظهار QR Code في الطباعة</p>
                  <p className="text-xs text-muted-foreground">رمز الاستجابة السريعة</p>
                </div>
                <ToggleSwitch checked={showQr} onChange={setShowQr} />
              </div>
              {showQr && (
                <div className="space-y-2">
                  <Label>حجم QR Code</Label>
                  <NativeSelect value={qrSize} onChange={setQrSize} options={[
                    { value: "100", label: "100px" },
                    { value: "120", label: "120px" },
                    { value: "150", label: "150px - افتراضي" },
                    { value: "180", label: "180px" },
                    { value: "200", label: "200px" },
                  ]} />
                </div>
              )}

              <div className="border-t border-border pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">إظهار الباركود في الطباعة</p>
                    <p className="text-xs text-muted-foreground">رمز الباركود للمستند</p>
                  </div>
                  <ToggleSwitch checked={showBarcode} onChange={setShowBarcode} />
                </div>
              </div>
              {showBarcode && (
                <div className="space-y-2">
                  <Label>نوع الباركود</Label>
                  <NativeSelect value={barcodeFormat} onChange={setBarcodeFormat} options={[
                    { value: "code128", label: "Code 128" },
                    { value: "code39", label: "Code 39" },
                    { value: "ean13", label: "EAN-13" },
                  ]} />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ===== Printing Tab ===== */}
      {activeTab === "printing" && (
        <div className="space-y-6">
          <Card className="edge-3d-sm">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Layout className="h-4 w-4 text-primary" />
                تخطيط الصفحة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>حجم الورق</Label>
                  <NativeSelect value={paperSize} onChange={setPaperSize} options={PAPER_SIZES} />
                </div>
                <div className="space-y-2">
                  <Label>الهوامش</Label>
                  <NativeSelect value={pageMargin} onChange={setPageMargin} options={MARGIN_OPTIONS} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="edge-3d-sm">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                محتوى الطباعة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">إظهار الشعار في الطباعة</p>
                  <p className="text-xs text-muted-foreground">شعار البلدية في رأس المستند</p>
                </div>
                <ToggleSwitch checked={showLogoInPrint} onChange={setShowLogoInPrint} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">إظهار رأس المستند</p>
                  <p className="text-xs text-muted-foreground">اسم البلدية والإدارة في أعلى الصفحة</p>
                </div>
                <ToggleSwitch checked={showHeaderInPrint} onChange={setShowHeaderInPrint} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">إظهار تذييل المستند</p>
                  <p className="text-xs text-muted-foreground">نص حقوق الملكية في أسفل الصفحة</p>
                </div>
                <ToggleSwitch checked={showFooterInPrint} onChange={setShowFooterInPrint} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">إظهار التوقيع والختم</p>
                  <p className="text-xs text-muted-foreground">مساحة لتوقيع الموظف ورئيس القسم</p>
                </div>
                <ToggleSwitch checked={showSignatureInPrint} onChange={setShowSignatureInPrint} />
              </div>

              {/* New: Logo Position */}
              <div className="border-t border-border pt-4 space-y-2">
                <Label>موضع الشعار في رأس المستند</Label>
                <NativeSelect value={logoPosition} onChange={setLogoPosition} options={LOGO_POSITIONS} />
                <p className="text-[10px] text-muted-foreground">
                  يتحكم في موقع شعار البلدية: اليمين، الوسط، أو اليسار
                </p>
              </div>

              {/* New: Show Email & Phone in Header */}
              <div className="border-t border-border pt-4 space-y-4">
                <p className="text-sm font-medium">معلومات الاتصال في رأس المستند</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">إظهار رقم الهاتف</p>
                      <p className="text-xs text-muted-foreground">رقم هاتف البلدية في رأس الصفحة</p>
                    </div>
                  </div>
                  <ToggleSwitch checked={showPhoneInHeader} onChange={setShowPhoneInHeader} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">إظهار البريد الإلكتروني</p>
                      <p className="text-xs text-muted-foreground">البريد الإلكتروني في رأس الصفحة</p>
                    </div>
                  </div>
                  <ToggleSwitch checked={showEmailInHeader} onChange={setShowEmailInHeader} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="edge-3d-sm">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <ZoomIn className="h-4 w-4 text-primary" />
                العلامة المائية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">إظهار العلامة المائية</p>
                  <p className="text-xs text-muted-foreground">نص شفاف خلف المستند</p>
                </div>
                <ToggleSwitch checked={showWatermark} onChange={setShowWatermark} />
              </div>
              {showWatermark && (
                <div className="space-y-2">
                  <Label>نص العلامة المائية</Label>
                  <Input value={watermarkText} onChange={(e) => setWatermarkText(e.target.value)} />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ===== Appearance Tab ===== */}
      {activeTab === "appearance" && (
        <div className="space-y-6">
          <Card className="edge-3d-sm">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Palette className="h-4 w-4 text-primary" />
                المظهر
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>اتجاه الواجهة</Label>
                  <NativeSelect defaultValue="rtl" onChange={() => {}} options={[
                    { value: "rtl", label: "يمين إلى يسار (RTL)" },
                    { value: "ltr", label: "يسار إلى يمين (LTR)" },
                  ]} />
                </div>
                <div className="space-y-2">
                  <Label>اللغة</Label>
                  <NativeSelect defaultValue="ar" onChange={() => {}} options={[
                    { value: "ar", label: "العربية" },
                    { value: "en", label: "English" },
                  ]} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// =========== Toggle Switch ===========
function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
        checked ? "bg-primary" : "bg-input"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          checked ? "translate-x-[22px]" : "translate-x-[2px]"
        }`}
      />
    </button>
  );
}

// =========== Native Select ===========
function NativeSelect({
  value,
  defaultValue,
  onChange,
  options,
}: {
  value?: string;
  defaultValue?: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      defaultValue={defaultValue}
      onChange={(e) => onChange(e.target.value)}
      className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
      dir="rtl"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
