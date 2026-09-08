import React, { createContext, useContext, useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../App';

const DataContext = createContext(null);

export const useAppData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useAppData must be used within DataProvider');
  return ctx;
};

// ---------------------------------------------------------------------------
// DB status/severity enums -> the display labels the existing UI already
// knows how to color (see src/components/ui/Badge.jsx's statusColors).
// Keeping this translation in one place means CompanyTests/TesterDashboard/
// TesterProfile never have to know the raw DB strings.
// ---------------------------------------------------------------------------
const testDisplayStatus = (status) => {
  switch (status) {
    case 'draft':
      return 'Draft';
    case 'open':
    case 'in_review':
      return 'Active';
    case 'complete':
      return 'Completed';
    default:
      return status;
  }
};

// An application's own status only distinguishes pending/accepted/declined —
// "Completed" (a finished engagement) is really a property of the *test*,
// not the application, so it's derived by combining both.
const applicationDisplayStatus = (appStatus, testStatus) => {
  if (appStatus === 'declined') return 'Rejected';
  if (appStatus === 'pending') return 'Pending';
  // accepted
  return testStatus === 'complete' ? 'Completed' : 'Active';
};

const severityLabel = (s) => {
  if (!s) return null;
  return s.charAt(0).toUpperCase() + s.slice(1);
};
const SEVERITY_RANK = { critical: 4, high: 3, medium: 2, low: 1 };

// Coarse per-tester progress until real tracking (findings submitted vs.
// expected) exists — see F-09/loop-steps backlog. Not a precise metric,
// just enough for the progress bar's color/width to be non-fake.
const applicationProgress = (appStatus, testStatus) => {
  if (appStatus !== 'accepted') return 0;
  return testStatus === 'complete' ? 100 : 50;
};

export function DataProvider({ children }) {
  const { user, isAuthenticated } = useAuth();

  const [companyTests, setCompanyTests] = useState([]);
  const [availableTests, setAvailableTests] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  // --- company: tests owned by the signed-in company user's client ------
  const loadCompanyTests = useCallback(async () => {
    if (!user?.clientId) {
      setCompanyTests([]);
      return;
    }
    const { data: tests, error } = await supabase
      .from('tests')
      .select('*')
      .eq('client_id', user.clientId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('loadCompanyTests:', error.message);
      setCompanyTests([]);
      return;
    }
    if (!tests || tests.length === 0) {
      setCompanyTests([]);
      return;
    }

    const testIds = tests.map((t) => t.id);
    const [{ data: apps, error: appsError }, { data: findings, error: findingsError }] = await Promise.all([
      supabase.from('applications').select('test_id, status').in('test_id', testIds),
      supabase.from('findings').select('test_id, severity, status').in('test_id', testIds),
    ]);
    if (appsError) console.error('loadCompanyTests (applications):', appsError.message);
    if (findingsError) console.error('loadCompanyTests (findings):', findingsError.message);

    setCompanyTests(
      tests.map((t) => {
        const testApps = (apps || []).filter((a) => a.test_id === t.id);
        const acceptedFindings = (findings || []).filter((f) => f.test_id === t.id && f.status === 'accepted');
        const topSeverity = acceptedFindings.reduce(
          (top, f) => (SEVERITY_RANK[f.severity] > (SEVERITY_RANK[top] || 0) ? f.severity : top),
          null
        );

        return {
          id: t.id,
          name: t.title,
          type: t.test_type,
          status: testDisplayStatus(t.status),
          testers: testApps.filter((a) => a.status === 'accepted').length,
          target: t.target_tester_count,
          dueDate: t.end_date,
          issues: acceptedFindings.length,
          criticalIssues: acceptedFindings.filter((f) => f.severity === 'critical').length,
          severity: severityLabel(topSeverity),
          platform: t.platforms || [],
        };
      })
    );
  }, [user?.clientId]);

  // --- tester: tests open to apply to (any client, status = open/in_review) -
  const loadAvailableTests = useCallback(async () => {
    const { data: tests, error } = await supabase
      .from('tests')
      .select('*, clients(company_name)')
      .in('status', ['open', 'in_review'])
      .order('created_at', { ascending: false });

    if (error) {
      console.error('loadAvailableTests:', error.message);
      setAvailableTests([]);
      return;
    }
    if (!tests || tests.length === 0) {
      setAvailableTests([]);
      return;
    }

    const testIds = tests.map((t) => t.id);
    const { data: apps, error: appsError } = await supabase
      .from('applications')
      .select('test_id, status')
      .in('test_id', testIds);
    if (appsError) console.error('loadAvailableTests (applications):', appsError.message);

    setAvailableTests(
      tests.map((t) => {
        const accepted = (apps || []).filter((a) => a.test_id === t.id && a.status === 'accepted').length;
        return {
          id: t.id,
          name: t.title,
          company: t.clients?.company_name || '',
          type: t.test_type,
          compensation: Number(t.compensation) || 0,
          deadline: t.end_date,
          duration: null, // never collected by CreateTest.jsx — see migration notes
          slots: Math.max(0, (t.target_tester_count || 0) - accepted),
          slotsTotal: t.target_tester_count,
          platforms: t.platforms || [],
          tags: t.expertise || [],
          description: t.description,
        };
      })
    );
  }, []);

  // --- tester: this tester's own applications, joined with the test ------
  const loadMyApplications = useCallback(async () => {
    if (!user?.id || user.role !== 'tester') {
      setMyApplications([]);
      return;
    }
    const { data: apps, error } = await supabase
      .from('applications')
      .select('id, test_id, status, applied_at, tests(id, title, test_type, status, compensation, end_date, clients(company_name))')
      .eq('tester_id', user.id)
      .order('applied_at', { ascending: false });

    if (error) {
      console.error('loadMyApplications:', error.message);
      setMyApplications([]);
      return;
    }

    setMyApplications(
      (apps || [])
        .filter((a) => a.tests) // guard against a test the tester can no longer read (deleted, RLS)
        .map((a) => ({
          id: a.id,
          sourceTestId: a.test_id,
          testName: a.tests.title,
          company: a.tests.clients?.company_name || '',
          type: a.tests.test_type,
          appliedDate: a.applied_at ? a.applied_at.slice(0, 10) : '',
          status: applicationDisplayStatus(a.status, a.tests.status),
          compensation: Number(a.tests.compensation) || 0,
          dueDate: a.tests.end_date,
          progress: applicationProgress(a.status, a.tests.status),
        }))
    );
  }, [user?.id, user?.role]);

  const reloadAll = useCallback(async () => {
    setDataLoading(true);
    await Promise.all([loadCompanyTests(), loadAvailableTests(), loadMyApplications()]);
    setDataLoading(false);
  }, [loadCompanyTests, loadAvailableTests, loadMyApplications]);

  useEffect(() => {
    if (!isAuthenticated) {
      setCompanyTests([]);
      setAvailableTests([]);
      setMyApplications([]);
      setDataLoading(false);
      return;
    }
    reloadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.id, user?.clientId, user?.role]);

  // --- mutations -----------------------------------------------------------

  // Launches a real test row from CreateTest.jsx's wizard values. Inserted
  // directly as status 'open' (no separate draft-save step in the current
  // UI) — RLS requires the signed-in user to be 'company' and own client_id
  // to match (see migration 0002).
  const addCompanyTest = async (form) => {
    if (!user?.clientId) {
      return { error: new Error('No client_id on this account — cannot create a test.') };
    }
    const { data, error } = await supabase
      .from('tests')
      .insert({
        client_id: user.clientId,
        title: form.name,
        description: form.description || '',
        test_type: form.type,
        target_tester_count: form.testerCount,
        status: 'open',
        created_by: user.id,
        compensation: form.compensation || 0,
        start_date: form.startDate || null,
        end_date: form.endDate || null,
        platforms: form.platforms || [],
        expertise: form.expertise || [],
        age_range: form.ageRange || null,
        countries: form.countries || null,
        nda: form.nda !== undefined ? form.nda : true,
        briefing: form.briefing || '',
      })
      .select()
      .single();

    if (error) {
      console.error('addCompanyTest:', error.message);
      return { error };
    }
    await loadCompanyTests();
    return { error: null, test: data };
  };

  const hasApplied = (testId) => myApplications.some((a) => a.sourceTestId === testId);

  const applyToTest = async (test) => {
    if (!user?.id || hasApplied(test.id)) return { error: null };
    const { error } = await supabase.from('applications').insert({
      test_id: test.id,
      tester_id: user.id,
    });
    if (error) {
      console.error('applyToTest:', error.message);
      return { error };
    }
    await Promise.all([loadMyApplications(), loadAvailableTests()]);
    return { error: null };
  };

  // Company decides on a pending application (C-03). RLS requires the
  // signed-in user's client_id to match the application's test (see
  // migration 0003) — a company can only decide on applicants to its own
  // tests. Refreshes companyTests afterward so the "testers accepted"
  // count on My Tests/Dashboard stays in sync.
  const decideApplication = async (applicationId, decision) => {
    const { error } = await supabase
      .from('applications')
      .update({ status: decision, decided_by: user?.id, decided_at: new Date().toISOString() })
      .eq('id', applicationId);
    if (error) {
      console.error(`decideApplication (${decision}):`, error.message);
      return { error };
    }
    await loadCompanyTests();
    return { error: null };
  };
  const acceptApplication = (applicationId) => decideApplication(applicationId, 'accepted');
  const declineApplication = (applicationId) => decideApplication(applicationId, 'declined');

  // Tester submits a finding against a test they have an ACCEPTED
  // application for (C-04). RLS enforces the accepted-application gate
  // server-side (see schema.sql's "findings: accepted tester can submit")
  // so a rejected/pending tester's insert is refused there even if this
  // ever got called out of turn.
  const submitFinding = async ({ testId, title, description, severity }) => {
    if (!user?.id) return { error: new Error('Not signed in.') };
    const { data, error } = await supabase
      .from('findings')
      .insert({
        test_id: testId,
        tester_id: user.id,
        title,
        description,
        severity,
      })
      .select()
      .single();
    if (error) {
      console.error('submitFinding:', error.message);
      return { error };
    }
    return { error: null, finding: data };
  };

  // Company triages a submitted finding (C-05) — accept, reject, or ask for
  // more info. review_reason is required by the table's own CHECK
  // constraint for reject/more_info (see migration 0004), so the caller
  // must pass one for those two decisions. Refreshes companyTests
  // afterward so an accepted finding's severity/issue counts update on My
  // Tests/Dashboard the same way acceptApplication refreshes tester counts.
  const triageFinding = async (findingId, decision, reviewReason) => {
    const { error } = await supabase
      .from('findings')
      .update({
        status: decision,
        review_reason: reviewReason || null,
        reviewed_by: user?.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', findingId);
    if (error) {
      console.error(`triageFinding (${decision}):`, error.message);
      return { error };
    }
    await loadCompanyTests();
    return { error: null };
  };

  return (
    <DataContext.Provider
      value={{
        companyTests,
        addCompanyTest,
        availableTests,
        myApplications,
        applyToTest,
        hasApplied,
        acceptApplication,
        declineApplication,
        submitFinding,
        triageFinding,
        dataLoading,
        refreshData: reloadAll,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}
