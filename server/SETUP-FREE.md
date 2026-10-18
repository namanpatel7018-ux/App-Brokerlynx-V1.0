# Free email-code setup (Google Apps Script, about 5 minutes, no card, no domain)

1. Sign in to the Gmail account the emails should come from (for example a new account such as brokerlynx.noreply@gmail.com).
2. Open https://script.google.com , New project. Delete the sample code and paste the whole of `server/Code.gs`. Save.
3. Deploy > New deployment > type **Web app**. Execute as: **Me**. Who has access: **Anyone**. Click Deploy and allow the permissions (Google asks once to let the script send mail).
4. Copy the Web app URL (it ends in `/exec`).
5. In the app, open `js/core/config.js` and set `OTP_API: 'PASTE-THE-URL-HERE'`. Rebuild the app.

Notes: customers see the sender name "Brokerlynx" with your Gmail address behind it. Google limits a normal Gmail account to about 100 emails a day. The very first email may land in Spam, so tell customers to check it. If you edit Code.gs later, use Deploy > Manage deployments > Edit > New version, so the URL stays the same.
The Cloudflare files (otp-worker.js, wrangler.toml) are optional and not needed for this free route.
