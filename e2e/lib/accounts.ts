// Seeded once per run by global-setup. Passwords are local-only test values.
export type Role = 'admin' | 'company' | 'tester' | 'otherTester' | 'otherCompany';

export interface Account {
  role: Role;
  email: string;
  password: string;
  name: string;
  appRole: 'admin' | 'company' | 'tester';
  company?: string;
}

export const ACCOUNTS: Record<Role, Account> = {
  admin: { role: 'admin', email: 'admin@e2e.nyvel.test', password: 'E2e-admin-pass-1', name: 'Ada Admin', appRole: 'admin' },
  company: {
    role: 'company', email: 'dana@acme.e2e.nyvel.test', password: 'E2e-company-pass-1', name: 'Dana Company',
    appRole: 'company', company: 'Acme Health (e2e)',
  },
  otherCompany: {
    role: 'otherCompany', email: 'olu@globex.e2e.nyvel.test', password: 'E2e-company-pass-2', name: 'Olu Other',
    appRole: 'company', company: 'Globex (e2e)',
  },
  tester: { role: 'tester', email: 'tariq@e2e.nyvel.test', password: 'E2e-tester-pass-1', name: 'Tariq Tester', appRole: 'tester' },
  otherTester: { role: 'otherTester', email: 'mei@e2e.nyvel.test', password: 'E2e-tester-pass-2', name: 'Mei Other', appRole: 'tester' },
};

export const storageStatePath = (role: Role) => `.auth/${role}.json`;
