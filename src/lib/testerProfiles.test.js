import {
  rowToTesterProfile,
  testerProfileToRow,
  hasTesterProfileFields,
  loadApplicantProfiles,
  saveTesterProfile,
} from './testerProfiles';
import { supabase } from './supabaseClient';

jest.mock('./supabaseClient', () => ({ supabase: { from: jest.fn(), rpc: jest.fn() } }));

describe('rowToTesterProfile', () => {
  it('treats a missing row as an unfinished profile with empty fields', () => {
    const profile = rowToTesterProfile(null);
    expect(profile.profileComplete).toBe(false);
    expect(profile.skills).toEqual([]);
    expect(profile.bio).toBe('');
  });

  it('maps columns to the app field names', () => {
    const profile = rowToTesterProfile({
      completed_at: '2026-09-26T00:00:00Z', age_range: '25-34', os_versions: ['iOS 17'], years_exp: '1-3 years',
    });
    expect(profile).toMatchObject({ profileComplete: true, age: '25-34', osVersions: ['iOS 17'], yearsExp: '1-3 years' });
  });
});

describe('testerProfileToRow', () => {
  it('writes only the fields in the patch, trimming text and nulling blanks', () => {
    expect(testerProfileToRow('u1', { bio: '  Hi  ', linkedin: '   ' })).toEqual({ user_id: 'u1', bio: 'Hi', linkedin: null });
  });

  it('marks completion and maps list fields', () => {
    const row = testerProfileToRow('u1', { profileComplete: true, osVersions: ['Android 14'], name: 'Not a column' });
    expect(row.os_versions).toEqual(['Android 14']);
    expect(row.completed_at).toEqual(expect.any(String));
    expect(row).not.toHaveProperty('name');
  });
});

it('hasTesterProfileFields ignores name-only patches', () => {
  expect(hasTesterProfileFields({ name: 'A' })).toBe(false);
  expect(hasTesterProfileFields({ bio: '' })).toBe(true);
});

it('saveTesterProfile upserts on user_id', async () => {
  const upsert = jest.fn(() => Promise.resolve({ error: null }));
  supabase.from.mockImplementation(() => ({ upsert }));
  await expect(saveTesterProfile('u1', { skills: ['Gaming'] })).resolves.toEqual({ error: null });
  expect(supabase.from).toHaveBeenCalledWith('tester_profiles');
  expect(upsert).toHaveBeenCalledWith({ user_id: 'u1', skills: ['Gaming'] }, { onConflict: 'user_id' });
});

describe('loadApplicantProfiles', () => {
  it('keys profiles by tester and merges devices with OS versions', async () => {
    supabase.rpc.mockImplementation(() =>
      Promise.resolve({ data: [{ tester_id: 't1', devices: ['iPhone'], os_versions: ['iOS 17'], skills: ['Fintech'] }], error: null })
    );
    const profiles = await loadApplicantProfiles('test-1');
    expect(supabase.rpc).toHaveBeenCalledWith('applicant_profiles', { p_test_id: 'test-1' });
    expect(profiles.t1).toMatchObject({ devices: ['iPhone', 'iOS 17'], skills: ['Fintech'], country: '' });
  });

  it('returns an empty map on error so the applicant list still renders', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    supabase.rpc.mockImplementation(() => Promise.resolve({ data: null, error: { message: 'boom' } }));
    await expect(loadApplicantProfiles('test-1')).resolves.toEqual({});
  });
});
