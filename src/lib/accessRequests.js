import { supabase } from './supabaseClient';

export const EMPTY_REQUEST = {
  name: '',
  email: '',
  companyName: '',
  website: '',
  country: '',
  devices: '',
  message: '',
  // Honeypot: hidden from people, filled in by naive bots.
  nickname: '',
};

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

// Mirrors the CHECK constraints in migration 0012 so people see errors
// before submitting; the database enforces them regardless.
export function validateAccessRequest(kind, form) {
  const errors = {};
  if (!form.name.trim()) errors.name = 'Enter your name.';
  else if (form.name.trim().length > 120) errors.name = 'Keep your name under 120 characters.';
  if (!EMAIL_RE.test(form.email.trim())) errors.email = 'Enter a valid email address.';
  if (kind === 'company' && !form.companyName.trim()) errors.companyName = 'Enter your company name.';
  if (form.message.length > 2000) errors.message = 'Keep this under 2000 characters.';
  if (form.devices.length > 500) errors.devices = 'Keep this under 500 characters.';
  return errors;
}

const orNull = (v) => (v && v.trim() ? v.trim() : null);

export async function submitAccessRequest(kind, form) {
  if (form.nickname) return { error: null };

  const row = {
    kind,
    name: form.name.trim(),
    email: form.email.trim(),
    message: orNull(form.message),
    ...(kind === 'company'
      ? { company_name: orNull(form.companyName), website: orNull(form.website) }
      : { country: orNull(form.country), devices: orNull(form.devices) }),
  };

  // No .select(): visitors may insert but not read requests back (RLS).
  const { error } = await supabase.from('access_requests').insert(row);
  return { error };
}
