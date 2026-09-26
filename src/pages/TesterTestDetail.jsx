import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileSearch, Send, FileLock2, ClipboardList } from 'lucide-react';
import { MAX_FINDINGS_PER_TEST, MAX_FINDING_TITLE, MAX_FINDING_DESCRIPTION } from '../lib/findingLimits';
import PlatformLayout from '../components/platform/PlatformLayout';
import Button from '../components/ui/Button';
import { Badge, TypeBadge, PriorityBadge } from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import { supabase } from '../lib/supabaseClient';
import { useAppData } from '../context/DataContext';
import { useAuth } from '../App';
import NdaModal from '../components/tester/NdaModal';

// A tester's raw application status (pending/accepted/declined) -> badge.
// Deliberately literal, same reasoning as CompanyTestDetail's decisionBadge.
const applicationStatusBadge = {
  pending: { label: 'Application Pending', color: 'warning' },
  accepted: { label: 'Application Accepted', color: 'success' },
  declined: { label: 'Application Declined', color: 'error' },
};

// A finding's raw DB status -> badge. 'info' isn't a valid Badge color, so
// more_info reuses 'brand' rather than adding a new color to the system.
const findingStatusBadge = {
  open: { label: 'Pending Review', color: 'warning' },
  accepted: { label: 'Accepted', color: 'success' },
  rejected: { label: 'Rejected', color: 'error' },
  more_info: { label: 'More Info Needed', color: 'brand' },
};

const SEVERITY_OPTIONS = ['low', 'medium', 'high', 'critical'];

/**
 * TesterTestDetail — C-04: view a test's detail and, once accepted onto it,
 * submit findings. Replaces the ComingSoon placeholder at /tester/tests/:id.
 * Both "Available Tests" cards and "My Applications" rows land here (see
 * TesterDashboard.jsx) — the test and the tester's own application/findings
 * for it are all fetched page-local, same pattern as CompanyTestDetail.
 */
export default function TesterTestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { applyToTest, submitFinding, respondToFinding } = useAppData();

  const [test, setTest] = useState(null);
  const [application, setApplication] = useState(null); // {id, status} or null
  const [findings, setFindings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState('');
  const [ndaOpen, setNdaOpen] = useState(false);
  const [briefing, setBriefing] = useState(null);
  const [replyDrafts, setReplyDrafts] = useState({});
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyError, setReplyError] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', severity: 'medium' });
  const [formError, setFormError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: testRow, error: testError }, { data: appRow, error: appError }, { data: findingRows, error: findingError }] =
      await Promise.all([
        supabase.from('tests').select('*, clients(company_name)').eq('id', id).maybeSingle(),
        user?.id
          ? supabase.from('applications').select('*').eq('test_id', id).eq('tester_id', user.id).maybeSingle()
          : Promise.resolve({ data: null, error: null }),
        user?.id
          ? supabase
              .from('findings')
              .select('*')
              .eq('test_id', id)
              .eq('tester_id', user.id)
              .order('submitted_at', { ascending: false })
          : Promise.resolve({ data: [], error: null }),
      ]);

    if (testError) console.error('TesterTestDetail load (test):', testError.message);
    if (appError) console.error('TesterTestDetail load (application):', appError.message);
    if (findingError) console.error('TesterTestDetail load (findings):', findingError.message);

    setTest(testRow || null);
    setApplication(appRow || null);
    setFindings(findingRows || []);

    // RLS (migration 0007) only returns the briefing to accepted testers who
    // have accepted the NDA where one is required.
    if (appRow?.status === 'accepted') {
      const { data: briefingRow, error: briefingError } = await supabase
        .from('test_briefings').select('briefing').eq('test_id', id).maybeSingle();
      if (briefingError) console.error('TesterTestDetail load (briefing):', briefingError.message);
      setBriefing(briefingRow?.briefing || '');
    } else {
      setBriefing(null);
    }
    setLoading(false);
  }, [id, user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleApply = async (ndaVersion) => {
    if (!test) return { error: null };
    setApplying(true);
    setApplyError('');
    const { error } = await applyToTest({ id: test.id, nda: test.nda === true }, { ndaVersion });
    setApplying(false);
    if (error) {
      if (!ndaVersion) setApplyError(error.message || 'Could not apply to this test.');
      return { error };
    }
    setNdaOpen(false);
    await load();
    return { error: null };
  };

  const handleReply = async (findingId) => {
    const text = (replyDrafts[findingId] || '').trim();
    if (!text) {
      setReplyError((r) => ({ ...r, [findingId]: 'Write a reply first.' }));
      return;
    }
    setReplyingTo(findingId);
    const { error } = await respondToFinding(findingId, text);
    setReplyingTo(null);
    if (error) {
      setReplyError((r) => ({ ...r, [findingId]: error.message || 'Could not send your reply.' }));
      return;
    }
    setReplyDrafts((d) => ({ ...d, [findingId]: '' }));
    setReplyError((r) => ({ ...r, [findingId]: '' }));
    await load();
  };

  const handleSubmitFinding = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.title.trim() || !form.description.trim()) {
      setFormError('Title and description are both required.');
      return;
    }
    setSubmitting(true);
    const { error } = await submitFinding({
      testId: id,
      title: form.title.trim(),
      description: form.description.trim(),
      severity: form.severity,
    });
    setSubmitting(false);
    if (error) {
      setFormError(error.message || 'Could not submit that finding — try again.');
      return;
    }
    setForm({ title: '', description: '', severity: 'medium' });
    await load();
  };

  if (loading) {
    return (
      <PlatformLayout title="Test Details">
        <div className="p-10 text-center text-sm text-slate-500 dark:text-slate-400">Loading test…</div>
      </PlatformLayout>
    );
  }

  if (!test) {
    return (
      <PlatformLayout title="Test Details">
        <div className="p-2 sm:p-8">
          <EmptyState
            icon={FileSearch}
            title="Test not found"
            description="This test may no longer be available."
            actionLabel="Back to Dashboard"
            onAction={() => navigate('/tester/dashboard')}
          />
        </div>
      </PlatformLayout>
    );
  }

  const isAccepted = application?.status === 'accepted';
  const isComplete = test.status === 'complete';

  return (
    <PlatformLayout title={test.title}>
      <div className="p-2 sm:p-8 space-y-6 max-w-3xl mx-auto">
        <button
          onClick={() => navigate('/tester/dashboard')}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowLeft size={14} /> Back to Dashboard
        </button>

        <div className="card p-3 sm:p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-xl font-bold text-slate-900 dark:text-slate-50">{test.title}</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{test.clients?.company_name}</p>
            </div>
            {application && (
              <Badge
                label={(applicationStatusBadge[application.status] || {}).label}
                color={(applicationStatusBadge[application.status] || {}).color}
                dot
              />
            )}
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-1.5">Type: <TypeBadge type={test.test_type} /></div>
            <div>
              Compensation:{' '}
              <span className="font-medium text-emerald-700 dark:text-emerald-400">${Number(test.compensation) || 0}</span>
            </div>
            <div>
              Due: <span className="font-medium text-slate-900 dark:text-slate-100">{test.end_date || '—'}</span>
            </div>
          </div>
          {test.description && <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{test.description}</p>}

          {test.nda && (
            <p className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
              <FileLock2 size={14} aria-hidden="true" />
              {application?.nda_accepted_at
                ? `You accepted the tester NDA on ${new Date(application.nda_accepted_at).toLocaleDateString()}.`
                : 'This test requires accepting the tester NDA before you apply.'}
              <button onClick={() => setNdaOpen(true)} className="text-brand-600 dark:text-brand-400 font-medium hover:underline">
                {application ? 'View agreement' : 'Read it'}
              </button>
            </p>
          )}

          {!application && (
            <Button size="sm" loading={applying} onClick={() => (test.nda ? setNdaOpen(true) : handleApply())}>
              Apply Now
            </Button>
          )}
          {applyError && <p className="text-sm text-error-600 dark:text-error-400" role="alert">{applyError}</p>}
          {application?.status === 'pending' && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Your application is awaiting review from {test.clients?.company_name || 'the company'}.
            </p>
          )}
          {application?.status === 'declined' && (
            <p className="text-xs text-slate-500 dark:text-slate-400">This application was declined.</p>
          )}
        </div>

        {isAccepted && (
          <div className="card p-3 sm:p-6 space-y-2">
            <h2 className="flex items-center gap-2 font-display font-semibold text-slate-900 dark:text-slate-50">
              <ClipboardList size={16} aria-hidden="true" /> Briefing
            </h2>
            {briefing ? (
              <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{briefing}</p>
            ) : test.nda && !application?.nda_accepted_at ? (
              <p className="text-sm text-slate-600 dark:text-slate-400">
                This test requires an NDA, and your application was made before NDAs were recorded, so the briefing isn&apos;t available to you here.
              </p>
            ) : (
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {test.clients?.company_name || 'The company'} didn&apos;t add a briefing. Use the description above.
              </p>
            )}
          </div>
        )}

        {isAccepted && isComplete && (
          <div className="card p-3 sm:p-6">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              This test is complete, so it no longer accepts new findings. You can still reply to questions on
              your findings below.
            </p>
          </div>
        )}

        {isAccepted && !isComplete && (
          <div className="card p-3 sm:p-6 space-y-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-display font-semibold text-slate-900 dark:text-slate-50">Submit a Finding</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {findings.length} of {MAX_FINDINGS_PER_TEST} findings used
              </p>
            </div>
            {findings.length >= MAX_FINDINGS_PER_TEST ? (
              <p className="text-sm text-slate-600 dark:text-slate-400">
                You&apos;ve reached the limit of {MAX_FINDINGS_PER_TEST} findings for this test. Add details to one of
                your findings below if the company asks for more information.
              </p>
            ) : (
            <form onSubmit={handleSubmitFinding} className="space-y-4">
              <div>
                <label className="form-label" htmlFor="finding-title">Title</label>
                <input
                  id="finding-title"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Checkout button unresponsive on iOS Safari"
                  maxLength={MAX_FINDING_TITLE}
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                />
              </div>
              <div>
                <label className="form-label" htmlFor="finding-description">Description</label>
                <textarea
                  id="finding-description"
                  className="form-input min-h-[100px] resize-none"
                  placeholder="Steps to reproduce, expected vs. actual behavior, device/browser info..."
                  maxLength={MAX_FINDING_DESCRIPTION}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>
              <div>
                <label className="form-label" htmlFor="finding-severity">Severity</label>
                <select
                  id="finding-severity"
                  className="form-input"
                  value={form.severity}
                  onChange={(e) => setForm((f) => ({ ...f, severity: e.target.value }))}
                >
                  {SEVERITY_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              {formError && <p className="text-sm text-error-600 dark:text-error-400" role="alert">{formError}</p>}
              <Button type="submit" loading={submitting}>
                <Send size={14} className="mr-1.5" aria-hidden="true" /> Submit Finding
              </Button>
            </form>
            )}
          </div>
        )}

        <div className="card p-0 overflow-hidden">
          <div className="p-4 border-b border-slate-200/60 dark:border-slate-700/50">
            <h2 className="font-display font-semibold text-slate-900 dark:text-slate-50">
              Your Findings
              {findings.length > 0 && (
                <span className="text-slate-500 dark:text-slate-400 font-normal ml-1.5">({findings.length})</span>
              )}
            </h2>
          </div>
          {findings.length === 0 ? (
            <EmptyState
              icon={FileSearch}
              title="No findings submitted yet"
              description={
                isAccepted && isComplete
                  ? 'This test is complete.'
                  : isAccepted
                  ? 'Use the form above to submit your first finding for this test.'
                  : 'Findings can be submitted once your application is accepted.'
              }
            />
          ) : (
            <ul className="divide-y divide-slate-200/60 dark:divide-slate-700/50">
              {findings.map((f) => {
                const badge = findingStatusBadge[f.status] || findingStatusBadge.open;
                return (
                  <li key={f.id} className="p-4 space-y-1.5">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3">
                      <p className="font-medium text-slate-800 dark:text-slate-200 text-sm">{f.title}</p>
                      <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                        <PriorityBadge priority={f.severity.charAt(0).toUpperCase() + f.severity.slice(1)} />
                        <Badge label={badge.label} color={badge.color} dot />
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{f.description}</p>
                    {f.review_reason && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 italic mt-1">
                        {f.status === 'more_info' || f.tester_response ? 'Question from the company' : 'Reviewer note'}: {f.review_reason}
                      </p>
                    )}
                    {f.tester_response && f.status !== 'more_info' && (
                      <p className="text-xs text-slate-700 dark:text-slate-300 border-l-2 border-brand-400 pl-2 whitespace-pre-wrap">
                        <span className="font-semibold">Your reply:</span> {f.tester_response}
                      </p>
                    )}
                    {f.status === 'more_info' && (
                      <div className="pt-1 space-y-2">
                        <label className="sr-only" htmlFor={`reply-${f.id}`}>Reply to the company</label>
                        <textarea
                          id={`reply-${f.id}`}
                          rows={3}
                          maxLength={5000}
                          className="form-input text-sm resize-none"
                          placeholder="Answer the company's question…"
                          value={replyDrafts[f.id] || ''}
                          onChange={(e) => setReplyDrafts((d) => ({ ...d, [f.id]: e.target.value }))}
                        />
                        {replyError[f.id] && (
                          <p className="text-xs text-error-600 dark:text-error-400" role="alert">{replyError[f.id]}</p>
                        )}
                        <Button size="sm" loading={replyingTo === f.id} onClick={() => handleReply(f.id)}>
                          <Send size={13} className="mr-1.5" /> Send reply
                        </Button>
                      </div>
                    )}
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {f.submitted_at ? f.submitted_at.slice(0, 10) : ''}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
      <NdaModal
        open={ndaOpen}
        testName={test.title}
        onClose={() => setNdaOpen(false)}
        onAccept={application ? undefined : handleApply}
      />
    </PlatformLayout>
  );
}
