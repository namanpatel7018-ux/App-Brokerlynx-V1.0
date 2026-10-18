/* Brokerlynx email-OTP service (Cloudflare Worker). The app has no backend of its own; this is the only server piece.
   Bindings/secrets: KV namespace OTP_KV; secrets RESEND_API_KEY, OTP_SECRET (long random string); var MAIL_FROM
   e.g. "Brokerlynx <no-reply@yourdomain.com>" (domain must be verified with your email provider).
   Rules: 6-digit code, stored only as a keyed hash, 10 minute life, single use, max 5 wrong tries, 60 s resend
   gap, max 5 codes per email per hour. /otp/send always answers ok so it cannot be used to discover who has an account. */
import { otpEmail } from './email-template.js';
const TTL = 600, COOL = 60, MAXTRY = 5, HOURLY = 5;
const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' };
const J = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { 'Content-Type': 'application/json', ...CORS } });
const hex = b => [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
const mac = async (secret, msg) => { const k = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']); return hex(await crypto.subtle.sign('HMAC', k, new TextEncoder().encode(msg))); };
const em = e => String(e || '').trim().toLowerCase();
const okEmail = e => e.length <= 120 && /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(e);
const eq = (a, b) => a.length === b.length && [...a].reduce((r, c, i) => r | (c.charCodeAt(0) ^ b.charCodeAt(i)), 0) === 0;
export default {
  async fetch(req, env) {
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
    let path = new URL(req.url).pathname;
    if (req.method !== 'POST') return J({ ok: false }, 405);
    let b = {}; try { b = await req.json(); } catch (e) { return J({ ok: false }, 400); }
    if (b.action) path = '/otp/' + b.action;
    const email = em(b.email); if (!okEmail(email)) return J({ ok: false }, 400);
    const key = 'otp:' + email, now = Date.now();
    if (path === '/otp/send') {
      const rate = JSON.parse((await env.OTP_KV.get('rate:' + email)) || '{"n":0,"t":0}');
      if (now - rate.t > 3600e3) { rate.n = 0; rate.t = now; }
      const cur = JSON.parse((await env.OTP_KV.get(key)) || 'null');
      if ((await env.OTP_KV.get('cool:' + email)) || rate.n >= HOURLY) return J({ ok: false }, 429);
      const code = String(crypto.getRandomValues(new Uint32Array(1))[0] % 1000000).padStart(6, '0');
      await env.OTP_KV.put(key, JSON.stringify({ h: await mac(env.OTP_SECRET, email + ':' + code), at: now, exp: now + TTL * 1000, tries: 0 }), { expirationTtl: TTL + 60 });
      await env.OTP_KV.put('cool:' + email, '1', { expirationTtl: 60 }); rate.n++; await env.OTP_KV.put('rate:' + email, JSON.stringify(rate), { expirationTtl: 3700 });
      const m = otpEmail({ code, minutes: TTL / 60 });
      const r = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: 'Bearer ' + env.RESEND_API_KEY, 'Content-Type': 'application/json' }, body: JSON.stringify({ from: env.MAIL_FROM, to: [email], subject: m.subject, html: m.html, text: m.text }) });
      if (!r.ok) return J({ ok: false }, 502);
      return J({ ok: true });
    }
    if (path === '/otp/verify') {
      const code = String(b.code || '').replace(/\D/g, ''); const cur = JSON.parse((await env.OTP_KV.get(key)) || 'null');
      if (!cur || now > cur.exp || code.length !== 6) return J({ ok: false }, 400);
      if (cur.tries >= MAXTRY) { await env.OTP_KV.delete(key); return J({ ok: false }, 429); }
      if (!eq(cur.h, await mac(env.OTP_SECRET, email + ':' + code))) { cur.tries++; await env.OTP_KV.put(key, JSON.stringify(cur), { expirationTtl: Math.max(60, Math.ceil((cur.exp - now) / 1000)) }); return J({ ok: false }, cur.tries >= MAXTRY ? 429 : 400); }
      await env.OTP_KV.delete(key);   // single use
      return J({ ok: true });
    }
    return J({ ok: false }, 404);
  }
};
