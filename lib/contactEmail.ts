type ProjectBrief = {
  name: string;
  company: string;
  email: string;
  phone: string;
  expertise: string;
  budget: string;
  timeline: string;
  referral: string;
  description: string;
  attachment: string;
  reference: string;
  submittedAt: string;
};

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]!);
}

export function buildContactEmail(brief: ProjectBrief) {
  const clientDetails = [
    ["Full name", brief.name],
    ["Company / organization", brief.company || "Not provided"],
    ["Email", brief.email],
    ["Phone", brief.phone],
  ];
  const projectDetails = [
    ["Services requested", brief.expertise],
    ["Budget range", brief.budget],
    ["Expected timeline", brief.timeline],
    ["How they found MZ", brief.referral],
    ["Attachment", brief.attachment || "None"],
  ];
  const rows = (details: string[][]) => details.map(([label, value]) => `
    <tr><td style="padding:12px 0;border-bottom:1px solid #e8eaed;font-size:12px;color:#667085;vertical-align:top;width:38%">${escapeHtml(label)}</td>
    <td dir="auto" style="padding:12px 0 12px 12px;border-bottom:1px solid #e8eaed;font-size:14px;color:#182230;vertical-align:top;overflow-wrap:anywhere">${escapeHtml(value)}</td></tr>`).join("");
  const text = [
    "MZ | NEW PROJECT INQUIRY", `Reference: ${brief.reference}`, `Submitted: ${brief.submittedAt}`,
    "", "CLIENT DETAILS", ...clientDetails.map(([label, value]) => `${label}: ${value}`),
    "", "PROJECT OVERVIEW", ...projectDetails.map(([label, value]) => `${label}: ${value}`),
    "", "PROJECT DESCRIPTION", brief.description,
    "", "Reply to this email to contact the client directly.", "Source: https://www.mzfortech.com/contact",
  ].join("\n");
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>New project inquiry | MZ</title></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;color:#182230">
<div style="display:none;max-height:0;overflow:hidden">New inquiry from ${escapeHtml(brief.name)} · ${escapeHtml(brief.expertise)}</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border:1px solid #e4e7ec;border-radius:12px;overflow:hidden">
<tr><td style="background:#111318;padding:32px;border-top:4px solid #e8d44d">
<p style="margin:0 0 24px;color:#e8d44d;font-size:24px;font-weight:bold;letter-spacing:4px">MZ</p>
<p style="margin:0 0 8px;color:#bbc1cc;font-size:11px;letter-spacing:2px">WEBSITE / PROJECT INQUIRY</p>
<h1 style="margin:0;color:#ffffff;font-size:26px;line-height:1.3">A new conversation starts here.</h1>
</td></tr>
<tr><td style="padding:28px 32px">
<p style="margin:0 0 8px;color:#667085;font-size:12px">${escapeHtml(brief.reference)} · ${escapeHtml(brief.submittedAt)}</p>
<p dir="auto" style="margin:0 0 28px;font-size:16px;line-height:1.6"><strong>${escapeHtml(brief.name)}</strong> has submitted a project brief through the MZ website.</p>
<h2 style="font-size:16px;margin:0 0 8px">Client details</h2>
<table width="100%" cellspacing="0" cellpadding="0">${rows(clientDetails)}</table>
<h2 style="font-size:16px;margin:28px 0 8px">Project overview</h2>
<table width="100%" cellspacing="0" cellpadding="0">${rows(projectDetails)}</table>
<h2 style="font-size:16px;margin:28px 0 12px">Project description</h2>
<div dir="auto" style="background:#f8f9fb;border:1px solid #e4e7ec;border-radius:8px;padding:20px;font-size:15px;line-height:1.8;white-space:pre-wrap;overflow-wrap:anywhere;text-align:start">${escapeHtml(brief.description)}</div>
<p style="margin:28px 0 16px;line-height:2.8"><a href="mailto:${escapeHtml(encodeURIComponent(brief.email))}" style="display:inline-block;background:#e8d44d;color:#111318;padding:4px 20px;text-decoration:none;font-weight:bold;border-radius:6px">Reply to client</a> &nbsp; <a href="tel:${escapeHtml(brief.phone)}" style="color:#182230;font-size:14px">Call client</a></p>
<p style="margin:0;font-size:12px;color:#667085;line-height:1.6">You can also reply directly to this email. Your response will go to the client, not the website mailbox.</p>
</td></tr>
<tr><td style="padding:20px 32px;background:#f8f9fb;border-top:1px solid #e4e7ec;font-size:12px;color:#667085;line-height:1.7">MZ · Website contact form<br><a href="https://www.mzfortech.com/contact" style="color:#667085">mzfortech.com/contact</a> · Internal inquiry notification</td></tr>
</table></td></tr></table></body></html>`;
  return { text, html };
}
