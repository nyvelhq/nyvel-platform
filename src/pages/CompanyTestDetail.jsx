import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users } from 'lucide-react';
import PlatformLayout from '../components/platform/PlatformLayout';
import Button from '../components/ui/Button';
import { Badge, StatusBadge, TypeBadge } from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import { supabase } from '../lib/supabaseClient';
import { useAppData } from '../context/DataContext';

// Applicant decision -> badge. Deliberately literal (Pending/Accepted/
// Declined) rather than reusing DataContext's tester-facing status labels —
// this page is the company's decision record, not the tester's view of it.
const decisionBadge = {
  pending: { label: 'Pending', color: 'warning' },
  accepted: { label: 'Accepted', color: 'success' },
  declined: { label: 'Declined', color: 'error' },
};

/**
 * CompanyTestDetail — C-03: review and decide on testers who applied to one
 * of this company's tests. Replaces the ComingSoon placeholder that lived
 * at this route. The test summary comes from DataContext's already-loaded
 * companyTests; the applicant list is fetched directly here since it's not
 * needed anywhere else in the app.
 */
export default function CompanyTestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { companyTests, acceptApplication, declineApplication } = useAppData();
  const test = companyTests.find((t) => t.id === id);

  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actingOn, setActingOn] = useState(null);

  const loadApplicants = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('applications')
      .select('id, status, applied_at, tester_id, profiles(name, email)')
      .eq('test_id', id)
      .order('applied_at', { ascending: false });

    if (error) {
      console.error('loadApplicants:', error.message);
      setApplicants([]);
    } else {
      setApplicants(data || []);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    loadApplicants();
  }, [loadApplicants]);

  const handleDecision = async (applicationId, decision) => {
    setActingOn(applicationId);
    const act = decision === 'accepted' ? acceptApplication : declineApplication;
    const { error } = await act(applicationId);
    setActingOn(null);
    if (!error) await loadApplicants();
  };

  if (!test) {
    return (
      <PlatformLayout title="Test Details">
        <div className="p-8">
          <EmptyState
            icon={Users}
            title="Test not found"
            description="This test may not exist, or your tests are still loading — try going back and reopening it."
            actionLabel="Back to My Tests"
            onAction={() => navigate('/company/tests')}
          />
        </div>
      </PlatformLayout>
    );
  }

  const pendingCount = applicants.filter((a) => a.status === 'pending').length;

  return (
    <PlatformLayout title={test.name}>
      <div className="p-8 space-y-6 max-w-4xl">
        <button
          onClick={() => navigate('/company/tests')}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowLeft size={14} /> Back to My Tests
        </button>

        <div className="card p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-xl font-bold text-slate-900 dark:text-slate-50">{test.name}</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1">{test.id}</p>
            </div>
            <StatusBadge status={test.status} />
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-1.5">Type: <TypeBadge type={test.type} /></div>
            <div>
              Testers:{' '}
              <span className="font-medium text-slate-900 dark:text-slate-100 tabular-nums">
                {test.testers}/{test.target}
              </span>
            </div>
            <div>
              Due: <span className="font-medium text-slate-900 dark:text-slate-100">{test.dueDate || '—'}</span>
            </div>
          </div>
        </div>

        <div className="card p-0 overflow-hidden">
          <div className="p-4 border-b border-slate-200/60 dark:border-slate-700/50 flex items-center justify-between">
            <h2 className="font-display font-semibold text-slate-900 dark:text-slate-50">
              Applicants
              {applicants.length > 0 && (
                <span className="text-slate-400 dark:text-slate-500 font-normal ml-1.5">({applicants.length})</span>
              )}
            </h2>
            {pendingCount > 0 && (
              <span className="text-xs text-warning-600 dark:text-warning-400 font-medium">
                {pendingCount} awaiting review
              </span>
            )}
          </div>

          {loading ? (
            <div className="p-10 text-center text-sm text-slate-400 dark:text-slate-500">Loading applicants…</div>
          ) : applicants.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No applicants yet"
              description="Testers who apply to this test will show up here for you to review."
            />
          ) : (
            <table className="w-full data-table">
              <thead>
                <tr>
                  <th>Tester</th>
                  <th>Applied</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {applicants.map((a) => {
                  const badge = decisionBadge[a.status] || decisionBadge.pending;
                  return (
                    <tr key={a.id} className="table-row-enter">
                      <td>
                        <div className="font-medium text-slate-800 dark:text-slate-200">
                          {a.profiles?.name || 'Unnamed tester'}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{a.profiles?.email}</div>
                      </td>
                      <td className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {a.applied_at ? a.applied_at.slice(0, 10) : ''}
                      </td>
                      <td>
                        <Badge label={badge.label} color={badge.color} dot />
                      </td>
                      <td>
                        {a.status === 'pending' ? (
                          <div className="flex gap-2 justify-end">
                            <Button
                              size="sm"
                              variant="danger"
                              loading={actingOn === a.id}
                              onClick={() => handleDecision(a.id, 'declined')}
                            >
                              Decline
                            </Button>
                            <Button
                              size="sm"
                              variant="success"
                              loading={actingOn === a.id}
                              onClick={() => handleDecision(a.id, 'accepted')}
                            >
                              Accept
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 dark:text-slate-500 block text-right">Decided</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </PlatformLayout>
  );
}
