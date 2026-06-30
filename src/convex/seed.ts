// =========== Seed: إعداد المستخدم الأول ===========
import { v } from "convex/values";
import { mutation, action } from "./_generated/server";
import { ROLES } from "./schema";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * تعيين المستخدم الحالي كمدير للنظام.
 * استخدم هذا بعد تسجيل الدخول لأول مرة للحصول على صلاحيات المدير.
 */
export const makeMeAdmin = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("يجب تسجيل الدخول أولاً");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("المستخدم غير موجود");

    // Check if there's already a super_admin
    const allUsers = await ctx.db.query("users").collect();
    const existingAdmin = allUsers.find(
      (u) => u.role === ROLES.SUPER_ADMIN && u._id !== userId,
    );
    if (existingAdmin) {
      return {
        success: false,
        message: `يوجد مدير نظام بالفعل: ${existingAdmin.email || ""}`,
      };
    }

    await ctx.db.patch(userId, {
      role: ROLES.SUPER_ADMIN,
      name: user.name || "مدير النظام",
    });

    return {
      success: true,
      message: "تم تعيينك كمدير للنظام بنجاح",
    };
  },
});

/**
 * تعيين مستخدم محدد كمدير للنظام (للاستخدام من Convex Dashboard).
 */
export const promoteFirstUser = mutation({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    if (users.length === 0) {
      return { success: false, message: "لا يوجد مستخدمون في النظام" };
    }

    const existingAdmin = users.find((u) => u.role === ROLES.SUPER_ADMIN);
    if (existingAdmin) {
      return {
        success: false,
        message: `يوجد مدير نظام بالفعل: ${existingAdmin.email || ""}`,
      };
    }

    const firstUser = users[0];
    await ctx.db.patch(firstUser._id, {
      role: ROLES.SUPER_ADMIN,
      name: firstUser.name || "مدير النظام",
    });

    return {
      success: true,
      message: `تم ترقية ${firstUser.email || "المستخدم الأول"} إلى مدير النظام`,
      email: firstUser.email || "",
    };
  },
});
