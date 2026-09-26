import { execFileSync } from 'child_process';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { e2eEnv } from './env';
import { ACCOUNTS, Account } from './accounts';

let admin: SupabaseClient | null = null;

/** Service-role client for setup and assertions. Bypasses RLS: never use it
 *  to act *as* a user in a test, only to arrange or inspect data. */
export function serviceClient(): SupabaseClient {
  if (!admin) {
    const env = e2eEnv();
    admin = createClient(env.apiUrl, env.serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
  }
  return admin;
}

/** Empties every app table and all auth users. Local database only. */
export function resetDatabase(): void {
  const sql = `
    truncate public.finding_messages, public.findings, public.payout_history, public.payouts,
             public.applications, public.test_briefings, public.tests, public.tester_profiles,
             public.access_requests, public.notifications restart identity cascade;
    update public.profiles set client_id = null;
    delete from public.clients;
    delete from auth.users;`;
  execFileSync('psql', [e2eEnv().dbUrl, '-X', '-q', '-v', 'ON_ERROR_STOP=1', '-c', sql], { stdio: 'pipe' });
}

async function ensureClient(companyName: string): Promise<string> {
  const db = serviceClient();
  const { data, error } = await db.from('clients').insert({ company_name: companyName }).select('id').single();
  if (error) throw new Error(`seed client ${companyName}: ${error.message}`);
  return data.id as string;
}

async function createAccount(account: Account): Promise<string> {
  const db = serviceClient();
  const { data, error } = await db.auth.admin.createUser({
    email: account.email,
    password: account.password,
    email_confirm: true,
  });
  if (error || !data.user) throw new Error(`seed user ${account.email}: ${error?.message}`);
  const id = data.user.id;
  const patch: Record<string, unknown> = { name: account.name, role: account.appRole };
  if (account.company) patch.client_id = await ensureClient(account.company);
  const { error: profileError } = await db.from('profiles').update(patch).eq('id', id);
  if (profileError) throw new Error(`seed profile ${account.email}: ${profileError.message}`);
  return id;
}

export async function seedAccounts(): Promise<Record<string, string>> {
  const ids: Record<string, string> = {};
  for (const account of Object.values(ACCOUNTS)) ids[account.role] = await createAccount(account);
  return ids;
}

export async function userId(email: string): Promise<string> {
  const { data, error } = await serviceClient().from('profiles').select('id').eq('email', email).single();
  if (error) throw new Error(`lookup ${email}: ${error.message}`);
  return data.id as string;
}

export async function clientIdFor(email: string): Promise<string> {
  const { data, error } = await serviceClient().from('profiles').select('client_id').eq('email', email).single();
  if (error || !data.client_id) throw new Error(`no company for ${email}`);
  return data.client_id as string;
}
