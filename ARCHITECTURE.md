# Brokerlynx: code architecture

The app is a Capacitor Android shell around a plain-JavaScript web app in `app/src/main/assets/public/`. There is no bundler and no backend; every file is a classic `<script>` that shares one global scope, loaded in the fixed order below by `index.html`.

```
public/
  index.html            markup only (no inline script, no inline CSS)
  css/app.css           all styles (light + dark)
  jspdf.umd.min.js, xlsx.mini.min.js, pdf.min.js ...   third-party libraries (unchanged)
  js/
    core/config.js        ONE place for the lifetime price (₹999) and trial length (30 days)
    core/access.js        ONE authority for access: lifetime | trial | expired (trial maths, clock safety, guards)
    core/helpers.js       escaping, dates, formatting, ids
    core/storage.js       snapshots, company record, save()
    domain/calc.js        contract maths: quantities, amounts, brokerage, status
    domain/numbering.js   contract / delivery-order numbers + their migrations
    domain/validators.js  vehicle, pincode, phone
    domain/gst.js         GSTIN / state / PAN validation
    domain/migrations.js  data migrations
    domain/brokerage.js   brokerage shared with brokers: allocations, balances, status, validation, backup integrity (no DOM)
    platform/files.js     file naming, share / download of PDF and CSV
    ui/shell.js           navigation, sheets, toast, main render()
    ui/preview.js         in-app PDF / CSV preview
    features/ledgers.js   parties
    features/masters.js   items, transporters, vehicles
    features/brokers.js   brokers (dalals) master, payments to brokers, broker statements, searchable broker picker
    features/contracts.js contracts
    features/delivery.js  delivery orders
    features/reports.js   statements, reports, CSV/PDF exports
    features/contract-pdf.js  contract PDF
    features/import.js    ledger import (CSV / Excel)
    features/settings.js  company details, terms
    features/backup.js    backup export, restore, snapshots, reminders
    features/licensing.js licence key check, upgrade window, requests, restore request, expiry window
    features/accounts.js  sign up / sign in / log out / password
    features/otp.js       forgot password by emailed code (active only when OTP_API is set; server/Code.gs)
    core/state.js         application state, session, database load, boot. RUNS LAST
```

**Load order matters.** Function modules are order-independent and load first; `core/state.js` holds everything that executes at start-up and keeps its original order.

**Where each business rule lives (change it in one place only)**
| Rule | File |
|---|---|
| Lifetime price, trial length, UPI link | `js/core/config.js` (admin page: `LIFETIME_PRICE`, `TRIAL_DAYS` constants, keep equal) |
| Who may use the app (trial, expiry, lifetime) | `js/core/access.js` |
| Is a licence key genuine (signature, install, email) | `js/features/licensing.js` (`licCheck`) |
| Only admin-signed keys unlock lifetime | admin page vault + `licCheck`; nothing else sets `LICV` |
| Brokers, shares and payments (rules, balances, validation) | `js/domain/brokerage.js`; screens in `js/features/brokers.js` |
| Blocking window after trial | `lim()` in `features/licensing.js`, re-asserted by `access.js` |

**Adding a feature:** put its functions in a new file under `js/features/`, add one `<script>` line before `core/state.js` in `index.html`, run `tests/run_all.sh`. `tests/structure.js` fails if a file is missing, duplicated, orphaned, or a function name is defined twice.

**Honest limits of this structure.** Files are separated by responsibility, but they still share global variables (e.g. `db`, `SESS`) because the app was built that way; converting to ES modules would be a larger rewrite and was deliberately not done pre-release. Cross-module calls are by global function name.

**Deploy:** copy the whole `public/` content (`index.html`, `css/`, `js/` and the libraries) into your source `www/` folder before `npx cap sync`.
