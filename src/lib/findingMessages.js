import { supabase } from './supabaseClient';

// finding_messages (migration 0015) for a set of findings, grouped by finding
// id and oldest first. Returns {} on error (e.g. the migration hasn't run), so
// pages fall back to the single question/reply stored on the finding.
export async function loadFindingMessages(findingIds) {
  if (!findingIds.length) return {};
  const { data, error } = await supabase
    .from('finding_messages')
    .select('id, finding_id, kind, body, created_at')
    .in('finding_id', findingIds)
    .order('created_at', { ascending: true });
  if (error) {
    console.error('loadFindingMessages:', error.message);
    return {};
  }
  return groupByFinding(data || []);
}

export function groupByFinding(rows) {
  const out = {};
  rows.forEach((m) => {
    (out[m.finding_id] = out[m.finding_id] || []).push(m);
  });
  return out;
}
