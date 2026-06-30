import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// =========== Role Definitions ===========
export const ROLES = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  HEAD: "head",
  EMPLOYEE: "employee",
  READER: "reader",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.SUPER_ADMIN),
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.HEAD),
  v.literal(ROLES.EMPLOYEE),
  v.literal(ROLES.READER),
);
export type Role = Infer<typeof roleValidator>;

// =========== Template Field Types ===========
export const fieldTypeValidator = v.union(
  v.literal("text"),
  v.literal("textarea"),
  v.literal("number"),
  v.literal("date"),
  v.literal("select"),
  v.literal("file"),
  v.literal("checkbox"),
  v.literal("radio"),
  v.literal("citizen_field"), // field to be filled by citizen before printing empty form
);

export const templateFieldValidator = v.object({
  id: v.string(),
  type: fieldTypeValidator,
  label: v.string(),
  labelEn: v.optional(v.string()),
  required: v.boolean(),
  options: v.optional(v.array(v.string())),
  placeholder: v.optional(v.string()),
  order: v.number(),
  defaultValue: v.optional(v.string()),
  isCitizenField: v.optional(v.boolean()),
});

export type TemplateField = Infer<typeof templateFieldValidator>;

// =========== Schema ===========
const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables,

    // Users table - extended with role
    users: defineTable({
      name: v.optional(v.string()),
      image: v.optional(v.string()),
      email: v.optional(v.string()),
      emailVerificationTime: v.optional(v.number()),
      isAnonymous: v.optional(v.boolean()),
      role: v.optional(roleValidator),
      phone: v.optional(v.string()),
      department: v.optional(v.string()),
      isActive: v.optional(v.boolean()),
    })
      .index("email", ["email"])
      .index("role", ["role"]),

    // =========== Templates (Form Builder) ===========
    templates: defineTable({
      name: v.string(),
      slug: v.string(),
      description: v.optional(v.string()),
      fields: v.array(templateFieldValidator),
      isDefault: v.boolean(),
      isActive: v.boolean(),
      category: v.optional(v.string()),
      createdBy: v.id("users"),
      updatedBy: v.optional(v.id("users")),
      createdAt: v.number(),
      updatedAt: v.number(),
    })
      .index("slug", ["slug"])
      .index("category", ["category"])
      .index("isActive", ["isActive"]),

    // =========== Records (Form Submissions) ===========
    records: defineTable({
      templateId: v.id("templates"),
      formNumber: v.string(),
      date: v.string(),
      ownerName: v.string(),
      pieceNumber: v.string(),
      district: v.string(),
      locality: v.string(),
      requestType: v.string(),
      citizenFields: v.optional(v.string()), // JSON string for citizen-filled fields
      notes: v.optional(v.string()),
      recommendation: v.optional(v.string()),
      fieldValues: v.optional(v.string()), // JSON string - dynamic template field values
      attachments: v.optional(v.array(v.string())),
      status: v.optional(
        v.union(
          v.literal("pending"),
          v.literal("approved"),
          v.literal("rejected"),
          v.literal("draft"),
        ),
      ),
      createdBy: v.id("users"),
      updatedBy: v.optional(v.id("users")),
      createdAt: v.number(),
      updatedAt: v.number(),
    })
      .index("formNumber", ["formNumber"])
      .index("ownerName", ["ownerName"])
      .index("district", ["district"])
      .index("pieceNumber", ["pieceNumber"])
      .index("date", ["date"])
      .index("requestType", ["requestType"])
      .index("templateId", ["templateId"])
      .index("createdBy", ["createdBy"])
      .index("status", ["status"]),

    // =========== Districts (manually entered) ===========
    districts: defineTable({
      name: v.string(),
      createdBy: v.id("users"),
      createdAt: v.number(),
    })
      .index("name", ["name"]),

    // =========== Audit Log ===========
    auditLogs: defineTable({
      recordId: v.optional(v.id("records")),
      templateId: v.optional(v.id("templates")),
      action: v.string(),
      entityType: v.string(),
      entityId: v.optional(v.string()),
      changes: v.optional(v.string()),
      description: v.optional(v.string()),
      userId: v.id("users"),
      userName: v.optional(v.string()),
      timestamp: v.number(),
    })
      .index("recordId", ["recordId"])
      .index("userId", ["userId"])
      .index("timestamp", ["timestamp"])
      .index("entityType", ["entityType"]),

    // =========== Archives ===========
    archives: defineTable({
      recordId: v.id("records"),
      fileName: v.string(),
      fileType: v.string(),
      fileSize: v.optional(v.number()),
      fileUrl: v.string(),
      mimeType: v.optional(v.string()),
      uploadedBy: v.id("users"),
      createdAt: v.number(),
    })
      .index("recordId", ["recordId"])
      .index("fileType", ["fileType"]),

    // =========== Settings ===========
    settings: defineTable({
      key: v.string(),
      value: v.any(),
      updatedBy: v.optional(v.id("users")),
      updatedAt: v.number(),
    })
      .index("key", ["key"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;
