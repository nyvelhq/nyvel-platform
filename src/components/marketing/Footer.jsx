import React from 'react';
import { Link } from 'react-router-dom';
import { Twitter, Linkedin, Github, Shield, Award } from 'lucide-react';
import NyvelMark from '../ui/NyvelMark';

const footerSections = [
  {
    title: 'Platform',
    links: [
      { label: 'How It Works', href: '#how-it-works' },
      { label: 'Bug Hunt', href: '#' },
      { label: 'Usability Testing', href: '#' },
      { label: 'Global QA', href: '#' },
      { label: 'Load Testing', href: '#' },
      { label: 'Fintech & Payments', href: '#' },
      { label: 'Game Playtesting', href: '#' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Nyvel', href: '#' },
      { label: 'Case Studies', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Contact Us', href: '#' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', href: '#' },
      { label: 'API Reference', href: '#' },
      { label: 'Help Center', href: '#' },
      { label: 'Join as Tester', href: '/login' },
      { label: 'Status', href: '#' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms of Service', href: '#' },
      { label: 'GDPR', href: '#' },
      { label: 'Security', href: '#' },
      { label: 'Cookie Policy', href: '#' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Top: logo + links */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-5">
              <NyvelMark size={32} className="rounded-lg" />
              <span className="font-display font-bold text-white text-lg">
                Ny<span className="text-brand-400">vel</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              The real human beta testing platform. Ship with confidence.
            </p>
            <div className="flex gap-3">
              {[
                { Icon: Twitter, label: 'Nyvel on X' },
                { Icon: Linkedin, label: 'Nyvel on LinkedIn' },
                { Icon: Github, label: 'Nyvel on GitHub' },
              ].map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">
                {section.title}
              </h4>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      onClick={link.href === '#' ? (e) => e.preventDefault() : undefined}
                      className="text-sm text-slate-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            © 2026 Nyvel Technologies, Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Shield size={12} className="text-brand-400" />
              Encrypted &amp; NDA-protected
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Award size={12} className="text-accent-400" />
              GDPR &amp; CCPA-aligned
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
