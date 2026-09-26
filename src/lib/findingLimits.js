// Mirrors supabase/migrations/0014_findings_cap.sql (SEC-04). The database
// enforces these; the UI uses them to explain the limits up front.
export const MAX_FINDINGS_PER_TEST = 25;
export const MAX_FINDING_TITLE = 200;
export const MAX_FINDING_DESCRIPTION = 5000;
