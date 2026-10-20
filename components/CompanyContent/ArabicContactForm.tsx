"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import styles from "./ArabicContactForm.module.css";

export default function ArabicContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setStatus("sending");
    try {
      const response = await fetch("/api/contact", { method: "POST", body: data });
      if (!response.ok) { setStatus("error"); return; }
      form.reset(); setStatus("sent");
    } catch { setStatus("error"); }
  }
  return <form className={styles.form} action="/api/contact" method="post" onSubmit={submit}>
    <label>الاسم الكامل<input name="name" autoComplete="name" required maxLength={120} /></label>
    <label>المؤسسة أو الشركة<input name="company" autoComplete="organization" maxLength={160} /></label>
    <label>البريد الإلكتروني<input name="email" type="email" dir="ltr" autoComplete="email" required maxLength={254} /></label>
    <label>رقم الهاتف مع رمز الدولة<input name="phone" type="tel" dir="ltr" autoComplete="tel" required maxLength={32} pattern="\+[1-9][0-9 ()-]{6,30}" aria-describedby="ar-phone-help" /></label>
    <p id="ar-phone-help">ابدأ بعلامة + ثم رمز الدولة ورقم الهاتف.</p>
    <label>الخدمة المطلوبة<select name="expertise" defaultValue=""><option value="">لنحدد النطاق معًا</option><option value="Website">موقع إلكتروني</option><option value="ERP">أنظمة تخطيط موارد المؤسسات</option><option value="AI & Machine Learning">الذكاء الاصطناعي</option><option value="Data Analysis">تحليل البيانات</option><option value="Digital Transformation">التحول الرقمي</option><option value="Fintech & Compliance">الأنظمة المالية والامتثال</option><option value="Digitization & OCR">الرقمنة ومعالجة المستندات</option><option value="Embedded Systems">الأنظمة المدمجة</option><option value="Surveys & Statistics">المسوح والإحصاء</option><option value="Training">التدريب</option></select></label>
    <label>وصف المشروع<textarea name="description" required maxLength={5000} rows={6} /></label>
    <input type="hidden" name="formGuard" value="" />
    <div className={styles.trap} aria-hidden="true"><label>اترك هذا الحقل فارغًا<input name="companyWebsite" tabIndex={-1} autoComplete="off" /></label></div>
    <p>تُستخدم بياناتك للرد على طلبك وفق <Link href="/privacy">سياسة الخصوصية</Link>.</p>
    <button disabled={status === "sending"} type="submit">{status === "sending" ? "جارٍ الإرسال…" : "إرسال تفاصيل المشروع"}</button>
    <p role="status" aria-live="polite">{status === "sent" ? "تم إرسال طلبك. سيتواصل معك الفريق باستخدام بياناتك المقدمة." : status === "error" ? "تعذر إرسال الطلب. راجع البيانات أو راسلنا على hello@mzfortech.com." : ""}</p>
  </form>;
}
