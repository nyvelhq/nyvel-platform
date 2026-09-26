import { execSync } from 'child_process';
import path from 'path';

export interface E2EEnv {
  apiUrl: string;
  anonKey: string;
  serviceRoleKey: string;
  dbUrl: string;
  baseURL: string;
  sitePassword: string;
}

let cached: E2EEnv | null = null;

/**
 * Connection details for the local e2e Supabase. CI can pass them as env
 * vars; locally they're read from `supabase status`, so nothing secret is
 * committed. Throws unless the target is local, so tests can never touch a
 * real project.
 */
export function e2eEnv(): E2EEnv {
  if (cached) return cached;
  let status: Record<string, string> = {};
  if (!process.env.E2E_API_URL || !process.env.E2E_SERVICE_ROLE_KEY || !process.env.E2E_ANON_KEY) {
    const out = execSync('npx supabase status -o env', { cwd: path.join(__dirname, '..'), encoding: 'utf8' });
    status = Object.fromEntries(
      out
        .split('\n')
        .map((line) => line.match(/^([A-Z_]+)="?(.*?)"?$/))
        .filter((m): m is RegExpMatchArray => Boolean(m))
        .map((m) => [m[1], m[2]])
    );
  }
  const env: E2EEnv = {
    apiUrl: process.env.E2E_API_URL || status.API_URL,
    anonKey: process.env.E2E_ANON_KEY || status.ANON_KEY,
    serviceRoleKey: process.env.E2E_SERVICE_ROLE_KEY || status.SERVICE_ROLE_KEY,
    dbUrl: process.env.E2E_DB_URL || status.DB_URL || 'postgresql://postgres:postgres@127.0.0.1:54322/postgres',
    baseURL: process.env.E2E_BASE_URL || 'http://127.0.0.1:4173',
    sitePassword: process.env.E2E_SITE_PASSWORD || 'e2e-gate',
  };
  for (const [key, value] of Object.entries(env)) {
    if (!value) throw new Error(`e2e: missing ${key}. Is the local Supabase running (npm run db:start)?`);
  }
  if (!/127\.0\.0\.1|localhost/.test(env.apiUrl) || !/127\.0\.0\.1|localhost/.test(env.dbUrl)) {
    throw new Error(`e2e: refusing to run against a non-local Supabase (${env.apiUrl}).`);
  }
  cached = env;
  return env;
}
