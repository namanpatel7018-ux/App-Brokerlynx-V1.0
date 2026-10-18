/* Premium Brokerlynx verification email. Table layout + inline CSS so it renders in Gmail, Outlook and Apple Mail.
   No remote images (they are often blocked): the logo mark is pure CSS/text. */
function otpEmail({ code, minutes = 10, name = '', logo = false }) {
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
     ${logo ? '<td style="width:44px;height:44px;"><img src="cid:brokerlynxlogo" width="44" height="44" alt="Brokerlynx" style="display:block;width:44px;height:44px;border:0;border-radius:12px;"></td>' : '<td style="width:44px;height:44px;border-radius:12px;background:#c9a24d;text-align:center;font:800 24px/44px Georgia,serif;color:#0b1428;">B</td>'}
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


/* ===== Brokerlynx email-OTP service on Google Apps Script (free, no domain, no card) =====
   Sends from YOUR Gmail with the display name "Brokerlynx". Limits: Google allows about 100 emails/day on a
   normal Gmail account (1,500 on Workspace). Same rules as the Cloudflare version: 6-digit code stored only
   as a keyed hash, 10 min life, single use, 5 wrong tries, 60 s resend gap, 5 codes per email per hour. */
var TTL = 600, COOL = 60, MAXTRY = 5, HOURLY = 5;
/* Brokerlynx logo shown at the top of the email (small JPEG, sent as an inline image). */
var LOGO_B64 = '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';
function secret_() {
  var p = PropertiesService.getScriptProperties(), s = p.getProperty('OTP_SECRET');
  if (!s) { s = Utilities.getUuid() + Utilities.getUuid(); p.setProperty('OTP_SECRET', s); }
  return s;
}
function mac_(msg) {
  return Utilities.computeHmacSha256Signature(msg, secret_()).map(function (b) { return ('0' + (b & 255).toString(16)).slice(-2); }).join('');
}
function out_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function doGet() { return out_({ ok: true, service: 'brokerlynx-otp' }); }
function doPost(e) {
  var lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    var b = {}; try { b = JSON.parse(e.postData.contents); } catch (x) { return out_({ ok: false, err: 'bad' }); }
    var email = String(b.email || '').trim().toLowerCase();
    if (email.length > 120 || !/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email)) return out_({ ok: false, err: 'bad' });
    var c = CacheService.getScriptCache(), key = 'otp:' + email, now = Date.now();
    if (b.action === 'send') {
      var rate = JSON.parse(c.get('rate:' + email) || '{"n":0}'), cur = JSON.parse(c.get(key) || 'null');
      if (c.get('cool:' + email) || rate.n >= HOURLY) return out_({ ok: false, err: 'rate' });
      var code = ('000000' + Math.floor(Math.random() * 1000000)).slice(-6);
      c.put(key, JSON.stringify({ h: mac_(email + ':' + code), at: now, exp: now + TTL * 1000, tries: 0 }), TTL + 60);
      c.put('cool:' + email, '1', COOL); rate.n++; c.put('rate:' + email, JSON.stringify(rate), 3600);
      var inline = null;
      try { inline = { brokerlynxlogo: Utilities.newBlob(Utilities.base64Decode(LOGO_B64), 'image/jpeg', 'brokerlynx-logo.jpg') }; } catch (le) { inline = null; }
      var m = otpEmail({ code: code, minutes: TTL / 60, logo: !!inline });
      var mail = { to: email, subject: m.subject, htmlBody: m.html, body: m.text, name: 'Brokerlynx', noReply: true };
      if (inline) mail.inlineImages = inline;
      MailApp.sendEmail(mail);
      return out_({ ok: true });
    }
    if (b.action === 'verify') {
      var code2 = String(b.code || '').replace(/\D/g, ''), r = JSON.parse(c.get(key) || 'null');
      if (!r || now > r.exp || code2.length !== 6) return out_({ ok: false, err: 'bad' });
      if (r.tries >= MAXTRY) { c.remove(key); return out_({ ok: false, err: 'rate' }); }
      if (r.h !== mac_(email + ':' + code2)) { r.tries++; c.put(key, JSON.stringify(r), Math.max(60, Math.ceil((r.exp - now) / 1000))); return out_({ ok: false, err: r.tries >= MAXTRY ? 'rate' : 'bad' }); }
      c.remove(key);
      return out_({ ok: true });
    }
    return out_({ ok: false, err: 'bad' });
  } finally { lock.releaseLock(); }
}
