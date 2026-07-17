import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowUpDown, Plus, FlaskConical, ChevronRight } from 'lucide-react';
import PlatformLayout from '../components/platform/PlatformLayout';
import Button from '../components/ui/Button';
import { StatusBadge, TypeBadge, SeverityBadge } from '../components/ui/Badge';
import SegmentedControl from '../components/ui/SegmentedControl';
import Pagination from '../components/ui/Pagination';
import EmptyState from '../components/ui/EmptyState';
import TableScrollArea from '../components/ui/TableScrollArea';
import { SkeletonTable } from '../components/ui/Skeleton';
import ScrollReveal from '../components/ScrollReveal';
import TestDetailDrawer from '../components/company/TestDetailDrawer';
import { useAppData } from '../context/DataContext';

const statusOptions = [
  { value: 'all', label: 'All' },
  { value: 'Active', label: 'Active' },
  { value: 'Completed', label: 'Completed' },
];

const DEFAULT_PAGE_SIZE = 8;

function SortHeader({ label, sortKey, activeKey, onSort }) {
  return (
    <button
      onClick={() => onSort(sortKey)}
      className="inline-flex items-center gap-1 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
    >
      {label}
      <ArrowUpDown
        size={12}
        className={activeKey === sortKey ? 'text-brand-500' : 'text-slate-300 dark:text-slate-600'}
      />
    </button>
  );
}

export default function CompanyTests() {
  const navigate = useNavigate();
  const { companyTests } = useAppData();
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortKey, setSortKey] = useState('dueDate');
  const [sortDir, setSortDir] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [detailTest, setDetailTest] = useState(null);

  // Brief skeleton on first mount only — perceived-performance cue, not a real fetch.
  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 450);
    return () => clearTimeout(t);
  }, []);

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setCurrentPage(1);
  };

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return companyTests.filter((t) => {
      const matchesTerm = !term || t.name.toLowerCase().includes(term) || t.id.toLowerCase().includes(term);
      const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
      return matchesTerm && matchesStatus;
    });
  }, [companyTests, searchTerm, statusFilter]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) => {
      let av = a[sortKey];
      let bv = b[sortKey];
      if (sortKey === 'dueDate') {
        av = new Date(av).getTime();
        bv = new Date(bv).getTime();
      }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return copy;
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paginated = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const activeCount = companyTests.filter((t) => t.status === 'Active').length;

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setCurrentPage(1);
  };

  return (
    <PlatformLayout title="My Tests">
      <div className="p-8 space-y-6">
        <ScrollReveal animation="fade-in-page">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-700/50">
            <div>
              <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-slate-50">My Tests</h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {companyTests.length} test{companyTests.length === 1 ? '' : 's'} · {activeCount} active
              </p>
            </div>
            <Button icon={<Plus size={16} />} onClick={() => navigate('/company/create-test')} size="lg">
              New Test
            </Button>
          </div>
        </ScrollReveal>

        {companyTests.length === 0 ? (
          <div className="card">
            <EmptyState
              icon={FlaskConical}
              title="No tests yet"
              description="Launch your first test to start collecting real-world feedback from vetted testers."
              actionLabel="Create Your First Test"
              onAction={() => navigate('/company/create-test')}
            />
          </div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
              <div className="relative w-full sm:w-72">
                <Search size={16} className="absolute left-1.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  placeholder="Search by name or ID..."
                  className="form-input pl-9 w-full"
                  aria-label="Search tests"
                />
              </div>
              <SegmentedControl
                options={statusOptions}
                value={statusFilter}
                onChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}
                ariaLabel="Filter by status"
              />
            </div>

            <div className="card overflow-hidden p-0">
              {isLoading ? (
                <SkeletonTable rows={6} columns={7} />
              ) : sorted.length === 0 ? (
                <EmptyState
                  icon={Search}
                  title="No tests match your filters"
                  description="Try a different search term or clear the status filter."
                  actionLabel="Clear filters"
                  onAction={clearFilters}
                  actionVariant="secondary"
                />
              ) : (
                <TableScrollArea>
                  <table className="w-full data-table">
                    <thead>
                      <tr>
                        <th>Test ID</th>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th><SortHeader label="Testers" sortKey="testers" activeKey={sortKey} onSort={toggleSort} /></th>
                        <th><SortHeader label="Issues" sortKey="issues" activeKey={sortKey} onSort={toggleSort} /></th>
                        <th><SortHeader label="Due Date" sortKey="dueDate" activeKey={sortKey} onSort={toggleSort} /></th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginated.map((test) => (
                        <tr
                          key={test.id}
                          className="table-row-enter cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40"
                          onClick={() => setDetailTest(test)}
                        >
                          <td>
                            <span className="font-mono text-xs text-slate-400 dark:text-slate-500">{test.id}</span>
                          </td>
                          <td>
                            <span className="font-medium text-slate-800 dark:text-slate-200">{test.name}</span>
                            <div className="flex gap-1 mt-1">
                              {test.platform.map((p) => (
                                <span key={p} className="text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded font-medium">
                                  {p}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td><TypeBadge type={test.type} /></td>
                          <td><StatusBadge status={test.status} /></td>
                          <td>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 w-16">
                                <div
                                  className="h-1.5 rounded-full bg-brand-500"
                                  style={{ width: `${test.target ? (test.testers / test.target) * 100 : 0}%` }}
                                />
                              </div>
                              <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap tabular-nums">
                                {test.testers}/{test.target}
                              </span>
                            </div>
                          </td>
                          <td><SeverityBadge count={test.issues} type="bugs" /></td>
                          <td className="text-slate-500 dark:text-slate-400 text-xs whitespace-nowrap tabular-nums">{test.dueDate}</td>
                          <td>
                            <ChevronRight size={16} className="text-slate-300 dark:text-slate-600" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </TableScrollArea>
              )}
            </div>

            {!isLoading && sorted.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                pageSize={pageSize}
                onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
                storageKey="companyTestsPageSize"
              />
            )}
          </>
        )}
      </div>

      <TestDetailDrawer test={detailTest} onClose={() => setDetailTest(null)} />
    </PlatformLayout>
  );
}
