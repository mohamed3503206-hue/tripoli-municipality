// =========== إدارة القوالب - Template Builder ===========
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  FileText,
  Plus,
  Edit3,
  Trash2,
  Save,
  X,
  ChevronLeft,
  Settings2,
  FileType,
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
  DialogFooter,
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
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";

const FIELD_TYPES = [
  { value: "text", label: "نص", icon: "Aa" },
  { value: "textarea", label: "نص طويل", icon: "¶" },
  { value: "number", label: "رقم", icon: "#" },
  { value: "date", label: "تاريخ", icon: "📅" },
  { value: "select", label: "قائمة منسدلة", icon: "▼" },
  { value: "file", label: "رفع ملف", icon: "📎" },
  { value: "checkbox", label: "خانة اختيار", icon: "☑" },
  { value: "radio", label: "اختيار واحد", icon: "◉" },
  { value: "citizen_field", label: "حقل تعبئة مواطن", icon: "👤" },
] as const;

const TEMPLATE_CATEGORIES = [
  "تقارير",
  "رخص",
  "شهادات",
  "طلبات",
];

export default function Templates() {
  const navigate = useNavigate();
  const templates = useQuery(api.templates.list, { includeInactive: true });
  const seedDefaults = useMutation(api.templates.seedDefaults);
  const removeTemplate = useMutation(api.templates.remove);

  const [showBuilder, setShowBuilder] = useState<string | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Seed templates on first load
  useEffect(() => {
    if (templates && templates.length === 0) {
      seedDefaults();
    }
  }, [templates]);

  if (showBuilder) {
    return (
      <TemplateBuilder
        templateId={showBuilder}
        onBack={() => {
          setShowBuilder(null);
          setEditingTemplate(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">إدارة القوالب</h2>
          <p className="text-sm text-muted-foreground mt-1">
            إضافة وتعديل وحذف قوالب النماذج دون الحاجة للمبرمج
          </p>
        </div>
        <Button
          onClick={() => setShowBuilder("new")}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="ml-2 h-4 w-4" />
          قالب جديد
        </Button>
      </div>

      {/* Templates Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates?.map((template: any) => (
          <Card
            key={template._id}
            className="edge-3d-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-semibold">
                      {template.name}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {template.category || "عام"} · {template.fields?.length || 0} حقل
                    </p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                {template.description || "لا يوجد وصف"}
              </p>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {template.fields?.slice(0, 4).map((f: any) => (
                  <Badge key={f.id} variant="secondary" className="text-[10px]">
                    {f.label}
                  </Badge>
                ))}
                {(template.fields?.length || 0) > 4 && (
                  <Badge variant="outline" className="text-[10px]">
                    +{template.fields.length - 4}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-border">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => setShowBuilder(template._id)}
                >
                  <Edit3 className="ml-1 h-3 w-3" />
                  تعديل
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs text-destructive hover:text-destructive"
                  onClick={() => setDeleteId(template._id)}
                >
                  <Trash2 className="ml-1 h-3 w-3" />
                  حذف
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذا القالب؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>              <AlertDialogAction
                className="bg-destructive text-destructive-foreground"
                onClick={async () => {
                  if (deleteId) {
                    try {
                      await removeTemplate({ id: deleteId as any });
                      toast.success("تم حذف القالب بنجاح");
                    } catch (err) {
                      toast.error("حدث خطأ أثناء الحذف");
                    }
                    setDeleteId(null);
                  }
                }}
              >
                حذف
              </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// =========== Template Builder ===========
function TemplateBuilder({
  templateId,
  onBack,
}: {
  templateId: string;
  onBack: () => void;
}) {
  const existingTemplate = useQuery(
    api.templates.getById,
    templateId !== "new" ? { id: templateId as any } : "skip",
  );
  const createTemplate = useMutation(api.templates.create);
  const updateTemplate = useMutation(api.templates.update);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [fields, setFields] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [addFieldOpen, setAddFieldOpen] = useState(false);

  // New field form
  const [newFieldLabel, setNewFieldLabel] = useState("");
  const [newFieldType, setNewFieldType] = useState("text");
  const [newFieldRequired, setNewFieldRequired] = useState(true);
  const [newFieldOptions, setNewFieldOptions] = useState("");
  const [newFieldIsCitizen, setNewFieldIsCitizen] = useState(false);

  useEffect(() => {
    if (existingTemplate && templateId !== "new") {
      setName(existingTemplate.name);
      setSlug(existingTemplate.slug);
      setDescription(existingTemplate.description || "");
      setCategory(existingTemplate.category || "");
      setFields(existingTemplate.fields || []);
    }
  }, [existingTemplate, templateId]);

  const addField = () => {
    if (!newFieldLabel.trim()) return;

    const field: any = {
      id: `field_${Date.now()}`,
      type: newFieldType,
      label: newFieldLabel,
      required: newFieldRequired,
      order: fields.length,
      isCitizenField: newFieldIsCitizen,
    };

    if (newFieldType === "select" || newFieldType === "radio") {
      field.options = newFieldOptions.split(",").map((o) => o.trim()).filter(Boolean);
    }

    if (newFieldIsCitizen) {
      field.type = "citizen_field";
    }

    setFields([...fields, field]);
    setNewFieldLabel("");
    setNewFieldType("text");
    setNewFieldRequired(true);
    setNewFieldOptions("");
    setNewFieldIsCitizen(false);
    setAddFieldOpen(false);
  };

  const removeField = (fieldId: string) => {
    setFields(fields.filter((f) => f.id !== fieldId));
  };

  const moveField = (index: number, direction: "up" | "down") => {
    const newFields = [...fields];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newFields.length) return;
    [newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]];
    newFields.forEach((f, i) => (f.order = i));
    setFields(newFields);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("يرجى إدخال اسم القالب");
      return;
    }

    setSaving(true);
    try {
      const templateData = {
        name,
        slug: slug || name.replace(/\s+/g, "-"),
        description,
        category: category || "عام",
        fields: fields.map((f, i) => ({ ...f, order: i })),
        isDefault: false,
      };

      if (templateId === "new") {
        await createTemplate(templateData);
        toast.success("تم إنشاء القالب بنجاح");
      } else {
        await updateTemplate({ id: templateId as any, ...templateData });
        toast.success("تم تحديث القالب بنجاح");
      }
      onBack();
    } catch (err) {
      toast.error("حدث خطأ أثناء الحفظ");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {templateId === "new" ? "قالب جديد" : "تعديل القالب"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {templateId === "new"
                ? "أنشئ قالب نموذج جديد بإضافة الحقول المطلوبة"
                : "تعديل القالب وإدارة حقوله"}
            </p>
          </div>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Save className="ml-2 h-4 w-4" />
          {saving ? "جاري الحفظ..." : "حفظ القالب"}
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Template Info */}
        <Card className="lg:col-span-1 edge-3d-sm">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Settings2 className="h-4 w-4 text-primary" />
              معلومات القالب
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>اسم القالب *</Label>
              <Input
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (templateId === "new") {
                    setSlug(e.target.value.replace(/\s+/g, "-").toLowerCase());
                  }
                }}
                placeholder="مثال: تقرير فني"
              />
            </div>
            <div className="space-y-2">
              <Label>المعرّف (slug)</Label>
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="technical-report"
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label>الوصف</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="وصف مختصر للقالب..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>التصنيف</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر التصنيف" />
                </SelectTrigger>
                <SelectContent>
                  {TEMPLATE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Fields Editor */}
        <Card className="lg:col-span-2 edge-3d-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileType className="h-4 w-4 text-primary" />
                الحقول ({fields.length})
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAddFieldOpen(true)}
              >
                <Plus className="ml-1 h-3 w-3" />
                إضافة حقل
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {fields.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
                <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  لم يتم إضافة أي حقول بعد
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => setAddFieldOpen(true)}
                >
                  <Plus className="ml-1 h-3 w-3" />
                  إضافة أول حقل
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex flex-col gap-0.5">
                      <button
                        onClick={() => moveField(index, "up")}
                        disabled={index === 0}
                        className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                      >
                        <span className="text-[8px]">▲</span>
                      </button>
                      <button
                        onClick={() => moveField(index, "down")}
                        disabled={index === fields.length - 1}
                        className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                      >
                        <span className="text-[8px]">▼</span>
                      </button>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground">
                          {field.label}
                        </p>
                        {field.required && (
                          <span className="text-destructive text-xs">*</span>
                        )}
                        {field.isCitizenField && (
                          <Badge variant="outline" className="text-[8px] py-0 h-4">
                            مواطن
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {FIELD_TYPES.find((t) => t.value === field.type)?.label || field.type}
                        {field.options && ` · ${field.options.join(", ")}`}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => removeField(field.id)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Field Dialog */}
      <Dialog open={addFieldOpen} onOpenChange={setAddFieldOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إضافة حقل جديد</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>اسم الحقل *</Label>
              <Input
                value={newFieldLabel}
                onChange={(e) => setNewFieldLabel(e.target.value)}
                placeholder="مثال: اسم المشروع"
              />
            </div>
            <div className="space-y-2">
              <Label>نوع الحقل</Label>
              <Select value={newFieldType} onValueChange={setNewFieldType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FIELD_TYPES.map((ft) => (
                    <SelectItem key={ft.value} value={ft.value}>
                      <span className="flex items-center gap-2">
                        <span>{ft.icon}</span>
                        {ft.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {(newFieldType === "select" || newFieldType === "radio") && (
              <div className="space-y-2">
                <Label>الخيارات (مفصولة بفواصل)</Label>
                <Input
                  value={newFieldOptions}
                  onChange={(e) => setNewFieldOptions(e.target.value)}
                  placeholder="خيار 1, خيار 2, خيار 3"
                />
              </div>
            )}
            <div className="flex items-center gap-2">
              <Checkbox
                id="field-required"
                checked={newFieldRequired}
                onCheckedChange={(c) => setNewFieldRequired(c as boolean)}
              />
              <Label htmlFor="field-required">حقل إجباري</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="field-citizen"
                checked={newFieldIsCitizen}
                onCheckedChange={(c) => setNewFieldIsCitizen(c as boolean)}
              />
              <Label htmlFor="field-citizen">
                حقل تعبئة للمواطن (لتعبئة النموذج الفارغ)
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddFieldOpen(false)}>
              إلغاء
            </Button>
            <Button
              onClick={addField}
              disabled={!newFieldLabel.trim()}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              إضافة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
