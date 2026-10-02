import type { SendMailOptions } from "nodemailer";

export type SmtpSettings = { host: string; port: number; secure: boolean; requireTLS: boolean; auth: { user: string; pass: string } };
export type DeliverBrief = (settings: SmtpSettings, mail: SendMailOptions) => Promise<{ accepted: unknown[] }>;

const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;
const MAX_DESCRIPTION_LENGTH = 5000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;



const EXPERTISE = new Set([
  "Website",
  "ERP",
  "Internal Systems",
  "E-Commerce",
  "AI & Machine Learning",
  "Data Analysis",
  "Workshops",
  "Research Collaboration",
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

export async function handleContact(request: Request, env: NodeJS.ProcessEnv, deliver: DeliverBrief) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return response("The submitted brief couldn't be read. Please try again.", 400);
  }

  // Do not report delivery for a submission that has been filtered.
  if (String(form.get("companyWebsite") ?? "").trim()) {
    return response("The brief could not be submitted. Please try again or email us.", 400);
  }

  const email = String(form.get("email") ?? "").trim();
  const description = String(form.get("description") ?? "").trim();
  if (!EMAIL_PATTERN.test(email) || email.length > 254) {
    return response("Enter a valid email address so we can reach you.", 400);
  }
  if (!description || description.length > MAX_DESCRIPTION_LENGTH) {
    return response("Add a brief description of your project (up to 5,000 characters).", 400);
  }

  const expertise = form.getAll("expertise");
  if (expertise.some((value) => typeof value !== "string" || !EXPERTISE.has(value))) {
    return response("One of the selected expertise options is invalid. Please refresh and try again.", 400);
  }

  const budget = optionalChoice(form.get("budget"), BUDGETS);
  const timeline = optionalChoice(form.get("timeline"), TIMELINES);
  const referral = optionalChoice(form.get("referral"), REFERRALS);
  if (budget === null || timeline === null || referral === null) {
    return response("One of the selected options is invalid. Please refresh and try again.", 400);
  }

  const attachmentEntry = form.get("attachment");
  const attachment = attachmentEntry instanceof File && attachmentEntry.name
    ? attachmentEntry
    : null;
  if (attachment && attachment.size > MAX_ATTACHMENT_BYTES) {
    return response("Attachments must be 5 MB or smaller.", 413);
  }

  const host = env.ZOHO_SMTP_HOST;
  const port = Number(env.ZOHO_SMTP_PORT ?? "465");
  const user = env.ZOHO_SMTP_USER;
  const password = env.ZOHO_SMTP_PASSWORD;
  const from = env.CONTACT_FROM_EMAIL;
  const to = env.CONTACT_TO_EMAIL;
  if (!host || !user || !password || !from || !to || ![465, 587].includes(port)) {
    return response(
      "The contact form is being set up. Please email hello@mzfortech.com for now.",
      503
    );
  }

  const lines = [
    "A new project brief was submitted on mzfortech.com.",
    "",
    `Reply to: ${email}`,
    `Expertise: ${expertise.length ? expertise.join(", ") : "Not provided"}`,
    `Budget: ${budget}`,
    `Timeline: ${timeline}`,
    `Referral: ${referral}`,
    "",
    "Project description:",
    description,
  ];

  const settings: SmtpSettings = {
    host,
    port,
    secure: port === 465,
    requireTLS: port === 587,
    auth: { user, pass: password },
  };

  try {
    const result = await deliver(settings, {
      from,
      to,
      replyTo: email,
      subject: "New project brief — MZ website",
      text: lines.join("\n"),
      ...(attachment
        ? {
            attachments: [{
              filename: attachment.name.replace(/[\\/\r\n]/g, "_").slice(0, 180),
              content: Buffer.from(await attachment.arrayBuffer()),
            }],
          }
        : {}),
    });
    if (!result.accepted.length) return response("The mail server did not accept your brief. Please email us directly.", 502);
  } catch {
    // Transport error messages may contain personal data or credentials.
    return response("We couldn't send your brief right now. Please email us directly.", 502);
  }

  return Response.json({ delivered: true, message: "Your brief was accepted for delivery." });
}
