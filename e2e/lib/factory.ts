import { serviceClient, clientIdFor, userId } from './db';
import { ACCOUNTS } from './accounts';

// Per-test data with unique names, so tests don't depend on each other and
// can run in parallel against the same database.
export const uniqueName = (label: string) => `${label} ${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

const isoDay = (offsetDays: number) => new Date(Date.now() + offsetDays * 864e5).toISOString().slice(0, 10);

export interface TestOptions {
  title?: string;
  nda?: boolean;
  status?: 'open' | 'draft' | 'complete';
  compensation?: number;
  briefing?: string | null;
  companyEmail?: string;
}

/** Creates a test owned by a company (default: the main e2e company). */
export async function createTest(opts: TestOptions = {}) {
  const companyEmail = opts.companyEmail || ACCOUNTS.company.email;
  const row = {
    client_id: await clientIdFor(companyEmail),
    created_by: await userId(companyEmail),
    title: opts.title || uniqueName('E2E test'),
    description: 'Created by the e2e suite.',
    test_type: 'Bug Hunt',
    target_tester_count: 5,
    status: opts.status || 'open',
    compensation: opts.compensation ?? 40,
    start_date: isoDay(-1),
    end_date: isoDay(14),
    platforms: ['Web'],
    expertise: [],
    nda: opts.nda ?? false,
    briefing: opts.briefing ?? null,
  };
  const { data, error } = await serviceClient().from('tests').insert(row).select('id, title').single();
  if (error) throw new Error(`createTest: ${error.message}`);
  return data as { id: string; title: string };
}

/** Puts a tester on a test directly (skipping the UI), optionally accepted. */
export async function enrol(testId: string, testerEmail: string, status: 'pending' | 'accepted' = 'accepted') {
  const { error } = await serviceClient().from('applications').insert({
    test_id: testId,
    tester_id: await userId(testerEmail),
    status,
    nda_version: 'e2e',
  });
  if (error) throw new Error(`enrol: ${error.message}`);
}

export async function addFinding(testId: string, testerEmail: string, title = uniqueName('Finding')) {
  const { data, error } = await serviceClient()
    .from('findings')
    .insert({ test_id: testId, tester_id: await userId(testerEmail), title, description: 'Steps to reproduce.', severity: 'high' })
    .select('id, title')
    .single();
  if (error) throw new Error(`addFinding: ${error.message}`);
  return data as { id: string; title: string };
}
