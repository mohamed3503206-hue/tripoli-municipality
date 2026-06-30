// =========== إدخال النماذج - Forms ===========
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  FileText,
  Plus,
  ChevronLeft,
  Save,
  Printer,
  Search,
  Download,
  Trash2,
  Eye,
  Edit3,
  Loader2,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export default function Forms() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedTemplateId = searchParams.get("template");
  const [showForm, setShowForm] = useState<string | null>(null);
  const [editFormId, setEditFormId] = useState<string | null>(null);
  const [viewFormId, setViewFormId] = useState<string | null>(null);

  const templates = useQuery(api.templates.list, {});
  const records = useQuery(api.records.list, {
    templateId: selectedTemplateId as any || undefined,
  });

  // Open form for a specific template
  useEffect(() => {
    if (selectedTemplateId) {
      setShowForm(selectedTemplateId);
    }
  }, [selectedTemplateId]);

  if (showForm) {
    return (
      <RecordForm
        templateId={showForm}
        editId={editFormId}
        viewId={viewFormId}
        onBack={() => {
          setShowForm(null);
          setEditFormId(null);
          setViewFormId(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">إدخال النماذج</h2>
          <p className="text-sm text-muted-foreground mt-1">
            إضافة وتعديل وعرض سجلات النماذج
          </p>
        </div>
      </div>

      {/* Templates grid for quick entry */}
      {templates && templates.length > 0 && (
        <>
          <div>
            <h3 className="text-sm font-medium text-foreground mb-3">
              اختر النموذج لإدخال سجل جديد
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {templates.map((template: any) => (
                <button
                  key={template._id}
                  onClick={() => setShowForm(template._id)}
                  className="p-4 rounded-xl border border-border bg-card hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 text-right edge-3d-sm"
                >
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-sm font-medium text-foreground">{template.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {template.category || "عام"}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Recent records */}
          <div>
            <h3 className="text-sm font-medium text-foreground mb-3">
              آخر السجلات
            </h3>
            {records?.records && records.records.length > 0 ? (
              <div className="space-y-2">
                {records.records.slice(0, 10).map((record: any) => {
                  const template = templates.find(
                    (t: any) => t._id === record.templateId,
                  );
                  return (
                    <div
                      key={record._id}
                      className="flex items-center gap-4 p-3 rounded-lg border border-border bg-card hover:shadow-sm transition-all edge-3d-sm"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-foreground truncate">
                            {record.ownerName}
                          </p>
                          <Badge variant="outline" className="text-[10px] shrink-0">
                            #{record.formNumber}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {template?.name || "نموذج"} · {record.district} ·{" "}
                          {record.date}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => {
                            setShowForm(record.templateId);
                            setViewFormId(record._id);
                          }}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => {
                            setShowForm(record.templateId);
                            setEditFormId(record._id);
                          }}
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 border-2 border-dashed border-border rounded-xl">
                <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  لا توجد سجلات بعد. اختر نموذجاً للبدء.
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// =========== Record Form Component ===========
function RecordForm({
  templateId,
  editId,
  viewId,
  onBack,
}: {
  templateId: string;
  editId: string | null;
  viewId: string | null;
  onBack: () => void;
}) {
  const template = useQuery(api.templates.getById, { id: templateId as any });
  const existingRecord = useQuery(
    api.records.getById,
    editId ? { id: editId as any } : viewId ? { id: viewId as any } : "skip",
  );
  const createRecord = useMutation(api.records.create);
  const updateRecord = useMutation(api.records.update);
  const districts = useQuery(api.districts.list, {});
  const [newDistrict, setNewDistrict] = useState("");

  const [formNumber, setFormNumber] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [ownerName, setOwnerName] = useState("");
  const [pieceNumber, setPieceNumber] = useState("");
  const [district, setDistrict] = useState("");
  const [locality, setLocality] = useState("");
  const [requestType, setRequestType] = useState("");
  const [notes, setNotes] = useState("");
  const [recommendation, setRecommendation] = useState("");
  const [fieldValues, setFieldValues] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

  const isViewing = !!viewId && !editId;

  useEffect(() => {
    if (existingRecord) {
      setFormNumber(existingRecord.formNumber);
      setDate(existingRecord.date);
      setOwnerName(existingRecord.ownerName);
      setPieceNumber(existingRecord.pieceNumber);
      setDistrict(existingRecord.district);
      setLocality(existingRecord.locality || "");
      setRequestType(existingRecord.requestType);
      setNotes(existingRecord.notes || "");
      setRecommendation(existingRecord.recommendation || "");
      if (existingRecord.fieldValues) {
        try {
          setFieldValues(JSON.parse(existingRecord.fieldValues));
        } catch {}
      }
    }
  }, [existingRecord]);

  const handleSave = async () => {
    if (!ownerName.trim()) {
      toast.error("يرجى إدخال اسم المالك");
      return;
    }

    setSaving(true);
    try {
      // Add district if it's new
      if (district && !districts?.find((d: any) => d.name === district)) {
        // Will be added by admin later
      }

      const data = {
        templateId: templateId as any,
        formNumber: formNumber || `F-${Date.now()}`,
        date,
        ownerName,
        pieceNumber,
        district,
        locality,
        requestType,
        notes,
        recommendation,
        fieldValues: JSON.stringify(fieldValues),
      };

      if (editId) {
        await updateRecord({ id: editId as any, ...data });
        toast.success("تم تحديث السجل بنجاح");
      } else {
        await createRecord(data);
        toast.success("تم إنشاء السجل بنجاح");
      }
      onBack();
    } catch (err) {
      toast.error("حدث خطأ أثناء الحفظ");
    } finally {
      setSaving(false);
    }
  };

  const renderFieldInput = (field: any) => {
    const value = fieldValues[field.id] || "";

    if (isViewing) {
      return (
        <div className="p-3 rounded-lg bg-muted/30 border border-border">
          <p className="text-xs text-muted-foreground mb-1">{field.label}</p>
          <p className="text-sm text-foreground">
            {value || <span className="text-muted-foreground/50">—</span>}
          </p>
        </div>
      );
    }

    switch (field.type) {
      case "textarea":
        return (
          <Textarea
            value={value}
            onChange={(e) =>
              setFieldValues({ ...fieldValues, [field.id]: e.target.value })
            }
            placeholder={field.placeholder || `أدخل ${field.label}`}
            className="min-h-[120px] text-right"
            rows={5}
          />
        );
      case "number":
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) =>
              setFieldValues({ ...fieldValues, [field.id]: e.target.value })
            }
            placeholder={field.placeholder || `أدخل ${field.label}`}
            className="text-right"
          />
        );
      case "select":
        return (
          <Select
            value={value}
            onValueChange={(v) =>
              setFieldValues({ ...fieldValues, [field.id]: v })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder={`اختر ${field.label}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((opt: string) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case "checkbox":
        return (
          <div className="flex items-center gap-2">
            <Checkbox
              id={field.id}
              checked={!!value}
              onCheckedChange={(c) =>
                setFieldValues({ ...fieldValues, [field.id]: c })
              }
            />
            <Label htmlFor={field.id}>{field.label}</Label>
          </div>
        );
      case "date":
        return (
          <Input
            type="date"
            value={value}
            onChange={(e) =>
              setFieldValues({ ...fieldValues, [field.id]: e.target.value })
            }
            className="text-right"
          />
        );
      default:
        return (
          <Input
            type="text"
            value={value}
            onChange={(e) =>
              setFieldValues({ ...fieldValues, [field.id]: e.target.value })
            }
            placeholder={field.placeholder || `أدخل ${field.label}`}
            className="text-right"
          />
        );
    }
  };

  if (!template) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {isViewing ? "عرض السجل" : editId ? "تعديل السجل" : `نموذج: ${template.name}`}
            </h2>
            <p className="text-sm text-muted-foreground">
              {template.description || "إدخال بيانات النموذج"}
            </p>
          </div>
        </div>
        {!isViewing && (
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Save className="ml-2 h-4 w-4" />
            {saving ? "جاري الحفظ..." : "حفظ"}
          </Button>
        )}
      </div>

      {/* Form */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Common Fields */}
        <Card className="lg:col-span-2 edge-3d-sm">
          <CardHeader>
            <CardTitle className="text-sm">البيانات الأساسية</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>رقم النموذج</Label>
                {isViewing ? (
                  <div className="p-2.5 rounded-lg bg-muted/30 border border-border text-sm">
                    {formNumber}
                  </div>
                ) : (
                  <Input
                    value={formNumber}
                    onChange={(e) => setFormNumber(e.target.value)}
                    placeholder="رقم النموذج"
                    className="text-right"
                  />
                )}
              </div>
              <div className="space-y-2">
                <Label>التاريخ</Label>
                {isViewing ? (
                  <div className="p-2.5 rounded-lg bg-muted/30 border border-border text-sm">
                    {date}
                  </div>
                ) : (
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="text-right"
                  />
                )}
              </div>
              <div className="space-y-2">
                <Label>اسم المالك</Label>
                {isViewing ? (
                  <div className="p-2.5 rounded-lg bg-muted/30 border border-border text-sm">
                    {ownerName}
                  </div>
                ) : (
                  <Input
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="اسم المالك"
                    className="text-right"
                  />
                )}
              </div>
              <div className="space-y-2">
                <Label>رقم القطعة</Label>
                {isViewing ? (
                  <div className="p-2.5 rounded-lg bg-muted/30 border border-border text-sm">
                    {pieceNumber}
                  </div>
                ) : (
                  <Input
                    value={pieceNumber}
                    onChange={(e) => setPieceNumber(e.target.value)}
                    placeholder="رقم القطعة"
                    className="text-right"
                  />
                )}
              </div>
              <div className="space-y-2">
                <Label>المنطقة</Label>
                {isViewing ? (
                  <div className="p-2.5 rounded-lg bg-muted/30 border border-border text-sm">
                    {district}
                  </div>
                ) : (
                  <div className="relative">
                    <Input
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      placeholder="أدخل اسم المنطقة"
                      className="text-right"
                      list="districts-list"
                    />
                    <datalist id="districts-list">
                      {districts?.map((d: any) => (
                        <option key={d._id} value={d.name} />
                      ))}
                    </datalist>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label>المحلة</Label>
                {isViewing ? (
                  <div className="p-2.5 rounded-lg bg-muted/30 border border-border text-sm">
                    {locality}
                  </div>
                ) : (
                  <Input
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    placeholder="المحلة"
                    className="text-right"
                  />
                )}
              </div>
              <div className="space-y-2">
                <Label>نوع الطلب</Label>
                {isViewing ? (
                  <div className="p-2.5 rounded-lg bg-muted/30 border border-border text-sm">
                    {requestType}
                  </div>
                ) : (
                  <Select value={requestType} onValueChange={setRequestType}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر نوع الطلب" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="تقرير فني">تقرير فني</SelectItem>
                      <SelectItem value="شهادة استعمال">شهادة استعمال</SelectItem>
                      <SelectItem value="رخصة صيانة">رخصة صيانة</SelectItem>
                      <SelectItem value="رخصة هدم">رخصة هدم</SelectItem>
                      <SelectItem value="إذن حفر">إذن حفر</SelectItem>
                      <SelectItem value="محضر معاينة">محضر معاينة</SelectItem>
                      <SelectItem value="استعلام">استعلام</SelectItem>
                      <SelectItem value="أخرى">أخرى</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Template-specific fields */}
        {template.fields && template.fields.length > 0 && (
          <Card className="lg:col-span-2 edge-3d-sm">
            <CardHeader>
              <CardTitle className="text-sm">حقول القالب</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                {template.fields
                  .filter((f: any) => !f.isCitizenField)
                  .sort((a: any, b: any) => a.order - b.order)
                  .map((field: any) => (
                    <div
                      key={field.id}
                      className={field.type === "textarea" ? "sm:col-span-2" : ""}
                    >
                      <div className="space-y-2">
                        <Label>
                          {field.label}
                          {field.required && (
                            <span className="text-destructive mr-1">*</span>
                          )}
                        </Label>
                        {renderFieldInput(field)}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notes & Recommendation */}
        <Card className="edge-3d-sm">
          <CardHeader>
            <CardTitle className="text-sm">الملاحظات</CardTitle>
          </CardHeader>
          <CardContent>
            {isViewing ? (
              <div className="p-3 rounded-lg bg-muted/30 border border-border">
                <p className="text-sm text-foreground whitespace-pre-wrap">
                  {notes || <span className="text-muted-foreground/50">—</span>}
                </p>
              </div>
            ) : (
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="أدخل الملاحظات..."
                className="min-h-[200px] text-right"
                rows={8}
              />
            )}
          </CardContent>
        </Card>

        <Card className="edge-3d-sm">
          <CardHeader>
            <CardTitle className="text-sm">التوصية</CardTitle>
          </CardHeader>
          <CardContent>
            {isViewing ? (
              <div className="p-3 rounded-lg bg-muted/30 border border-border">
                <p className="text-sm text-foreground whitespace-pre-wrap">
                  {recommendation || <span className="text-muted-foreground/50">—</span>}
                </p>
              </div>
            ) : (
              <Textarea
                value={recommendation}
                onChange={(e) => setRecommendation(e.target.value)}
                placeholder="أدخل التوصية..."
                className="min-h-[200px] text-right"
                rows={8}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
