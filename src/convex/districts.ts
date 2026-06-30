// =========== Queries and mutations for Districts (manually entered) ===========
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// List all districts
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("districts").collect();
  },
});

// Add district
export const add = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if already exists
    const existing = await ctx.db
      .query("districts")
      .filter((q) => q.eq(q.field("name"), args.name))
      .first();
    if (existing) return existing._id;

    return await ctx.db.insert("districts", {
      name: args.name,
      createdBy: userId,
      createdAt: Date.now(),
    });
  },
});

// Remove district
export const remove = mutation({
  args: { id: v.id("districts") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    await ctx.db.delete(args.id);
    return args.id;
  },
});
