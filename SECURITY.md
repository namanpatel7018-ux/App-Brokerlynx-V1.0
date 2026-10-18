# Brokerlynx security notes (honest version)

No app can be "hacker proof". This is what is protected, how it was checked, and what is not.

## Protected (tested)
- **Script injection from text**: names, notes, company, terms, brokers, vehicles etc. are escaped everywhere. Tested by putting an attack string in every free-text field and opening every screen (app and admin): nothing ran.
- **Hostile backup files**: record ids are placed inside tap handlers, so a doctored backup could run code when a row is tapped. Restore now cleans ids (letters, digits, _ . - only); normal backups are unchanged. Demonstrated on the previous build, fixed here.
- **Admin portal**: customer request codes are untrusted input. Tested with attack strings in every field: shown as plain text only. The admin page has no network access at all (policy `connect-src 'none'`).
- **Content Security Policy** (both pages): the app may talk only to itself and Google Apps Script (the email-code service); no plugins, no base-tag tricks, no form posts. Checked across the full test suite, PDF preview and CSV import: zero violations.
- **Passwords**: PBKDF2-SHA-256, 150,000 rounds, per-user salt; wrong-password lockout; forgotten passwords are reset with an emailed one-time code.
- **Licence keys**: ECDSA P-256 signatures bound to install id and email; the signing key is only in the admin's passcode-encrypted vault.
- **Email codes**: 6 digits, stored only as a keyed hash, 10 minutes, single use, 5 tries, resend gap, hourly cap, no account discovery.
- **Android**: WebView debugging off, cleartext traffic off, mixed content off, only the launcher activity exported.

## Not protected (cannot be, without a server or a locked-down phone)
- Someone holding an **unlocked phone** can open the app (it stays signed in by design). Use the phone's screen lock.
- On a **rooted phone**, app data (localStorage) can be read or edited. Data is not encrypted at rest.
- A **modified APK** can remove the trial/licence checks. Only server-side checks stop that.
- Reinstalling gives a fresh 30-day trial unless the old backup is restored.
- Backup files are readable text (no passwords inside). Keep them private.
- The free email service allows about 100 emails/day; someone could use them up.
- `allowBackup` is still on so Google's device backup can restore data on a new phone; set it to false if you prefer that data never leaves the phone this way.
