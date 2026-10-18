/* Brokerlynx access / entitlement module: the single authority for
   "may this user use the app right now?".  States: lifetime | trial | expired.
   Lifetime is decided ONLY by a cryptographically verified admin key
   (deps.premium() is true only after licCheck() verified the signature,
   device, and account email). Nothing a customer types or submits (UTR, request,
   screenshot, local flag) can produce 'lifetime'.

   Trial: 30 days from the EARLIEST known start. The start is kept in three
   places (device anchor, account registry, the account data/backups) and the
   earliest valid one always wins, so logging out, restarting, updating,
   re-registering or restoring a backup never gives a new trial.
   Clock safety: a persisted high-water mark of the latest time ever seen stops
   the trial being extended by moving the phone clock backwards.
   LIMIT: this is on-device enforcement. Clearing app data / reinstalling removes
   the anchor and can start a new trial. Only a server can prevent that. */
(function (g) {
  'use strict';
  var cfg = g.BLX.cfg, TK = 'bb_trial', HK = 'bb_hw', deps = null, lastW = 0;
  var ls = function () { try { return g.localStorage; } catch (e) { return null; } };
  var rd = function (k) { try { return ls().getItem(k); } catch (e) { return null; } };
  var wr = function (k, v) { try { ls().setItem(k, v); return true; } catch (e) { return false; } };
  var ms = function (v) {
    if (v == null || v === '') return NaN;
    var t = typeof v === 'number' ? v : Date.parse(v);
    return isFinite(t) && t > 946684800000 ? t : NaN;       // ignore anything before year 2000
  };

  function now() {
    var t = Date.now(), hw = +rd(HK) || 0;
    if (!(t > 0)) return hw;
    if (hw > t) return hw;                                   // clock was moved back: keep the later time
    if (t - lastW > 30000 || !lastW) { wr(HK, String(t)); lastW = t; }
    return t;
  }

  function anchor() { try { return ms(JSON.parse(rd(TK)).s); } catch (e) { return NaN; } }

  function startInfo() {
    var n = now(), c = [], a = anchor(), accts = (deps.accounts && deps.accounts()) || [];
    if (a) c.push(a);
    accts.forEach(function (x) { var t = ms(x && x.at); if (t) c.push(t); });
    var d = ms(deps.dbTrial && deps.dbTrial()); if (d) c.push(d);
    if (!a && deps.dataFloor) { var f = ms(deps.dataFloor()); if (f) c.push(f); }  // pre-account data: oldest record
    c = c.filter(function (t) { return t <= n; });           // a start in the future is corrupt or tampered: ignore
    if (!c.length) return accts.length ? { start: null } : { start: n, fresh: true };
    return { start: Math.min.apply(null, c) };
  }

  function persist(s) {
    if (!(s > 0)) return;
    var a = anchor();
    if (!a || a > s) wr(TK, JSON.stringify({ v: 1, s: new Date(s).toISOString() }));
    if (deps.session && deps.session() && deps.setDbTrial) deps.setDbTrial(new Date(s).toISOString(), s);
  }

  /* { start, end, now, daysTotal, daysUsed, daysLeft, expired, invalid } */
  function trial() {
    var n = now(), si = startInfo(), T = cfg.TRIAL_MS;
    if (si.start == null) return { start: null, end: null, now: n, daysTotal: cfg.TRIAL_DAYS, daysUsed: cfg.TRIAL_DAYS, daysLeft: 0, expired: true, invalid: true };
    if (!si.fresh) persist(si.start);
    var end = si.start + T, left = Math.max(0, Math.ceil((end - n) / cfg.DAY_MS));
    return { start: si.start, end: end, now: n, daysTotal: cfg.TRIAL_DAYS, daysUsed: Math.min(cfg.TRIAL_DAYS, Math.max(0, Math.floor((n - si.start) / cfg.DAY_MS))), daysLeft: left, expired: n >= end };
  }

  function state() {
    if (deps.premium && deps.premium()) return 'lifetime';
    return trial().expired ? 'expired' : 'trial';
  }
  var blocked = function () { return !!deps && !!(deps.session && deps.session()) && state() === 'expired'; };

  /* Shown screens that stay reachable while blocked: license/contact/restore and
     the Backup screen (so customers can always save or restore their own data). */
  function recheck() {
    if (!blocked() || (deps.exempt && deps.exempt()) || (deps.busy && deps.busy())) return false;
    deps.showBlock(); return true;
  }
  function guard() { if (deps && blocked()) { deps.showBlock(); return true; } return false; }
  function wrap(fn) { return function () { if (guard()) return; return fn.apply(this, arguments); }; }

  g.BLX.access = {
    init: function (d) { deps = d; },
    now: now, trial: trial, state: state, blocked: blocked, recheck: recheck, guard: guard, wrap: wrap,
    _reset: function () { lastW = 0; }
  };
})(typeof window !== 'undefined' ? window : globalThis);
