// =========== Queries for Audit Logs ===========
import { v } from "convex/values";
import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get recent audit logs
export const getRecent = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db.query("auditLogs").order("desc").take(args.limit || 50);
  },
});

// Get audit logs for a specific record
export const getByRecordId = query({
  args: { recordId: v.id("records") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("auditLogs")
      .withIndex("recordId", (q) => q.eq("recordId", args.recordId))
      .order("desc")
      .collect();
  },
});

// Get audit logs by entity type
export const getByEntityType = query({
  args: { entityType: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("auditLogs")
      .withIndex("entityType", (q) => q.eq("entityType", args.entityType))
      .order("desc")
      .take(args.limit || 50);
  },
});
