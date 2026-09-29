import { Resend } from "resend";

const FROM_ADDRESS = process.env.EMAIL_FROM ?? "lauks24.lv <noreply@lauks24.lv>";
export const ADMIN_NOTIFICATION_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL ?? "info@lauks24.lv";

let client: Resend | null = null;
function getClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!client) client = new Resend(process.env.RESEND_API_KEY);
  return client;
}

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  const resend = getClient();
  if (!resend) {
    // Not configured yet -- log instead of failing the calling action, so
    // the rest of the app keeps working before RESEND_API_KEY is set.
    console.warn(`[email] RESEND_API_KEY not set, skipping email "${subject}" to ${to}`);
    return;
  }

  try {
    await resend.emails.send({ from: FROM_ADDRESS, to, subject, html });
  } catch (err) {
    console.error(`[email] failed to send "${subject}" to ${to}`, err);
  }
}

export function emailLayout(locale: string, bodyHtml: string): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://lauks24.lv";
  return `
    <div style="font-family:'Work Sans',Arial,sans-serif;background:#faf8f3;padding:32px 16px;">
      <div style="max-width:480px;margin:0 auto;background:#ffffff;border:1px solid #e7e2d8;border-radius:16px;overflow:hidden;">
        <div style="background:#3b5168;padding:20px 24px;">
          <a href="${siteUrl}/${locale}" style="color:#ffffff;font-size:18px;font-weight:700;text-decoration:none;">lauks24.lv</a>
        </div>
        <div style="padding:28px 24px;color:#2b2a24;font-size:14px;line-height:1.6;">
          ${bodyHtml}
        </div>
      </div>
    </div>
  `;
}

export function emailButton(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;margin-top:16px;background:#3f6b3f;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:10px 20px;border-radius:999px;">${label}</a>`;
}
