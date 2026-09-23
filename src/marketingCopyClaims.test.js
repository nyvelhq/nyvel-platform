import { testTypes } from './data/mockData';
import { useCases } from './components/marketing/Testimonials';

// Regression guard for a compliance-risk claim that shipped on the public
// landing page: "Fintech & Payments — non-sandbox payment testing with
// real-world financial flows." Nyvel doesn't process real financial
// transactions during testing, so nothing on the public site (or the
// CreateTest wizard's Fintech option) may imply that it does. This checks
// every string a real person can read, not just the one flagged string, so
// a differently-worded reintroduction still fails CI.
const FORBIDDEN_PHRASES = [
  /non-sandbox/i,
  /real-world financial/i,
  /real[- ]environment payment/i,
  /money-moving/i,
  /real transaction testing/i,
];

function assertNoForbiddenClaims(label, text) {
  FORBIDDEN_PHRASES.forEach((pattern) => {
    if (pattern.test(text)) {
      throw new Error(`${label} contains a forbidden real-money-testing claim (matched ${pattern}): "${text}"`);
    }
  });
}

describe('public-facing fintech/payments copy', () => {
  it('does not claim Nyvel tests real, non-sandbox financial transactions', () => {
    testTypes.forEach((t) => assertNoForbiddenClaims(`testTypes["${t.name}"].desc`, t.desc));
    useCases.forEach((u) => {
      assertNoForbiddenClaims(`useCases["${u.tag}"].title`, u.title);
      assertNoForbiddenClaims(`useCases["${u.tag}"].desc`, u.desc);
    });
  });
});
