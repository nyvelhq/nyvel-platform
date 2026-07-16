import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Construction, ArrowLeft } from 'lucide-react';
import PlatformLayout from '../components/platform/PlatformLayout';
import Button from '../components/ui/Button';
import { useAuth } from '../App';

export default function ComingSoon({ title = 'Coming Soon' }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <PlatformLayout title={title}>
      <div className="flex flex-col items-center justify-center h-full min-h-[60vh] px-6 text-center animate-fade-up">
        <div className="w-16 h-16 rounded-2xl bg-brand-50 dark:bg-brand-950/40 border border-brand-100 dark:border-brand-800/50 flex items-center justify-center mb-6">
          <Construction size={28} className="text-brand-500 dark:text-brand-400" aria-hidden="true" />
        </div>
        <h2 className="font-display font-bold text-2xl text-slate-900 dark:text-slate-50 mb-2">
          {title} is on the way
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-8 leading-relaxed">
          This section is part of the full Nyvel platform roadmap and isn't included
          in the MVP build yet. Check back soon.
        </p>
        <Button
          variant="secondary"
          icon={<ArrowLeft size={16} />}
          onClick={() => navigate(`/${user?.role || 'company'}/dashboard`)}
        >
          Back to Dashboard
        </Button>
      </div>
    </PlatformLayout>
  );
}
