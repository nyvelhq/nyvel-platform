import React, { useCallback, useEffect, useState } from 'react';
import { Inbox, Mail, AlertTriangle, Building2, UserRound } from 'lucide-react';
import PlatformLayout from '../components/platform/PlatformLayout';
import Button from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import { supabase } from '../lib/supabaseClient';
import { useToast } from '../context/ToastContext';

const STATUS = {
  new: { label: 'New', color: 'warning' },
  contacted: { label: 'Contacted', color: 'brand' },
  approved: { label: 'Approved', color: 'success' },
  declined: { label: 'Declined', color: 'slate' },
};

const FILTERS = [
  { id: 'open', label: 'Needs reply' },
  { id: 'all', label: 'All' },
];

export default function AdminRequests() {
  const { addToast } = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [filter, setFilter] = useState('open');
  const [drafts, setDrafts] = useState({});
  const [savingId, setSavingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    const { data, error } = await supabase
      .from('access_requests')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('AdminRequests load:', error.message);
      setLoadError(error.message || 'Could not load requests.');
      setRows([]);
    } else {
      setRows(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const draftFor = (r) => drafts[r.id] || { status: r.status, note: r.admin_note || '' };
  const setDraft = (r, patch) => setDrafts((d) => ({ ...d, [r.id]: { ...draftFor(r), ...patch } }));

  const save = async (r) => {
    const d = draftFor(r);
    setSavingId(r.id);
    const { error } = await supabase
      .from('access_requests')
      .update({ status: d.status, admin_note: d.note.trim() || null })
      .eq('id', r.id);
    setSavingId(null);
    if (error) {
      addToast(error.message || 'Could not save.', 'error');
      return;
    }
    setDrafts((all) => {
      const { [r.id]: _, ...rest } = all;
      return rest;
    });
    addToast('Request updated', 'success');
    await load();
  };

  const visible = filter === 'open' ? rows.filter((r) => r.status === 'new' || r.status === 'contacted') : rows;
  const newCount = rows.filter((r) => r.status === 'new').length;

  return (
    <PlatformLayout title="Access Requests">
      <div className="p-4 sm:p-8 space-y-6 max-w-4xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {newCount} new · Approving doesn&apos;t create an account: invite the person from Supabase Auth,
            then set their role.
          </p>
          <div className="flex gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-800" role="group" aria-label="Show">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                aria-pressed={filter === f.id}
                onClick={() => setFilter(f.id)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap ${
                  filter === f.id
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="card p-10 text-center text-sm text-slate-500 dark:text-slate-400">Loading requests…</div>
        ) : loadError ? (
          <div className="card p-6 flex flex-col sm:flex-row sm:items-center gap-3" role="alert">
            <AlertTriangle size={18} className="text-error-500 flex-shrink-0" aria-hidden="true" />
            <p className="text-sm text-slate-700 dark:text-slate-300 flex-1">Couldn&apos;t load requests: {loadError}</p>
            <Button size="sm" variant="secondary" onClick={load}>Retry</Button>
          </div>
        ) : visible.length === 0 ? (
          <div className="card">
            <EmptyState
              icon={Inbox}
              title={filter === 'open' ? 'Nothing waiting for a reply' : 'No requests yet'}
              description="Requests from the Request access and Apply to test forms show up here."
            />
          </div>
        ) : (
          <ul className="space-y-4">
            {visible.map((r) => {
              const d = draftFor(r);
              const dirty = d.status !== r.status || (d.note.trim() || null) !== (r.admin_note || null);
              const badge = STATUS[r.status] || STATUS.new;
              const KindIcon = r.kind === 'company' ? Building2 : UserRound;
              return (
                <li key={r.id} className="card p-5 space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
                        <KindIcon size={15} aria-hidden="true" />
                        {r.name}
                        {r.company_name && <span className="font-normal text-slate-600 dark:text-slate-400">· {r.company_name}</span>}
                      </p>
                      <a href={`mailto:${r.email}`} className="inline-flex items-center gap-1 text-sm text-brand-600 dark:text-brand-400 hover:underline break-all">
                        <Mail size={13} aria-hidden="true" /> {r.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge label={r.kind === 'company' ? 'Company' : 'Tester'} color="slate" />
                      <Badge label={badge.label} color={badge.color} dot />
                    </div>
                  </div>

                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm">
                    {[
                      ['Website', r.website],
                      ['Country', r.country],
                      ['Devices', r.devices],
                      ['Received', new Date(r.created_at).toLocaleString()],
                    ].filter(([, v]) => v).map(([k, v]) => (
                      <div key={k} className="flex gap-2 min-w-0">
                        <dt className="text-slate-500 dark:text-slate-400">{k}:</dt>
                        <dd className="text-slate-700 dark:text-slate-300 break-words min-w-0">{v}</dd>
                      </div>
                    ))}
                  </dl>
                  {r.message && (
                    <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap border-l-2 border-slate-200 dark:border-slate-700 pl-3">
                      {r.message}
                    </p>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <label className="sr-only" htmlFor={`status-${r.id}`}>Status</label>
                    <select
                      id={`status-${r.id}`}
                      className="form-input sm:w-40"
                      value={d.status}
                      onChange={(e) => setDraft(r, { status: e.target.value })}
                    >
                      {Object.entries(STATUS).map(([id, s]) => (
                        <option key={id} value={id}>{s.label}</option>
                      ))}
                    </select>
                    <label className="sr-only" htmlFor={`note-${r.id}`}>Internal note</label>
                    <input
                      id={`note-${r.id}`}
                      className="form-input flex-1"
                      placeholder="Internal note (only admins see this)"
                      maxLength={2000}
                      value={d.note}
                      onChange={(e) => setDraft(r, { note: e.target.value })}
                    />
                    <Button size="sm" onClick={() => save(r)} disabled={!dirty} loading={savingId === r.id}>
                      Save
                    </Button>
                  </div>
                  {r.reviewed_at && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Last updated {new Date(r.reviewed_at).toLocaleString()}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </PlatformLayout>
  );
}
