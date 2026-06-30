// =========== Queries and mutations for Archives ===========
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get archives for a record
export const getByRecordId = query({
  args: { recordId: v.id("records") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("archives")
      .withIndex("recordId", (q) => q.eq("recordId", args.recordId))
      .collect();
  },
});

// List all archives
export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db.query("archives").order("desc").take(100);
  },
});

// Add archive entry
export const add = mutation({
  args: {
    recordId: v.id("records"),
    fileName: v.string(),
    fileType: v.string(),
    fileUrl: v.string(),
    mimeType: v.optional(v.string()),
    fileSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("archives", {
      ...args,
      uploadedBy: userId,
      createdAt: Date.now(),
    });
  },
});

// Delete archive
export const remove = mutation({
  args: { id: v.id("archives") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    await ctx.db.delete(args.id);
    return args.id;
  },
});
