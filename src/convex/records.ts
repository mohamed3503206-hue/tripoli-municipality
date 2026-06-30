// =========== Queries and mutations for Records (form submissions) ===========
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get all records with optional filters
export const list = query({
  args: {
    templateId: v.optional(v.id("templates")),      status: v.optional(v.union(
        v.literal("pending"),
        v.literal("approved"),
        v.literal("rejected"),
        v.literal("draft"),
      )),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { records: [], cursor: null };

    let recordsQuery = ctx.db.query("records").order("desc");

    if (args.templateId) {
      recordsQuery = recordsQuery.filter((q) =>
        q.eq(q.field("templateId"), args.templateId!),
      );
    }

    if (args.status) {
      recordsQuery = recordsQuery.filter((q) =>
        q.eq(q.field("status"), args.status!),
      );
    }

    const records = await recordsQuery.take(args.limit || 50);
    return { records, cursor: null };
  },
});

// Get single record
export const getById = query({
  args: { id: v.id("records") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return await ctx.db.get(args.id);
  },
});

// Search records
export const search = query({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const q = args.query.toLowerCase();
    const records = await ctx.db.query("records").take(100);

    return records.filter((r) => {
      return (
        r.formNumber.toLowerCase().includes(q) ||
        r.ownerName.toLowerCase().includes(q) ||
        r.district.toLowerCase().includes(q) ||
        r.pieceNumber.toLowerCase().includes(q) ||
        r.date.includes(q) ||
        r.requestType.toLowerCase().includes(q) ||
        r.locality?.toLowerCase().includes(q)
      );
    });
  },
});

// Create record
export const create = mutation({
  args: {
    templateId: v.id("templates"),
    formNumber: v.string(),
    date: v.string(),
    ownerName: v.string(),
    pieceNumber: v.string(),
    district: v.string(),
    locality: v.string(),
    requestType: v.string(),
    notes: v.optional(v.string()),
    recommendation: v.optional(v.string()),
    fieldValues: v.optional(v.string()),
    citizenFields: v.optional(v.string()),      status: v.optional(v.union(
        v.literal("pending"),
        v.literal("approved"),
        v.literal("rejected"),
        v.literal("draft"),
      )),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const now = Date.now();
    const recordId = await ctx.db.insert("records", {
      ...args,
      notes: args.notes || "",
      recommendation: args.recommendation || "",
      status: args.status || "pending",
      attachments: [],
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
    });

    // Audit log
    const user = await ctx.db.get(userId);
    await ctx.db.insert("auditLogs", {
      recordId,
      action: "create",
      entityType: "record",
      entityId: recordId,
      description: `إنشاء سجل جديد: ${args.formNumber}`,
      userId,
      userName: user?.name || "Unknown",
      timestamp: now,
    });

    return recordId;
  },
});

// Update record
export const update = mutation({
  args: {
    id: v.id("records"),
    formNumber: v.optional(v.string()),
    date: v.optional(v.string()),
    ownerName: v.optional(v.string()),
    pieceNumber: v.optional(v.string()),
    district: v.optional(v.string()),
    locality: v.optional(v.string()),
    requestType: v.optional(v.string()),
    notes: v.optional(v.string()),
    recommendation: v.optional(v.string()),
    fieldValues: v.optional(v.string()),
    citizenFields: v.optional(v.string()),      status: v.optional(v.union(
        v.literal("pending"),
        v.literal("approved"),
        v.literal("rejected"),
        v.literal("draft"),
      )),
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
    const record = await ctx.db.get(id);
    await ctx.db.insert("auditLogs", {
      recordId: id,
      action: "update",
      entityType: "record",
      entityId: id,
      description: `تحديث السجل: ${record?.formNumber || id}`,
      changes: JSON.stringify(updates),
      userId,
      userName: user?.name || "Unknown",
      timestamp: Date.now(),
    });

    return id;
  },
});

// Delete record
export const remove = mutation({
  args: { id: v.id("records") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const record = await ctx.db.get(args.id);
    if (!record) throw new Error("Record not found");

    await ctx.db.delete(args.id);

    // Audit log
    const user = await ctx.db.get(userId);
    await ctx.db.insert("auditLogs", {
      recordId: args.id,
      action: "delete",
      entityType: "record",
      entityId: args.id,
      description: `حذف السجل: ${record.formNumber}`,
      userId,
      userName: user?.name || "Unknown",
      timestamp: Date.now(),
    });

    return args.id;
  },
});

// Get next form number
export const getNextFormNumber = mutation({
  args: {},
  handler: async (ctx) => {
    const records = await ctx.db.query("records").order("desc").take(1);
    const lastNum = records.length > 0 ? parseInt(records[0].formNumber) || 0 : 0;
    return String(lastNum + 1).padStart(6, "0");
  },
});

// Get records by district
export const getByDistrict = query({
  args: { district: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("records")
      .filter((q) => q.eq(q.field("district"), args.district))
      .collect();
  },
});

// Get records count for dashboard
export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const records = await ctx.db.query("records").collect();
    const total = records.length;
    const pending = records.filter((r) => r.status === "pending").length;
    const approved = records.filter((r) => r.status === "approved").length;
    const rejected = records.filter((r) => r.status === "rejected").length;

    // Recent activity (last 10)
    const recent = await ctx.db
      .query("auditLogs")
      .order("desc")
      .take(10);

    return {
      total,
      pending,
      approved,
      rejected,
      recent,
    };
  },
});

// Get monthly stats for reports
export const getMonthlyStats = query({
  args: {
    year: v.optional(v.number()),
    month: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const records = await ctx.db.query("records").collect();
    const year = args.year || new Date().getFullYear();
    const month = args.month;

    let filtered = records.filter((r) => {
      const d = new Date(parseInt(r.date) || Date.now());
      if (month !== undefined) {
        return d.getFullYear() === year && d.getMonth() + 1 === month;
      }
      return d.getFullYear() === year;
    });

    // Group by request type
    const byType: Record<string, number> = {};
    filtered.forEach((r) => {
      byType[r.requestType] = (byType[r.requestType] || 0) + 1;
    });

    return Object.entries(byType).map(([type, count]) => ({
      type,
      count,
    }));
  },
});
