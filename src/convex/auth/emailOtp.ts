import { Email } from "@convex-dev/auth/providers/Email";
import axios from "axios";
import { RandomReader, generateRandomString } from "@oslojs/crypto/random";

/**
 * معرفة ما إذا كنا في وضع التطوير المحلي (بدون مزود بريد حقيقي)
 */
const isLocalDev = !process.env.VLY_APP_NAME && !process.env.RESEND_API_KEY;

export const emailOtp = Email({
  id: "email-otp",
  maxAge: 60 * 15, // 15 minutes
  async generateVerificationToken() {
    const random: RandomReader = {
      read(bytes: Uint8Array) {
        crypto.getRandomValues(bytes);
      },
    };
    const alphabet = "0123456789";
    return generateRandomString(random, alphabet, 6);
  },
  async sendVerificationRequest({ identifier: email, token }) {
    // ====== وضع التطوير المحلي: طباعة OTP في الطرفية ======
    if (isLocalDev) {
      console.log("");
      console.log("=".repeat(56));
      console.log("📧  رمز التحقق لـ:", email);
      console.log("🔑  الكود:", token);
      console.log("=".repeat(56));
      console.log("");
      return;
    }

    // ====== الإنتاج: إرسال عبر Vly API ======
    try {
      await axios.post(
        "https://email.vly.ai/send_otp",
        {
          to: email,
          otp: token,
          appName: process.env.VLY_APP_NAME || "منصة المسح والتطبيق",
        },
        {
          headers: {
            "x-api-key": "vlytothemoon2025",
          },
        },
      );
    } catch (error) {
      throw new Error(JSON.stringify(error));
    }
  },
});
