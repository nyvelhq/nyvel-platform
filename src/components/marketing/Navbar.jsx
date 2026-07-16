import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X, ChevronDown } from 'lucide-react';
import Button from '../ui/Button';
import NyvelMark from '../ui/NyvelMark';
import { duration, ease, spring } from '../../motion/tokens';

const dropdownVariants = {
  hidden: { opacity: 0, y: -6, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: spring.snappy },
  exit: { opacity: 0, y: -6, scale: 0.98, transition: { duration: duration.fast, ease: ease.in } },
};

const mobileMenuVariants = {
  hidden: { opacity: 0, height: 0 },
  visible: { opacity: 1, height: 'auto', transition: { duration: duration.slow, ease: ease.out } },
  exit: { opacity: 0, height: 0, transition: { duration: duration.fast, ease: ease.in } },
};

const navLinks = [
  {
    label: 'Platform',
    href: '#features',
    sub: [
      { label: 'Overview', href: '#features' },
      { label: 'Bug Hunt', href: '#test-types' },
      { label: 'Usability Testing', href: '#test-types' },
      { label: 'Load Testing', href: '#test-types' },
      { label: 'Global QA', href: '#test-types' },
      { label: 'Fintech & Payments', href: '#test-types' },
      { label: 'Game Playtesting', href: '#test-types' },
    ],
  },
  { label: 'Use Cases', href: '#test-types' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Quality & Security', href: '#security' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openDrop, setOpenDrop] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-slate-950/95 backdrop-blur-md border-b border-white/10 py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <NyvelMark size={32} className="rounded-lg shadow-glow transition-transform group-hover:scale-105" />
            <span className="font-display font-bold text-white text-lg tracking-tight">
              Ny<span className="text-accent-400">vel</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <div
                key={link.label}
                className="relative"
                onMouseEnter={() => link.sub && setOpenDrop(link.label)}
                onMouseLeave={() => link.sub && setOpenDrop(null)}
              >
                {link.sub ? (
                  <>
                    <button
                      className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-300 hover:text-white rounded-lg hover:bg-white/5 transition-all"
                      aria-expanded={openDrop === link.label}
                      aria-haspopup="true"
                      onClick={() => setOpenDrop(openDrop === link.label ? null : link.label)}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') setOpenDrop(null);
                      }}
                    >
                      {link.label}
                      <ChevronDown size={14} className={`transition-transform ${openDrop === link.label ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence>
                      {openDrop === link.label && (
                        <motion.div
                          className="absolute top-full left-0 mt-1 w-64 bg-slate-900 border border-white/10 rounded-xl shadow-xl p-2 origin-top"
                          role="menu"
                          variants={dropdownVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                        >
                          {link.sub.map((s) => (
                            <a
                              key={s.label}
                              href={s.href}
                              role="menuitem"
                              className="block px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                              onClick={() => setOpenDrop(null)}
                            >
                              {s.label}
                            </a>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <a
                    href={link.href}
                    className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-white rounded-lg hover:bg-white/5 transition-all"
                  >
                    {link.label}
                  </a>
                )}
              </div>
            ))}
          </nav>

          {/* CTA Buttons - Different for different user types */}
          <div className="hidden md:flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-300 hover:text-white hover:bg-white/10"
              onClick={() => navigate('/login')}
            >
              Sign In
            </Button>
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => navigate('/login?role=tester')}
              className="text-slate-900"
            >
              Join as Tester
            </Button>
            <Button 
              size="sm" 
              onClick={() => navigate('/login?role=company')}
              className="bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-slate-900 font-bold shadow-md hover:shadow-lg transition-all"
            >
              Start Free
            </Button>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden text-white p-2 rounded-lg hover:bg-white/10"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="md:hidden bg-slate-950/98 border-t border-white/10 overflow-hidden"
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href || '#'}
                  className="block px-4 py-3 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
                <Button variant="ghost" className="w-full text-slate-300" onClick={() => navigate('/login')}>
                  Sign In
                </Button>
                <Button variant="secondary" className="w-full text-slate-900" onClick={() => navigate('/login?role=tester')}>
                  Join as Tester
                </Button>
                <Button
                  className="w-full bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-slate-900 font-bold"
                  onClick={() => navigate('/login?role=company')}
                >
                  Start Free
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
