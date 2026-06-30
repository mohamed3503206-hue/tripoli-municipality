// =========== Queries and mutations for Templates (Form Builder) ===========
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { templateFieldValidator } from "./schema";

// List all templates
export const list = query({
  args: {
    includeInactive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    if (args.includeInactive) {
      return await ctx.db.query("templates").collect();
    }
    return await ctx.db
      .query("templates")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

// Get single template
export const getById = query({
  args: { id: v.id("templates") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return await ctx.db.get(args.id);
  },
});

// Get template by slug
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const template = await ctx.db
      .query("templates")
      .filter((q) => q.eq(q.field("slug"), args.slug))
      .first();
    return template;
  },
});

// Create template
export const create = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    fields: v.array(templateFieldValidator),
    isDefault: v.boolean(),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const now = Date.now();
    const templateId = await ctx.db.insert("templates", {
      ...args,
      isActive: true,
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
    });

    // Audit log
    const user = await ctx.db.get(userId);
    await ctx.db.insert("auditLogs", {
      templateId,
      action: "create",
      entityType: "template",
      entityId: templateId,
      description: `إنشاء قالب جديد: ${args.name}`,
      userId,
      userName: user?.name || "Unknown",
      timestamp: now,
    });

    return templateId;
  },
});

// Update template
export const update = mutation({
  args: {
    id: v.id("templates"),
    name: v.optional(v.string()),
    slug: v.optional(v.string()),
    description: v.optional(v.string()),
    fields: v.optional(v.array(templateFieldValidator)),
    isActive: v.optional(v.boolean()),
    isDefault: v.optional(v.boolean()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const { id, ...updates } = args;
    const now = Date.now();

    await ctx.db.patch(id, {
      ...updates,
      updatedAt: now,
      updatedBy: userId,
    });

    // Audit log
    const user = await ctx.db.get(userId);
    const template = await ctx.db.get(id);
    await ctx.db.insert("auditLogs", {
      templateId: id,
      action: "update",
      entityType: "template",
      entityId: id,
      description: `تحديث القالب: ${template?.name || id}`,
      changes: JSON.stringify(updates),
      userId,
      userName: user?.name || "Unknown",
      timestamp: Date.now(),
    });

    return id;
  },
});

// Delete template
export const remove = mutation({
  args: { id: v.id("templates") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const template = await ctx.db.get(args.id);
    if (!template) throw new Error("Template not found");

    await ctx.db.delete(args.id);

    // Audit log
    const user = await ctx.db.get(userId);
    await ctx.db.insert("auditLogs", {
      templateId: args.id,
      action: "delete",
      entityType: "template",
      entityId: args.id,
      description: `حذف القالب: ${template.name}`,
      userId,
      userName: user?.name || "Unknown",
      timestamp: Date.now(),
    });

    return args.id;
  },
});

// Seed default templates
export const seedDefaults = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db.query("templates").collect();
    if (existing.length > 0) return;

    const now = Date.now();
    const defaultFields = [
      { id: "citizen_name", type: "citizen_field" as const, label: "اسم المواطن", required: true, order: 0 },
      { id: "citizen_id", type: "citizen_field" as const, label: "رقم الهوية", required: true, order: 1 },
      { id: "citizen_phone", type: "citizen_field" as const, label: "رقم الهاتف", required: false, order: 2 },
      { id: "citizen_address", type: "citizen_field" as const, label: "العنوان", required: false, order: 3 },
    ];

    const templates = [
      {
        name: "تقرير فني",
        slug: "technical-report",
        description: "نموذج تقرير فني لقسم المسح والتطبيق",
        isDefault: true,
        isActive: true,
        category: "تقارير",
        fields: [
          { id: "project_name", type: "text" as const, label: "اسم المشروع", required: true, order: 0 },
          { id: "location", type: "text" as const, label: "الموقع", required: true, order: 1 },
          { id: "tech_details", type: "textarea" as const, label: "التفاصيل الفنية", required: true, order: 2 },
          { id: "findings", type: "textarea" as const, label: "النتائج", required: true, order: 3 },
          ...defaultFields,
        ],
      },
      {
        name: "وصف فني",
        slug: "technical-description",
        description: "نموذج وصف فني للمشاريع",
        isDefault: true,
        isActive: true,
        category: "تقارير",
        fields: [
          { id: "project_name", type: "text" as const, label: "اسم المشروع", required: true, order: 0 },
          { id: "dimensions", type: "textarea" as const, label: "الأبعاد والمواصفات", required: true, order: 1 },
          { id: "materials", type: "textarea" as const, label: "المواد المستخدمة", required: true, order: 2 },
          ...defaultFields,
        ],
      },
      {
        name: "شهادة استعمال",
        slug: "usage-certificate",
        description: "شهادة استعمال المبنى",
        isDefault: true,
        isActive: true,
        category: "شهادات",
        fields: [
          { id: "building_type", type: "text" as const, label: "نوع المبنى", required: true, order: 0 },
          { id: "floors", type: "number" as const, label: "عدد الطوابق", required: true, order: 1 },
          { id: "area", type: "text" as const, label: "المساحة", required: true, order: 2 },
          { id: "purpose", type: "select" as const, label: "الغرض من الاستعمال", required: true, order: 3, options: ["سكني", "تجاري", "صناعي", "إداري", "آخر"] },
          ...defaultFields,
        ],
      },
      {
        name: "رخصة صيانة",
        slug: "maintenance-license",
        description: "رخصة صيانة المباني",
        isDefault: true,
        isActive: true,
        category: "رخص",
        fields: [
          { id: "maintenance_type", type: "select" as const, label: "نوع الصيانة", required: true, order: 0, options: ["ترميم", "إصلاح", "تجديد", "صيانة دورية"] },
          { id: "property_type", type: "select" as const, label: "نوع العقار", required: true, order: 1, options: ["مبنى سكني", "مبنى تجاري", "فيلا", "أرض", "آخر"] },
          { id: "contractor", type: "text" as const, label: "اسم المقاول", required: true, order: 2 },
          { id: "duration", type: "text" as const, label: "المدة الزمنية", required: true, order: 3 },
          ...defaultFields,
        ],
      },
      {
        name: "رخصة هدم",
        slug: "demolition-license",
        description: "رخصة هدم المباني",
        isDefault: true,
        isActive: true,
        category: "رخص",
        fields: [
          { id: "building_age", type: "number" as const, label: "عمر المبنى", required: true, order: 0 },
          { id: "demolition_reason", type: "select" as const, label: "سبب الهدم", required: true, order: 1, options: ["تهديم جزئي", "تهديم كلي", "ترميم", "إعادة بناء", "مخالف"] },
          { id: "safety_measures", type: "textarea" as const, label: "إجراءات السلامة", required: true, order: 2 },
          { id: "contractor_name", type: "text" as const, label: "اسم المقاول المنفذ", required: true, order: 3 },
          ...defaultFields,
        ],
      },
      {
        name: "إذن حفر",
        slug: "digging-permit",
        description: "إذن حفر في الطرقات والأراضي",
        isDefault: true,
        isActive: true,
        category: "رخص",
        fields: [
          { id: "digging_type", type: "select" as const, label: "نوع الحفر", required: true, order: 0, options: ["صرف صحي", "مياه", "كهرباء", "اتصالات", "غاز", "أخرى"] },
          { id: "digging_depth", type: "text" as const, label: "العمق", required: true, order: 1 },
          { id: "digging_width", type: "text" as const, label: "العرض", required: true, order: 2 },
          { id: "digging_length", type: "text" as const, label: "الطول", required: true, order: 3 },
          { id: "traffic_plan", type: "textarea" as const, label: "خطة تنظيم المرور", required: true, order: 4 },
          ...defaultFields,
        ],
      },
      {
        name: "محضر معاينة",
        slug: "inspection-report",
        description: "محضر معاينة موقع",
        isDefault: true,
        isActive: true,
        category: "تقارير",
        fields: [
          { id: "inspection_committee", type: "textarea" as const, label: "أعضاء لجنة المعاينة", required: true, order: 0 },
          { id: "inspection_type", type: "select" as const, label: "نوع المعاينة", required: true, order: 1, options: ["معاينة أولية", "معاينة ميدانية", "معاينة نهائية", "معاينة مخالفات"] },
          { id: "site_conditions", type: "textarea" as const, label: "وصف الموقع وحالته", required: true, order: 2 },
          { id: "violations", type: "textarea" as const, label: "المخالفات المسجلة", required: false, order: 3 },
          ...defaultFields,
        ],
      },
      {
        name: "كشف موقعي",
        slug: "site-survey",
        description: "كشف موقعي للعقارات",
        isDefault: true,
        isActive: true,
        category: "تقارير",
        fields: [
          { id: "property_boundaries", type: "textarea" as const, label: "حدود العقار", required: true, order: 0 },
          { id: "neighbors", type: "textarea" as const, label: "الجيران", required: true, order: 1 },
          { id: "survey_notes", type: "textarea" as const, label: "ملاحظات المسح", required: true, order: 2 },
          { id: "coordinates", type: "text" as const, label: "الإحداثيات", required: false, order: 3 },
          ...defaultFields,
        ],
      },
      {
        name: "تقرير اللجنة المعمارية",
        slug: "architectural-committee",
        description: "تقرير اللجنة المعمارية",
        isDefault: true,
        isActive: true,
        category: "تقارير",
        fields: [
          { id: "committee_members", type: "textarea" as const, label: "أعضاء اللجنة", required: true, order: 0 },
          { id: "project_evaluation", type: "textarea" as const, label: "تقييم المشروع", required: true, order: 1 },
          { id: "recommendations", type: "textarea" as const, label: "التوصيات", required: true, order: 2 },
          { id: "approval_status", type: "select" as const, label: "حالة الاعتماد", required: true, order: 3, options: ["موافقة", "موافقة مشروطة", "رفض"] },
          { id: "committee_vote", type: "select" as const, label: "نتيجة التصويت", required: true, order: 4, options: ["بالإجماع", "بالأغلبية", "معلق"] },
          ...defaultFields,
        ],
      },
    ];

    for (const template of templates) {
      await ctx.db.insert("templates", {
        ...template,
        createdBy: userId,
        createdAt: now,
        updatedAt: now,
      });
    }

    return templates.length;
  },
});
