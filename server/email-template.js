/* Premium Brokerlynx verification email. Table layout + inline CSS so it renders in Gmail, Outlook and Apple Mail.
   No remote images (they are often blocked): the logo mark is pure CSS/text. */
export function otpEmail({ code, minutes = 10, name = '' }) {
  const digits = String(code).split('').map(d =>
    `<td style="width:46px;height:58px;background:#0f1b33;border:1px solid #c9a24d;border-radius:10px;text-align:center;font:700 30px/58px 'Segoe UI',Arial,sans-serif;color:#f5d68a;">${d}</td><td style="width:8px"></td>`).join('');
  const hi = name ? `Hello ${String(name).replace(/[<>&"]/g, '')},` : 'Hello,';
  const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light only"></head>
<body style="margin:0;padding:0;background:#eef1f6;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">Your Brokerlynx verification code is ${code}. It expires in ${minutes} minutes.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef1f6;padding:32px 12px;"><tr><td align="center">
 <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 10px 30px rgba(15,27,51,.12);">
  <tr><td style="background:#0b1428;padding:34px 36px 28px;text-align:left;">
    <table role="presentation" cellpadding="0" cellspacing="0"><tr>
     <td style="width:44px;height:44px;border-radius:12px;background:#c9a24d;text-align:center;font:800 24px/44px Georgia,serif;color:#0b1428;">B</td>
     <td style="padding-left:12px;font:700 22px 'Segoe UI',Arial,sans-serif;color:#ffffff;letter-spacing:.3px;">Broker<span style="color:#f5d68a;">lynx</span></td></tr></table>
    <div style="margin-top:22px;font:600 12px 'Segoe UI',Arial,sans-serif;letter-spacing:2px;color:#c9a24d;text-transform:uppercase;">Password reset</div>
    <div style="margin-top:6px;font:700 26px/1.25 'Segoe UI',Arial,sans-serif;color:#ffffff;">Verify it&rsquo;s you</div>
  </td></tr>
  <tr><td style="padding:32px 36px 8px;font:400 15px/1.65 'Segoe UI',Arial,sans-serif;color:#2b3550;">
    <p style="margin:0 0 14px;">${hi}</p>
    <p style="margin:0 0 22px;">Use the code below to reset your Brokerlynx password. Enter it in the app to continue.</p>
    <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:0 auto 10px;"><tr>${digits}</tr></table>
    <p style="margin:18px 0 0;text-align:center;font:600 13px 'Segoe UI',Arial,sans-serif;color:#7a5b12;">Valid for ${minutes} minutes &middot; single use</p>
  </td></tr>
  <tr><td style="padding:22px 36px 6px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#faf6ea;border-left:4px solid #c9a24d;border-radius:8px;"><tr><td style="padding:14px 16px;font:400 13px/1.6 'Segoe UI',Arial,sans-serif;color:#4a4020;">
      <b>Keep this code private.</b> Brokerlynx will never ask you for it by phone, chat or email. If you did not ask to reset your password, you can ignore this message; your account stays unchanged.</td></tr></table>
  </td></tr>
  <tr><td style="padding:26px 36px 32px;font:400 12px/1.6 'Segoe UI',Arial,sans-serif;color:#8a93a8;border-top:1px solid #edf0f5;margin-top:20px;">
    Brokerlynx &middot; Smart Deals, Seamless Records<br>This is an automated message, please do not reply.</td></tr>
 </table></td></tr></table></body></html>`;
  const text = `${hi}\n\nYour Brokerlynx verification code is ${code}.\nIt is valid for ${minutes} minutes and can be used once.\n\nKeep it private. If you did not request a password reset, ignore this email.\n\nBrokerlynx - Smart Deals, Seamless Records`;
  return { subject: `${code} is your Brokerlynx verification code`, html, text };
}
