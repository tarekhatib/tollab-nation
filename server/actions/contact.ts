"use server";

import { Resend } from "resend";

const CONTACT_TO = process.env.CONTACT_EMAIL_TO || "tollabcontact@gmail.com";
const CONTACT_FROM = process.env.CONTACT_EMAIL_FROM || "Tollab Nation Contact <onboarding@resend.dev>";

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export async function submitContactForm(
  name: string,
  email: string,
  message: string
): Promise<{ success?: boolean; error?: string }> {
  if (!name.trim() || !email.trim() || !message.trim()) {
    return { error: "All fields are required." };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { error: "Please enter a valid email address." };
  }

  if (message.trim().length < 10) {
    return { error: "Message must be at least 10 characters." };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[contact] RESEND_API_KEY is not set; message not sent.");
    return { error: "The contact form is temporarily unavailable. Please email us directly." };
  }
  const resend = new Resend(apiKey);

  // Everything the visitor typed is escaped before it goes into the email HTML.
  const safeName = escapeHtml(name.trim());
  const safeEmail = escapeHtml(email.trim());
  const messageHtml = message
    .trim()
    .split("\n")
    .map((line) => `<p style="margin:0 0 8px 0">${escapeHtml(line) || "&nbsp;"}</p>`)
    .join("");

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 16px">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px">

        <!-- Header -->
        <tr>
          <td style="background:#C8102E;border-radius:10px 10px 0 0;padding:24px 32px">
            <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.7)">Tollab Nation</p>
            <h1 style="margin:6px 0 0;font-size:20px;font-weight:700;color:#ffffff">New Contact Message</h1>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:#ffffff;padding:32px">

            <!-- Sender info -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;border:1px solid #e5e5e5;border-radius:8px;overflow:hidden">
              <tr>
                <td style="padding:12px 16px;background:#f8f8f8;border-bottom:1px solid #e5e5e5">
                  <p style="margin:0;font-size:11px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:#888">From</p>
                </td>
              </tr>
              <tr>
                <td style="padding:16px">
                  <p style="margin:0 0 4px;font-size:16px;font-weight:600;color:#111">${safeName}</p>
                  <a href="mailto:${safeEmail}" style="font-size:14px;color:#C8102E;text-decoration:none">${safeEmail}</a>
                </td>
              </tr>
            </table>

            <!-- Message -->
            <p style="margin:0 0 10px;font-size:11px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:#888">Message</p>
            <div style="background:#f8f8f8;border-left:3px solid #C8102E;border-radius:0 8px 8px 0;padding:16px 20px;font-size:15px;line-height:1.65;color:#333">
              ${messageHtml}
            </div>

            <!-- CTA -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px">
              <tr>
                <td>
                  <a href="mailto:${safeEmail}?subject=Re: Your message to Tollab Nation"
                     style="display:inline-block;background:#C8102E;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:12px 24px;border-radius:8px">
                    Reply to ${safeName}
                  </a>
                </td>
              </tr>
            </table>

          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f4f4f5;border-radius:0 0 10px 10px;padding:20px 32px;text-align:center">
            <p style="margin:0;font-size:12px;color:#888">
              Sent via the contact form at
              <a href="https://tollabn.com/contact" style="color:#ED1C24;text-decoration:none">tollabn.com</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const { error } = await resend.emails.send({
    from: CONTACT_FROM,
    to: CONTACT_TO,
    replyTo: email,
    subject: `New message from ${name}`,
    html,
    text: `From: ${name} <${email}>\n\n${message.trim()}`,
  });

  if (error) {
    return { error: "Failed to send message. Please try again." };
  }

  return { success: true };
}
