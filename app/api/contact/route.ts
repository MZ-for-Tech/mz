import { createTransport } from "nodemailer";
import { handleContact } from "@/lib/contact";

export const runtime = "nodejs";

export async function POST(request: Request) {
  return handleContact(request, process.env, async (settings, mail) => {
    const transport = createTransport({ ...settings, connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 20000 });
    try { return await transport.sendMail(mail); }
    finally { transport.close(); }
  });
}
