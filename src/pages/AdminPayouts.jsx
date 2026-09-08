import React, { useState, useEffect, useCallback } from 'react';
import { DollarSign, Wallet } from 'lucide-react';
import PlatformLayout from '../components/platform/PlatformLayout';
import Button from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import StatCard from '../components/ui/StatCard';
import { supabase } from '../lib/supabaseClient';
import { useAppData } from '../context/DataContext';

/**
 * AdminPayouts — C-06: admin marks a tester's flat per-test compensation as
 * paid once they have at least one ACCEPTED finding on that test. Per the BA
 * spec (US-07), payout amount aggregates per tester per test (not
 * per-finding), and a payout is append-only once paid — there is no
 * "unmark paid" here by design, matching the schema's own intent.
 *
 * C-07 (actual transactional email on payout) is deliberately out of scope
 * here — it needs a real email provider account/API key that hasn't been
 * set up. This page only records the payout, same as C-06 is scoped in the
 * backlog.
 */
export default function AdminPayouts() {
  const { markPayoutPaid } = useAppData();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingKey, setPayingKey] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);

    const [{ data: applications, error: appsError }, { data: findings, error: findingsError }, { data: payouts, error: payoutsError }] =
      await Promise.all([
        supabase
          .from('applications')
          .select(
            'test_id, tester_id, tests(title, compensation, clients(company_name)), profiles!tester_id(name, email)'
          )
          .eq('status', 'accepted'),
        supabase.from('findings').select('test_id, tester_id').eq('status', 'accepted'),
        supabase.from('payouts').select('test_id, tester_id, status, amount, paid_at'),
      ]);

    if (appsError) console.error('AdminPayouts load (applications):', appsError.message);
    if (findingsError) console.error('AdminPayouts load (findings):', findingsError.message);
    if (payoutsError) console.error('AdminPayouts load (payouts):', payoutsError.message);

    // Only tester+test pairs with at least one accepted finding are payable
    // at all — an accepted application alone isn't enough (BA spec: payout
    // is triggered by accepted findings, C-05 -> C-06).
    const acceptedFindingKeys = new Set((findings || []).map((f) => `${f.test_id}:${f.tester_id}`));
    const payoutByKey = new Map((payouts || []).map((p) => [`${p.test_id}:${p.tester_id}`, p]));

    const payable = (applications || [])
      .filter((a) => acceptedFindingKeys.has(`${a.test_id}:${a.tester_id}`))
      .map((a) => {
        const key = `${a.test_id}:${a.tester_id}`;
        const existingPayout = payoutByKey.get(key);
        const findingCount = (findings || []).filter(
          (f) => f.test_id === a.test_id && f.tester_id === a.tester_id
        ).length;
        return {
          key,
          testId: a.test_id,
          testerId: a.tester_id,
          testName: a.tests?.title || '—',
          company: a.tests?.clients?.company_name || '—',
          testerName: a.profiles?.name || 'Unnamed tester',
          testerEmail: a.profiles?.email || '',
          amount: Number(a.tests?.compensation) || 0,
          findingCount,
          status: existingPayout?.status || 'pending',
          paidAt: existingPayout?.paid_at || null,
        };
      });

    setRows(payable);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleMarkPaid = async (row) => {
    setPayingKey(row.key);
    const { error } = await markPayoutPaid({ testId: row.testId, testerId: row.testerId, amount: row.amount });
    setPayingKey(null);
    if (!error) await load();
  };

  const pending = rows.filter((r) => r.status === 'pending');
  const paid = rows.filter((r) => r.status === 'paid');
  const pendingTotal = pending.reduce((sum, r) => sum + r.amount, 0);
  const paidTotal = paid.reduce((sum, r) => sum + r.amount, 0);

  return (
    <PlatformLayout title="Payouts">
      <div className="p-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatCard
            label="Pending Payouts"
            value={pending.length}
            icon={Wallet}
            iconColor="warning"
            trendCaption={`$${pendingTotal.toLocaleString()} owed across ${pending.length} tester${pending.length === 1 ? '' : 's'}`}
          />
          <StatCard
            label="Paid Out"
            value={paid.length}
            icon={DollarSign}
            iconColor="success"
            trendCaption={`$${paidTotal.toLocaleString()} paid across ${paid.length} tester${paid.length === 1 ? '' : 's'}`}
          />
        </div>

        <div className="card p-0 overflow-hidden">
          <div className="p-4 border-b border-slate-200/60 dark:border-slate-700/50">
            <h2 className="font-display font-semibold text-slate-900 dark:text-slate-50">
              Payable Testers
              {rows.length > 0 && (
                <span className="text-slate-400 dark:text-slate-500 font-normal ml-1.5">({rows.length})</span>
              )}
            </h2>
          </div>

          {loading ? (
            <div className="p-10 text-center text-sm text-slate-400 dark:text-slate-500">Loading payouts…</div>
          ) : rows.length === 0 ? (
            <EmptyState
              icon={Wallet}
              title="No payable testers yet"
              description="Testers become payable once they have at least one accepted finding on a test."
            />
          ) : (
            <table className="w-full data-table">
              <thead>
                <tr>
                  <th>Tester</th>
                  <th>Test</th>
                  <th>Company</th>
                  <th>Accepted Findings</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.key} className="table-row-enter">
                    <td>
                      <div className="font-medium text-slate-800 dark:text-slate-200">{r.testerName}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{r.testerEmail}</div>
                    </td>
                    <td className="text-sm text-slate-700 dark:text-slate-300">{r.testName}</td>
                    <td className="text-sm text-slate-500 dark:text-slate-400">{r.company}</td>
                    <td className="text-sm text-slate-500 dark:text-slate-400 tabular-nums">{r.findingCount}</td>
                    <td className="font-semibold text-emerald-600 dark:text-emerald-400">${r.amount}</td>
                    <td>
                      {r.status === 'paid' ? (
                        <Badge label="Paid" color="success" dot />
                      ) : (
                        <Badge label="Pending" color="warning" dot />
                      )}
                      {r.paidAt && (
                        <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                          {r.paidAt.slice(0, 10)}
                        </div>
                      )}
                    </td>
                    <td>
                      {r.status === 'pending' ? (
                        <div className="flex justify-end">
                          <Button size="sm" variant="success" loading={payingKey === r.key} onClick={() => handleMarkPaid(r)}>
                            Mark Paid
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 dark:text-slate-500 block text-right">Paid</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </PlatformLayout>
  );
}
