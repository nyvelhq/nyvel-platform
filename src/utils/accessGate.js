// Shared config for the site-wide soft-gate (PasswordGate + query-param bypass).
// The 'nyvel2024' fallback is a known weak default if REACT_APP_PASSWORD
// is ever unset in an environment — see docs/ops/RUNBOOK.md §1.2.
export const ACCESS_PASSWORD = process.env.REACT_APP_PASSWORD || 'nyvel2024';
export const ACCESS_QUERY_PARAM = 'key';
