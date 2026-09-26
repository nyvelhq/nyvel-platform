import { supabase } from './supabaseClient';

// public.tester_profiles (migration 0013) <-> the camelCase fields the app
// keeps on `user`. The display name lives on public.profiles, not here.
const FIELDS = [
  ['country', 'country'],
  ['city', 'city'],
  ['age', 'age_range'],
  ['occupation', 'occupation'],
  ['devices', 'devices'],
  ['osVersions', 'os_versions'],
  ['connection', 'connection'],
  ['skills', 'skills'],
  ['yearsExp', 'years_exp'],
  ['bio', 'bio'],
  ['linkedin', 'linkedin'],
];
const LIST_FIELDS = new Set(['devices', 'osVersions', 'skills']);

export const TESTER_PROFILE_KEYS = FIELDS.map(([key]) => key);

// A missing row means the tester hasn't finished onboarding yet.
export function rowToTesterProfile(row) {
  const profile = { profileComplete: Boolean(row?.completed_at) };
  FIELDS.forEach(([key, column]) => {
    const value = row?.[column];
    profile[key] = LIST_FIELDS.has(key) ? value || [] : value || '';
  });
  return profile;
}

// Only the keys present in `patch` are written. Blank text becomes null.
export function testerProfileToRow(userId, patch) {
  const row = { user_id: userId };
  FIELDS.forEach(([key, column]) => {
    if (!(key in patch)) return;
    const value = patch[key];
    if (LIST_FIELDS.has(key)) {
      row[column] = Array.isArray(value) ? value : [];
    } else {
      const text = typeof value === 'string' ? value.trim() : value;
      row[column] = text || null;
    }
  });
  // The server stamps the actual time (see guard_tester_profile).
  if (patch.profileComplete) row.completed_at = new Date().toISOString();
  return row;
}

export const hasTesterProfileFields = (patch) =>
  TESTER_PROFILE_KEYS.some((key) => key in patch) || 'profileComplete' in patch;

// Returns { profile, error }. Never throws.
export async function loadTesterProfile(userId) {
  const { data, error } = await supabase
    .from('tester_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) return { profile: null, error };
  return { profile: rowToTesterProfile(data), error: null };
}

export async function saveTesterProfile(userId, patch) {
  const { error } = await supabase
    .from('tester_profiles')
    .upsert(testerProfileToRow(userId, patch), { onConflict: 'user_id' });
  return { error };
}

// Work-relevant fields of the testers who applied to a company's test,
// keyed by tester id. Returns {} on error so the applicant list still renders.
export async function loadApplicantProfiles(testId) {
  const { data, error } = await supabase.rpc('applicant_profiles', { p_test_id: testId });
  if (error) {
    console.error('loadApplicantProfiles:', error.message);
    return {};
  }
  return Object.fromEntries(
    (data || []).map((row) => [
      row.tester_id,
      {
        country: row.country || '',
        devices: [...(row.devices || []), ...(row.os_versions || [])],
        connection: row.connection || '',
        skills: row.skills || [],
        yearsExp: row.years_exp || '',
        bio: row.bio || '',
      },
    ])
  );
}
