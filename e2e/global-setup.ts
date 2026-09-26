import { resetDatabase, seedAccounts } from './lib/db';
import { e2eEnv } from './lib/env';

/** Fresh, known state for every run: empty tables, the five seed accounts. */
export default async function globalSetup() {
  e2eEnv(); // fails fast unless pointed at a local Supabase
  resetDatabase();
  await seedAccounts();
}
