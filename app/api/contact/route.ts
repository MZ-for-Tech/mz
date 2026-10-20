import { createTransport } from "nodemailer";
import { randomUUID } from "node:crypto";
import { buildContactEmail } from "@/lib/contactEmail";

const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;
const MAX_DESCRIPTION_LENGTH = 5000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SINGLE_VALUE_FIELDS = [
  "companyWebsite", "formGuard", "name", "company", "email", "phone", "description",
  "budget", "timeline", "referral",
];

export const runtime = "nodejs";

const EXPERTISE = new Set([
  "Website",
  "ERP",
  "Internal Systems",
  "E-Commerce",
  "AI & Machine Learning",
  "Data Analysis",
  "Workshops",
  "Research Collaboration",
  "Fintech & Compliance",
  "Digital Transformation",
  "Digitization & OCR",
  "Embedded Systems",
  "Surveys & Statistics",
  "Training",
]);
const BUDGETS = new Set([
  "Under $1,500",
  "$1,500 — $5,000",
  "$5,000 — $20,000",
  "$20,000+",
  "Let's discuss",
]);
const TIMELINES = new Set([
  "Under 1 month",
  "1 — 3 months",
  "3 — 6 months",
  "6+ months",
  "Ongoing / Retainer",
]);
const REFERRALS = new Set([
  "Referral",
  "WhatsApp",
  "AI assistant",
  "Search",
  "LinkedIn",
  "Freelance platform",
  "Academic / Institution",
  "The Null Hypothesis",
  "Social Media",
  "Other",
]);

function response(message: string, status: number) {
  return Response.json({ message }, { status });
}

function optionalChoice(value: FormDataEntryValue | null, choices: Set<string>) {
  if (typeof value !== "string" || value === "") return "Not provided";
  return choices.has(value) ? value : null;
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return response("Submit your brief from this website's contact page.", 403);
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return response("The submitted brief couldn't be read. Please try again.", 400);
  }

  if (SINGLE_VALUE_FIELDS.some((field) =>
    form.getAll(field).length > 1 ||
    (form.has(field) && typeof form.get(field) !== "string")
  ) || form.getAll("attachment").length > 1) {
    return response("The submitted fields are invalid. Please refresh and try again.", 400);
  }

  if (String(form.get("companyWebsite") ?? "").trim() || String(form.get("formGuard") ?? "").trim()) {
    console.warn("Contact submission rejected", { reason: "honeypot" });
    return response("We couldn't submit your brief. Please refresh and try again, or email hello@mzfortech.com.", 400);
  }

  const email = String(form.get("email") ?? "").trim();
  const name = String(form.get("name") ?? "").trim();
  const company = String(form.get("company") ?? "").trim();
  const rawPhone = String(form.get("phone") ?? "").trim();
  const phone = rawPhone.replace(/[ ()-]/g, "");
  if (!name || name.length > 120 || /[\r\n\u0000-\u001f\u007f]/.test(name)) {
    return response("Enter your full name (up to 120 characters).", 400);
  }
  if (company.length > 160 || /[\r\n\u0000-\u001f\u007f]/.test(company)) {
    return response("Enter a company name up to 160 characters, or leave it blank.", 400);
  }
  if (rawPhone.length > 32 || !/^\+[1-9][0-9 ()-]+$/.test(rawPhone) || !/^\+[1-9]\d{6,14}$/.test(phone)) {
    return response("Enter a phone number with + and your country code (7–15 digits).", 400);
  }
  const description = String(form.get("description") ?? "").trim();
  if (!EMAIL_PATTERN.test(email) || email.length > 254 || /[\u0000-\u001f\u007f]/.test(email)) {
    return response("Enter a valid email address so we can reach you.", 400);
  }
  if (!description || description.length > MAX_DESCRIPTION_LENGTH) {
    return response("Add a brief description of your project (up to 5,000 characters).", 400);
  }

  const expertise = form.getAll("expertise");
  if (expertise.length > EXPERTISE.size || expertise.some((value) => typeof value !== "string" || !EXPERTISE.has(value))) {
    return response("One of the selected expertise options is invalid. Please refresh and try again.", 400);
  }

  const budget = optionalChoice(form.get("budget"), BUDGETS);
  const timeline = optionalChoice(form.get("timeline"), TIMELINES);
  const referral = optionalChoice(form.get("referral"), REFERRALS);
  if (budget === null || timeline === null || referral === null) {
    return response("One of the selected options is invalid. Please refresh and try again.", 400);
  }

  const attachmentEntry = form.get("attachment");
  if (typeof attachmentEntry === "string" && attachmentEntry !== "") {
    return response("The attachment must be a file.", 400);
  }
  const attachment = attachmentEntry && typeof attachmentEntry !== "string" && attachmentEntry.name
    ? attachmentEntry
    : null;
  if (attachment && attachment.size > MAX_ATTACHMENT_BYTES) {
    return response("Attachments must be 5 MB or smaller.", 413);
  }

  const host = process.env.ZOHO_SMTP_HOST;
  const port = Number(process.env.ZOHO_SMTP_PORT ?? "465");
  const user = process.env.ZOHO_SMTP_USER;
  const password = process.env.ZOHO_SMTP_PASSWORD;
  const from = process.env.CONTACT_FROM_EMAIL;
  const to = process.env.CONTACT_TO_EMAIL;
  if (!host || !user || !password || !from || !to || ![465, 587].includes(port)) {
    return response(
      "The contact form is being set up. Please email hello@mzfortech.com for now.",
      503
    );
  }

  const reference = `MZ-${randomUUID().slice(0, 8).toUpperCase()}`;
  const attachmentName = attachment?.name.replace(/[\\/\r\n]/g, "_").slice(0, 180) ?? "";
  const message = buildContactEmail({
    name, company, email, phone,
    expertise: expertise.length ? expertise.join(", ") : "Not provided",
    budget, timeline, referral, description,
    attachment: attachmentName,
    reference,
    submittedAt: new Intl.DateTimeFormat("en-GB", {
      dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Cairo",
    }).format(new Date()) + " (Cairo)",
  });

  const transporter = createTransport({
    host,
    port,
    secure: port === 465,
    requireTLS: port === 587,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
    disableFileAccess: true,
    disableUrlAccess: true,
    auth: { user, pass: password },
  });

  try {
    const delivery = await transporter.sendMail({
      from: { name: "MZ | Project Inquiries", address: from },
      to,
      replyTo: { name, address: email },
      subject: `New inquiry from ${name} | ${reference}`,
      text: message.text,
      html: message.html,
      ...(attachment
        ? {
            attachments: [{
              filename: attachmentName,
              content: Buffer.from(await attachment.arrayBuffer()),
            }],
          }
        : {}),
    });
    if (!delivery.accepted.length) {
      throw new Error("SMTP server did not accept any recipients");
    }
    console.info("Contact inquiry accepted by SMTP", {
      reference,
      messageId: delivery.messageId,
      accepted: delivery.accepted,
      rejected: delivery.rejected,
    });
  } catch (error) {
    console.error(
      "Zoho SMTP delivery failed",
      { reference, code: error && typeof error === "object" && "code" in error ? error.code : "SMTP_ERROR" }
    );
    return response(`We couldn't send your brief right now. Please email us directly. Reference: ${reference}`, 502);
  }

  return Response.json({ message: "Your brief has been submitted.", reference });
}
