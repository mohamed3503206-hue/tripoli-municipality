# منصة المسح والتطبيق - بلدية طرابلس 🏛️

نظام متكامل لإدارة طلبات المسح والتطبيق الحضري، يشمل إنشاء النماذج، إدارة السجلات، طباعة التقارير، والتحقق عبر QR Code والباركود.

---

## 🚀 التشغيل السريع

```bash
# 1. تثبيت المتطلبات
curl -fsSL https://bun.sh/install | bash
git clone <رابط-المستودع>
cd <اسم-المجلد>
bun install

# 2. ربط قاعدة البيانات Convex
npx convex login
npx convex init

# 3. تشغيل الخادم الخلفي (نافذة 1)
bunx convex dev

# 4. تشغيل الواجهة (نافذة 2)
bun run dev
# افتح: http://localhost:5173
```

---

## 📋 المتطلبات الأساسية

| الأداة | الإصدار المطلوب | التحميل |
|--------|-----------------|---------|
| **Bun** | ≥ 1.2 | [bun.sh](https://bun.sh) |
| **Git** | أي إصدار | [git-scm.com](https://git-scm.com) |
| **حساب Convex** | مجاني | [convex.dev](https://convex.dev) |
| **متصفح** | حديث | Chrome / Firefox / Edge |

---

## 🔧 التثبيت خطوة بخطوة

### 1️⃣ تثبيت Bun

```bash
# لأنظمة MacOS / Linux (بما في ذلك Windows WSL)
curl -fsSL https://bun.sh/install | bash

# التحقق من التثبيت
bun --version
```

> **لنظام Windows:** استخدم [WSL](https://learn.microsoft.com/windows/wsl/install) ثم شغّل الأمر أعلاه.

### 2️⃣ الحصول على الكود

```bash
# نسخ المستودع
git clone <رابط-المستودع>
cd <اسم-المجلد>
```

### 3️⃣ تثبيت الحزم

```bash
bun install
```

### 4️⃣ إعداد Convex (قاعدة البيانات والخلفية)

1. اذهب إلى [convex.dev](https://convex.dev) وأنشئ حساباً مجانياً
2. سجّل الدخول من الجهاز:

```bash
npx convex login
npx convex init
```

سيُطلب منك اختيار مشروع — اختر **"Create a new project"** وأعطه اسماً (مثل `tripoli-municipality`).

### 5️⃣ ضبط متغيرات البيئة

بعد `npx convex init`، سينشئ تلقائياً المفاتيح الأساسية.

**على خادم Convex** (Convex Dashboard ← Settings ← Environment Variables)، أضف:

| المتغير | الوصف | مثال |
|---------|-------|------|
| `SITE_URL` | رابط الموقع | `http://localhost:5173` |
| `VLY_APP_NAME` | اسم التطبيق | `منصة المسح والتطبيق` |

> **ملاحظة:** المفاتيح `JWKS` و `JWT_PRIVATE_KEY` خاصة بالمصادقة — يمكنك استخدام المفاتيح الافتراضية للتطوير المحلي أو توليدها عبر [mkjwk.org](https://mkjwk.org) (اختر RSA, 2048 bit, Use: Signature, Algorithm: RS256).

### 6️⃣ تشغيل التطبيق

**نافذة 1 — تشغيل Convex (اتركها مفتوحة):**

```bash
bunx convex dev
```

**نافذة 2 — تشغيل واجهة المستخدم:**

```bash
bun run dev
```

افتح المتصفح على: **http://localhost:5173** 🎉

---

## 📧 البريد الإلكتروني في وضع التطوير المحلي

عند تشغيل التطبيق محلياً، **يُطبع رمز التحقق (OTP) مباشرة في الطرفية** (نافذة Convex) بدلاً من إرسال بريد إلكتروني حقيقي.

سترى شيئاً كهذا:

```
========================================================
📧  رمز التحقق لـ: user@example.com
🔑  الكود: 483921
========================================================
```

### للتبديل إلى بريد إلكتروني حقيقي في الإنتاج:

أضف متغير البيئة `VLY_APP_NAME` في Convex Dashboard لاستخدام خدمة Vly، أو غيّر مزود البريد في الملف:
`src/convex/auth/emailOtp.ts`

---

## 🌐 بناء نسخة إنتاجية

```bash
bun run build
```

سيتولّد مجلد `dist/` — يمكنك رفعه إلى أي استضافة:
- [Vercel](https://vercel.com)
- [Netlify](https://netlify.com)
- [Cloudflare Pages](https://pages.cloudflare.com)

لاختبار النسخة البناء محلياً:

```bash
bun run preview
```

---

## 📁 هيكل المشروع

```
src/
├── convex/              # الخلفية (Convex backend)
│   ├── auth/            # المصادقة (email OTP)
│   ├── _generated/      # أكواد مولّدة (لا تعدلها)
│   ├── records.ts       # عمليات السجلات
│   ├── templates.ts     # عمليات النماذج
│   ├── settings.ts      # إعدادات النظام
│   ├── schema.ts        # هيكل قاعدة البيانات
│   └── seed.ts          # بيانات أولية
├── pages/               # صفحات التطبيق
│   ├── Dashboard.tsx     # لوحة التحكم
│   ├── Auth.tsx          # تسجيل الدخول
│   ├── Preview.tsx       # معاينة وطباعة التقارير
│   ├── Settings.tsx      # الإعدادات
│   ├── Landing.tsx       # الصفحة الرئيسية
│   └── ...
├── components/          # مكونات واجهة المستخدم
│   └── ui/              # مكونات shadcn/ui
├── hooks/               # Hooks مخصصة
└── lib/                 # أدوات مساعدة
```

---

## 🛠️ أوامر مفيدة

| الأمر | الوصف |
|-------|-------|
| `bun run dev` | تشغيل خادم التطوير |
| `bun run build` | بناء نسخة إنتاجية |
| `bun run preview` | معاينة النسخة البناء محلياً |
| `bun tsc -b --noEmit` | التحقق من الأخطاء البرمجية |
| `bunx convex dev` | تشغيل خادم Convex المحلي |
| `bunx convex dashboard` | فتح لوحة تحكم Convex |
| `bunx convex deploy` | نشر التغييرات إلى Convex |

---

## 🔐 الصلاحيات والأدوار

- **مدير النظام (Super Admin):** صلاحية كاملة — إدارة المستخدمين، النماذج، الإعدادات
- **موظف (Employee):** إضافة وتعديل السجلات، طباعة التقارير
- **مشرف (Supervisor):** مراجعة واعتماد السجلات

لترقية أول مستخدم إلى مدير نظام، استخدم Convex Dashboard لتشغيل الدالة `seed:promoteFirstUser`.

---

## 💻 التقنيات المستخدمة

| التقنية | الغرض |
|---------|-------|
| [Vite](https://vitejs.dev) | بناء الواجهة الأمامية |
| [React 19](https://react.dev) | مكتبة الواجهة |
| [TypeScript](https://typescriptlang.org) | لغة البرمجة |
| [Tailwind CSS v4](https://tailwindcss.com) | التصميم والتنسيق |
| [shadcn/ui](https://ui.shadcn.com) | مكونات واجهة المستخدم |
| [Convex](https://convex.dev) | الخلفية وقاعدة البيانات |
| [Convex Auth](https://labs.convex.dev/auth) | المصادقة |
| [Framer Motion](https://motion.dev) | الرسوم المتحركة |
| [React Router v7](https://reactrouter.com) | التوجيه بين الصفحات |

---

## 📞 الدعم

للاستفسارات أو طلب المساعدة، يرجى التواصل عبر البريد الإلكتروني أو فتح Issue في المستودع.

---

<div dir="rtl" align="center">
بلدية طرابلس — إدارة التخطيط الحضري — قسم المسح والتطبيق<br/>
© 2026 جميع الحقوق محفوظة
</div>
