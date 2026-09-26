import React from 'react';
import { Shield, Award } from 'lucide-react';
import NyvelMark from '../ui/NyvelMark';

// Only links that go somewhere. Privacy Policy and Terms come back when
// those pages exist (Eben-owned, see docs/agent/STATUS.md).
const footerSections = [
  {
    title: 'Platform',
    links: [
      { label: 'Test types', href: '#test-types' },
      { label: 'Features', href: '#features' },
      { label: 'How it works', href: '#how-it-works' },
      { label: 'Security', href: '#security' },
      { label: 'Pricing', href: '#pricing' },
    ],
  },
  {
    title: 'Get started',
    links: [
      { label: 'Request access', href: '/request-access' },
      { label: 'Apply to test', href: '/request-access?type=tester' },
      { label: 'Contact us', href: '/request-access' },
      { label: 'Sign in', href: '/login' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-5">
              <NyvelMark size={32} className="rounded-lg" />
              <span className="font-display font-bold text-white text-lg">
                Ny<span className="text-brand-400">vel</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
              The real human beta testing platform. Ship with confidence.
            </p>
          </div>

          {/* Link columns */}
          {footerSections.map((section) => (
            <nav key={section.title} aria-labelledby={`footer-${section.title.replace(" ", "-")}`}>
              <h2 id={`footer-${section.title.replace(" ", "-")}`} className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">
                {section.title}
              </h2>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-sm text-slate-300 hover:text-white transition-colors">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-400">
            © 2026 Nyvel Technologies, Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Shield size={12} className="text-brand-400" aria-hidden="true" />
              Encrypted &amp; access-controlled
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Award size={12} className="text-accent-400" aria-hidden="true" />
              GDPR &amp; CCPA-aligned
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
