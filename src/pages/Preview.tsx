// =========== الطباعة والمعاينة - Print Preview ===========
import { useRef, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSearchParams, useNavigate } from "react-router";
import {
  Printer,
  Download,
  ChevronLeft,
  FileText,
  Search,
  FilePlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";

import { toast } from "sonner";
import logoSvg from "@/assets/logo.svg";

// Simple QR Code SVG generator
function generateQRCodeSvg(text: string): string {
  const hash = text.split("").reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  const cells: boolean[] = [];
  for (let i = 0; i < 121; i++) {
    cells.push(Boolean(hash & (1 << (i % 31))));
  }
  return cells
    .map(
      (c, i) =>
        `<rect x="${(i % 11) * 10}" y="${Math.floor(i / 11) * 10}" width="8" height="8" fill="${c ? "#1B2A4A" : "white"}" rx="1"/>`,
    )
    .join("");
}

// Improved Barcode SVG generator - more visible
function generateBarcodeSvg(text: string): string {
  const chars = text.split("");
  const totalWidth = chars.length * 6 + 6;
  const bars = chars
    .map((c, i) => {
      const code = c.charCodeAt(0);
      const width = (code % 4) + 1;
      const x = i * 6 + 3;
      return `<rect x="${x}" y="0" width="${width}" height="50" fill="#1B2A4A"/>`;
    })
    .join("");
  // Start marker
  const startBar = `<rect x="1" y="0" width="3" height="50" fill="#1B2A4A"/>`;
  // End marker (after all bars)
  const endBar = `<rect x="${totalWidth - 3}" y="0" width="3" height="50" fill="#1B2A4A"/>`;
  return startBar + bars + endBar;
}

export default function PreviewPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const recordId = searchParams.get("record");
  const printRef = useRef<HTMLDivElement>(null);

  const record = useQuery(
    api.records.getById,
    recordId ? { id: recordId as any } : "skip",
  );
  const templates = useQuery(api.templates.list, {});
  const [selectedRecordId, setSelectedRecordId] = useState(recordId || "");
  const records = useQuery(api.records.list, {});

  // Blank form state
  const [blankFormMode, setBlankFormMode] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");

  const template = blankFormMode
    ? templates?.find((t: any) => t._id === selectedTemplateId)
    : record
      ? templates?.find((t: any) => t._id === record.templateId)
      : null;

  // Print settings (hardcoded defaults for now — will connect to Convex settings later)
  const [printSettings, setPrintSettings] = useState({
    showLogo: true,
    showHeader: true,
    showFooter: true,
    showSignature: true,
    showWatermark: true,
    showQr: true,
    showBarcode: true,
    watermarkText: "بلدية طرابلس - قسم المسح والتطبيق",
    paperSize: "A4",
    pageMargin: "15",
    printFont: "Cairo",
    printFontSize: "12",
    logoPosition: "right", // right | center | left
    showEmail: true,
    showPhone: true,
  });

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    toast.success("جاري تجهيز المستند للطباعة");
    window.print();
  };

  // Generate QR content from record data or template
  const qrContent = record
    ? `${record.formNumber}|${record.ownerName}|${record.district}|${record.date}`
    : template
      ? `نموذج فارغ|${template.name}`
      : "";

  // Enter blank form mode
  const startBlankForm = () => {
    setBlankFormMode(true);
    setSelectedRecordId("");
  };

  // Enter record mode
  const startRecordMode = () => {
    setBlankFormMode(false);
    setSelectedRecordId(recordId || "");
  };

  // Get citizen fields for blank form
  const citizenFields = template?.fields?.filter((f: any) => f.isCitizenField) || [];
  const regularFields = template?.fields?.filter((f: any) => !f.isCitizenField) || [];
  const [citizenFieldValues, setCitizenFieldValues] = useState<Record<string, string>>({});

  const showContent = (blankFormMode && template) || record;

  return (
    <div className="space-y-6" dir="rtl">
      {/* Toolbar */}
      <div className="flex items-center justify-between no-print">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-lg font-bold text-foreground">الطباعة والمعاينة</h2>
            <p className="text-sm text-muted-foreground">
              معاينة وطباعة النماذج والسجلات
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handlePrint}
            className="hidden sm:flex"
          >
            <Printer className="ml-2 h-4 w-4" />
            طباعة
          </Button>
          <Button
            onClick={handleDownloadPDF}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Download className="ml-2 h-4 w-4" />
            تحميل PDF
          </Button>
        </div>
      </div>

      {/* Mode Switcher - Record or Blank Form */}
      <div className="flex items-center gap-3 no-print">
        <Button
          variant={blankFormMode ? "outline" : "default"}
          onClick={startRecordMode}
          size="sm"
          className={!blankFormMode ? "bg-primary text-primary-foreground" : ""}
        >
          <FileText className="ml-1 h-4 w-4" />
          سجل موجود
        </Button>
        <Button
          variant={blankFormMode ? "default" : "outline"}
          onClick={startBlankForm}
          size="sm"
          className={blankFormMode ? "bg-primary text-primary-foreground" : ""}
        >
          <FilePlus className="ml-1 h-4 w-4" />
          نموذج فارغ
        </Button>
      </div>

      {/* Record Selector (when in record mode) */}
      {!blankFormMode && (
        <div className="max-w-xs no-print">
          <select
            value={selectedRecordId}
            onChange={(e) => {
              const val = e.target.value;
              setSelectedRecordId(val);
              if (val) navigate(`/preview?record=${val}`, { replace: true });
            }}
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer"
            dir="rtl"
          >
            <option value="">اختر سجلاً للطباعة</option>
            {records?.records?.map((r: any) => (
              <option key={r._id} value={r._id}>
                #{r.formNumber} - {r.ownerName}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Template Selector (when in blank form mode) */}
      {blankFormMode && (
        <div className="max-w-xs no-print">
          <select
            value={selectedTemplateId}
            onChange={(e) => setSelectedTemplateId(e.target.value)}
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer"
            dir="rtl"
          >
            <option value="">اختر النموذج الفارغ</option>
            {templates?.map((t: any) => (
              <option key={t._id} value={t._id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Citizen Fields Form (blank form mode) */}
      {blankFormMode && template && citizenFields.length > 0 && (
        <div className="bg-white rounded-xl border border-border p-4 no-print space-y-3">
          <h3 className="text-sm font-bold text-foreground">معلومات المواطن (تعبئة اختيارية)</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {citizenFields.map((field: any) => (
              <div key={field.id} className="space-y-1">
                <label className="text-xs text-muted-foreground">
                  {field.label}
                  {field.required && <span className="text-destructive mr-1">*</span>}
                </label>
                <input
                  type="text"
                  value={citizenFieldValues[field.id] || ""}
                  onChange={(e) =>
                    setCitizenFieldValues((prev) => ({ ...prev, [field.id]: e.target.value }))
                  }
                  placeholder={field.placeholder || `أدخل ${field.label}`}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  dir="rtl"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Print Preview */}
      {showContent ? (
        <div
          ref={printRef}
          className="print-container"
          style={{
            fontFamily: printSettings.printFont || "Cairo",
          }}
        >
          {/* ===== PAGE 1 - Document Body ===== */}
          <div className="print-page">
            {/* Page indicator - screen only */}
            <div className="print-page-indicator">
              {blankFormMode ? `صفحة 1 من 2 - ${template?.name}` : "صفحة 1 من 3"}
            </div>

            {/* Watermark */}
            {printSettings.showWatermark && (
              <div
                className="watermark-overlay"
                data-watermark={printSettings.watermarkText}
              />
            )}

            {/* Letterhead */}
            {printSettings.showHeader && (
              <div className="print-letterhead">
                <div className={`flex items-center ${printSettings.logoPosition === "center" ? "flex-col" : ""} ${printSettings.logoPosition === "left" ? "flex-row-reverse" : ""}`}>
                  <div className={`flex-1 ${printSettings.logoPosition === "center" ? "text-center" : ""}`}>
                    <h1 className="print-title">بلدية طرابلس</h1>
                    <h2 className="print-subtitle">
                      إدارة التخطيط الحضري - قسم المسح والتطبيق
                    </h2>
                    <div className={`flex items-center gap-4 mt-1 text-[10px] text-gray-500 flex-wrap ${printSettings.logoPosition === "center" ? "justify-center" : ""}`}>
                      <span>طرابلس - ليبيا</span>
                      {printSettings.showPhone && (
                        <>
                          <span className="text-gray-300">|</span>
                          <span>021-3330000</span>
                        </>
                      )}
                      {printSettings.showEmail && (
                        <>
                          <span className="text-gray-300">|</span>
                          <span>info@tripoli.ly</span>
                        </>
                      )}
                    </div>
                  </div>
                  {printSettings.showLogo && printSettings.logoPosition !== "center" && (
                    <div className="print-logo">
                      <img
                        src={logoSvg}
                        alt="شعار بلدية طرابلس"
                        className="w-14 h-14"
                      />
                    </div>
                  )}
                </div>
                {/* Centered logo option - shows both on screen and in print */}
                {printSettings.showLogo && printSettings.logoPosition === "center" && (
                  <div className="flex justify-center mt-2">
                    <div className="print-logo">
                      <img
                        src={logoSvg}
                        alt="شعار بلدية طرابلس"
                        className="w-14 h-14"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Decorative navy + gold line */}
            <div className="print-header-line" />

            {/* Title */}
            <div className="print-title-section">
              <div className="print-title-decoration">
                <span className="print-title-dot" />
                <span className="print-title-dash" />
              </div>
              <h2 className="print-doc-title">
                {template?.name || "نموذج رسمي"}
              </h2>
              {!blankFormMode && record && (
                <p className="print-doc-number">
                  رقم النموذج: <span className="font-bold">{record.formNumber}</span>
                </p>
              )}
              <div className="print-title-decoration print-title-decoration-bottom">
                <span className="print-title-dash" />
                <span className="print-title-dot" />
              </div>
            </div>

            {/* Content */}
            <div className="print-content">
              {/* Record Info Grid - horizontal cards */}
              {!blankFormMode && record && (
                <div className="print-info-grid">
                  {[
                    { label: "رقم النموذج", value: record.formNumber },
                    { label: "التاريخ", value: record.date },
                    { label: "اسم المالك", value: record.ownerName },
                    { label: "رقم القطعة", value: record.pieceNumber },
                    { label: "المنطقة", value: record.district },
                    { label: "المحلة", value: record.locality },
                    { label: "نوع الطلب", value: record.requestType },
                  ].map((field) => (
                    <div key={field.label} className="print-info-item">
                      <span className="print-info-label">{field.label}</span>
                      <span className="print-info-value">
                        {field.value || "—"}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Blank form citizen info section */}
              {blankFormMode && citizenFields.length > 0 && (
                <div className="print-info-grid">
                  {[...citizenFields]
                    .sort((a: any, b: any) => a.order - b.order)
                    .map((field: any) => (
                      <div key={field.id} className="print-info-item">
                        <span className="print-info-label">{field.label}</span>
                        <span className="print-info-value">
                          {citizenFieldValues[field.id] || "................"}
                        </span>
                      </div>
                    ))}
                </div>
              )}

              <div className="print-section-divider" />

              {/* Template Fields - with bordered cells like info-grid */}
              <div className="print-fields-grid">
              {[...regularFields]
                .sort((a: any, b: any) => a.order - b.order)
                .map((field: any) => {
                  let value = "";
                  if (!blankFormMode && record?.fieldValues) {
                    try {
                      const fv = JSON.parse(record.fieldValues);
                      value = fv[field.id] || "";
                    } catch {}
                  }

                  if (!blankFormMode && !value) return null;

                  const isEmpty = blankFormMode;

                  return (
                    <div key={field.id} className="print-field-row">
                      <span className="print-field-label">{field.label}</span>
                      <span className={`print-field-value ${isEmpty ? "print-field-empty" : ""}`}>
                        {isEmpty ? "________________________" : value}
                      </span>
                    </div>
                  );
                })}

              {/* Notes - for existing record */}
              {!blankFormMode && record?.notes && (
                <div className="print-field-row">
                  <span className="print-field-label">الملاحظات</span>
                  <span className="print-field-value">{record.notes}</span>
                </div>
              )}

              {/* Recommendation - for existing record */}
              {!blankFormMode && record?.recommendation && (
                <div className="print-field-row">
                  <span className="print-field-label">التوصية</span>
                  <span className="print-field-value">{record.recommendation}</span>
                </div>
              )}
              </div>
            </div>

            {/* Page number for print */}
            <div className="print-page-number no-screen">- 1 -</div>
          </div>

          {/* ===== PAGE 2 - SIGNATURE, STAMP, QR & BARCODE ===== */}
          <div className="print-page">
            {/* Page indicator - screen only */}
            <div className="print-page-indicator">
              {blankFormMode ? `صفحة 2 من 2 - ${template?.name}` : "صفحة 2 من 3"}
            </div>

            {/* Signature & Stamp */}
            {printSettings.showSignature && (
              <div className="print-section">
                <div className="print-section-header">
                  <span className="print-section-line" />
                  <span className="print-section-title-text">التوقيع والختم</span>
                  <span className="print-section-line" />
                </div>
                <div className="print-signature-grid">
                  <div className="print-signature-item">
                    <div className="print-signature-line" />
                    <p className="print-signature-label">توقيع الموظف</p>
                    <p className="print-signature-sub">الاسم والتاريخ</p>
                  </div>
                  <div className="print-signature-item">
                    <div className="print-signature-line" />
                    <p className="print-signature-label">توقيع رئيس القسم</p>
                    <p className="print-signature-sub">الاسم والتاريخ</p>
                  </div>
                  <div className="print-signature-item">
                    <div className="print-stamp">
                      <img
                        src={logoSvg}
                        alt="ختم بلدية طرابلس"
                        className="w-10 h-10 opacity-50"
                      />
                    </div>
                    <p className="print-signature-label">ختم القسم</p>
                  </div>
                </div>
              </div>
            )}

            <div className="print-section-divider" />

            {/* QR & Barcode */}
            <div className="print-section">
              <div className="print-section-header">
                <span className="print-section-line" />
                <span className="print-section-title-text">رموز التوثيق</span>
                <span className="print-section-line" />
              </div>
              <div className="print-barcode-grid">
                {printSettings.showQr && (
                  <div className="print-barcode-item">
                    <div className="print-qr-box">
                      <svg
                        viewBox="0 0 110 110"
                        width="110"
                        height="110"
                        style={{ display: "block" }}
                      >
                        <rect width="110" height="110" fill="white" />
                        {generateQRCodeSvg(qrContent)}
                      </svg>
                    </div>
                    <div className="print-barcode-text">
                      <p className="font-bold text-gray-800 text-sm">QR Code</p>
                      <p className="text-gray-500 text-[10px]">امسح للوصول للسجل</p>
                    </div>
                  </div>
                )}
                {printSettings.showBarcode && (
                  <div className="print-barcode-item print-barcode-item-wide">
                    <div className="print-barcode-svg-wrap">
                      <svg
                        viewBox="0 0 220 50"
                        width="220"
                        height="50"
                        style={{ display: "block" }}
                        preserveAspectRatio="xMidYMid meet"
                      >
                        <rect width="220" height="50" fill="white" />
                        {generateBarcodeSvg(
                          record?.formNumber?.padEnd(20, "0") || template?.name || "BLANK",
                        )}
                      </svg>
                    </div>
                    <p className="print-barcode-number">
                      {record?.formNumber || template?.name || ""}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Page number for print */}
            <div className="print-page-number no-screen">- 2 -</div>
          </div>

          {/* ===== PAGE 3 - FOOTER (only for existing records) ===== */}
          {printSettings.showFooter && !blankFormMode && (
            <div className="print-page print-footer-page">
              <div className="print-page-indicator">صفحة 3 من 3</div>

              <div className="print-footer-divider" />
              <div className="print-footer-content">
                <div className="print-footer-logos">
                  <img src={logoSvg} alt="" className="print-footer-logo" />
                </div>
                <p className="print-footer-title">بلدية طرابلس - إدارة التخطيط الحضري</p>
                <p className="print-footer-text">
                  هذا المستند صادر عن بلدية طرابلس - إدارة التخطيط الحضري - قسم المسح والتطبيق
                </p>
                <p className="print-footer-date">
                  تاريخ الطباعة: {new Date().toLocaleDateString("ar-LY")}
                </p>
                <p className="print-footer-copyright">
                  جميع الحقوق محفوظة © {new Date().getFullYear()}
                </p>
              </div>

              <div className="print-page-number no-screen">- 3 -</div>
            </div>
          )}

          {/* ===== Footer page for blank forms (simpler) ===== */}
          {printSettings.showFooter && blankFormMode && (
            <div className="print-page print-footer-page">
              <div className="print-page-indicator">صفحة 2 من 2 - {template?.name}</div>

              <div className="print-footer-divider" />
              <div className="print-footer-content">
                <div className="print-footer-logos">
                  <img src={logoSvg} alt="" className="print-footer-logo" />
                </div>
                <p className="print-footer-title">بلدية طرابلس - إدارة التخطيط الحضري</p>
                <p className="print-footer-text">
                  نموذج فارغ - {template?.name}
                </p>
                <p className="print-footer-date">
                  تاريخ الطباعة: {new Date().toLocaleDateString("ar-LY")}
                </p>
                <p className="print-footer-copyright">
                  جميع الحقوق محفوظة © {new Date().getFullYear()}
                </p>
              </div>

              <div className="print-page-number no-screen">- {blankFormMode ? "2" : "3"} -</div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-20 border-2 border-dashed border-border rounded-xl">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            {blankFormMode ? "اختر نموذجاً فارغاً" : "اختر سجلاً للطباعة"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {blankFormMode
              ? "اختر النموذج الذي تريد طباعته من القائمة أعلاه"
              : "ابحث عن السجل الذي تريد طباعته أو اختره من القائمة أعلاه"}
          </p>
          {!blankFormMode && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => navigate("/search")}
            >
              <Search className="ml-2 h-4 w-4" />
              البحث عن سجل
            </Button>
          )}
        </div>
      )}

      {/* Print buttons at bottom (for mobile) */}
      {showContent && (
        <div className="flex items-center justify-center gap-3 no-print sm:hidden">
          <Button variant="outline" onClick={handlePrint} className="w-32">
            <Printer className="ml-2 h-4 w-4" />
            طباعة
          </Button>
          <Button
            onClick={handleDownloadPDF}
            className="bg-primary text-primary-foreground hover:bg-primary/90 w-32"
          >
            <Download className="ml-2 h-4 w-4" />
            PDF
          </Button>
        </div>
      )}
    </div>
  );
}
