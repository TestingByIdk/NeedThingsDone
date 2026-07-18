export type EmailPayload = {
  to: string;
  subject: string;
  title: string;
  paragraphs: string[];
  buttonLabel?: string;
  buttonUrl?: string;
  note?: string;
};

const escapeHtml = (value: string): string => value
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

export function renderEmail(payload: EmailPayload): string {
  const paragraphs = payload.paragraphs.map((item) => `<p style="font-size:16px;line-height:1.65;margin:0 0 17px;color:#43546b">${escapeHtml(item)}</p>`).join("");
  const button = payload.buttonLabel && payload.buttonUrl
    ? `<div style="padding:8px 0 24px"><a href="${escapeHtml(payload.buttonUrl)}" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;font-size:16px;font-weight:700;padding:14px 24px;border-radius:10px">${escapeHtml(payload.buttonLabel)}</a></div>`
    : "";
  return `<!doctype html><html><body style="margin:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif"><table role="presentation" width="100%" style="padding:32px 12px"><tr><td><table role="presentation" width="100%" style="max-width:600px;margin:auto"><tr><td style="padding:0 8px 18px"><div style="font-size:25px;font-weight:800;color:#071a33">NeedThings<span style="color:#2563eb">Done</span></div><div style="font-size:13px;color:#64748b;margin-top:4px">From need to done.</div></td></tr><tr><td style="background:#fff;border:1px solid #dfe7f1;border-radius:18px;overflow:hidden"><div style="height:5px;background:#2563eb"></div><div style="padding:38px"><h1 style="font-size:28px;line-height:1.2;margin:0 0 18px;color:#071a33">${escapeHtml(payload.title)}</h1>${paragraphs}${button}<p style="font-size:14px;color:#64748b;border-top:1px solid #e7edf5;padding-top:20px">${escapeHtml(payload.note ?? "If you did not request this email, you can safely ignore it.")}</p></div></td></tr><tr><td style="text-align:center;padding:20px;color:#718096;font-size:12px">Questions? support@needthingsdone.ca<br>© 2026 NeedThingsDone · From need to done.</td></tr></table></td></tr></table></body></html>`;
}
