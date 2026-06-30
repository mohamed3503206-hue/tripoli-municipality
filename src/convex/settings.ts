// =========== Queries and mutations for Settings ===========
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get all settings
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("settings").collect();
  },
});

// Get setting by key
export const get = query({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("settings")
      .filter((q) => q.eq(q.field("key"), args.key))
      .first();
  },
});

// Set setting
export const set = mutation({
  args: {
    key: v.string(),
    value: v.any(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("settings")
      .filter((q) => q.eq(q.field("key"), args.key))
      .first();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        value: args.value,
        updatedBy: userId,
        updatedAt: now,
      });
      return existing._id;
    }

    return await ctx.db.insert("settings", {
      key: args.key,
      value: args.value,
      updatedBy: userId,
      updatedAt: now,
    });
  },
});

// Get default settings if not set
export const getSystemName = query({
  args: {},
  handler: async (ctx) => {
    const setting = await ctx.db
      .query("settings")
      .filter((q) => q.eq(q.field("key"), "systemName"))
      .first();
    return setting?.value || "منصة المسح والتطبيق";
  },
});

export const getLogo = query({
  args: {},
  handler: async (ctx) => {
    const setting = await ctx.db
      .query("settings")
      .filter((q) => q.eq(q.field("key"), "logo"))
      .first();
    return setting?.value || null;
  },
});
