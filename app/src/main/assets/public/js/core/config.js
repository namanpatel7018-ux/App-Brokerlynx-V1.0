/* Brokerlynx central configuration. The ONLY place for price and trial length.
   Anything that shows, quotes or checks the lifetime price or the trial period
   must read it from BLX.cfg. Do not put secrets or private keys here. */
(function (g) {
  'use strict';
  var PRICE = 999, TRIAL_DAYS = 30;
  var cfg = Object.freeze({
    LIFETIME_PRICE: PRICE,
    TRIAL_DAYS: TRIAL_DAYS,
    /* Base URL of the email-OTP service (server/otp-worker.js). Password reset by email needs this to be set. */
    OTP_API: 'https://script.google.com/macros/s/AKfycbzfi8_R3-kmKrlR5yPUBvzjDHHlaRqJdQLAobnpvFSOpIzOpMdTtegjP01uuyKogzHWgg/exec',
    DAY_MS: 86400000,
    TRIAL_MS: TRIAL_DAYS * 86400000,
    price: function () { return '\u20B9' + PRICE; },          // "₹999"
    upi: Object.freeze({ id: 'namanpatel7018@okhdfcbank', name: 'NAMAN PATEL', note: 'Brokerlynx Lifetime' }),
    upiUrl: function () {
      return 'upi://pay?pa=' + this.upi.id + '&pn=' + encodeURIComponent(this.upi.name) +
        '&am=' + PRICE + '.00&cu=INR&tn=' + encodeURIComponent(this.upi.note);
    }
  });
  g.BLX = g.BLX || {};
  g.BLX.cfg = cfg;
})(typeof window !== 'undefined' ? window : globalThis);
