import { Bug, Target, Zap, CalendarDays, CreditCard, Gamepad2, Globe, Home } from 'lucide-react';

// ─── SHARED ───────────────────────────────────────────────────────

export const testTypes = [
  { name: 'Bug Hunt', icon: Bug, desc: 'Crowdsourced defect discovery with real users across real devices.', color: 'red' },
  { name: 'Usability Study', icon: Target, desc: 'Recorded sessions capturing how users actually navigate your product.', color: 'violet' },
  { name: 'Load Test', icon: Zap, desc: 'Live concurrent user sessions to stress-test your infrastructure.', color: 'yellow' },
  { name: 'Multi-Day Study', icon: CalendarDays, desc: 'Longitudinal feedback collected over days or weeks of real usage.', color: 'blue' },
  { name: 'Fintech & Payments', icon: CreditCard, desc: 'Structured testing for payment and checkout flows across fintech apps.', color: 'green' },
  { name: 'Game Playtesting', icon: Gamepad2, desc: 'Multiplayer, balance, and performance testing by real gamers.', color: 'purple' },
  { name: 'Global QA', icon: Globe, desc: 'Manual testing with localized testers in the markets you target.', color: 'cyan' },
  { name: 'In-Home Usage', icon: Home, desc: 'Field testing for physical or location-dependent digital products.', color: 'orange' },
];

export const pricingPlans = [
  {
    name: 'Starter',
    price: 299,
    period: 'month',
    tagline: 'Perfect for early-stage products',
    features: [
      'Up to 3 active tests',
      '50 tester slots per test',
      'Bug Hunt & Usability templates',
      'Email support',
      'Standard tester pool',
    ],
    cta: 'Request access',
    highlighted: false,
  },
  {
    name: 'Professional',
    price: 899,
    period: 'month',
    tagline: 'For growing teams shipping fast',
    features: [
      'Unlimited active tests',
      '200 tester slots per test',
      'All test types & templates',
      'Priority support + test planning',
      'Advanced tester targeting',
      'Team collaboration (5 seats)',
    ],
    cta: 'Request access',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: null,
    period: null,
    tagline: 'Custom solutions for large teams',
    features: [
      'Unlimited everything',
      'Dedicated account manager',
      'Fully managed test execution',
      'Custom tester panels',
      'SLA guarantees',
    ],
    cta: 'Contact us',
    highlighted: false,
  },
];

// ─── ADMIN USERS DATA ─────────────────────────────────────────────

export const adminUsers = [
  { id: 'usr_comp_001', name: 'TechCorp Inc.', type: 'Company', email: 'admin@techcorp.io', plan: 'Enterprise', joined: '2026-01-15', status: 'Active', testsCreated: 42, testers: 312 },
  { id: 'usr_comp_002', name: 'PayFlow Systems', type: 'Company', email: 'contact@payflow.io', plan: 'Professional', joined: '2026-02-10', status: 'Active', testsCreated: 31, testers: 245 },
  { id: 'usr_comp_003', name: 'MedConnect Health', type: 'Company', email: 'tests@medconnect.io', plan: 'Enterprise', joined: '2026-01-28', status: 'Active', testsCreated: 28, testers: 198 },
  { id: 'usr_tester_001', name: 'Marcus Johnson', type: 'Tester', email: 'marcus@email.com', rating: 4.9, joined: '2025-11-12', status: 'Active', testsCompleted: 87, earnings: 4250 },
  { id: 'usr_tester_002', name: 'Sarah Chen', type: 'Tester', email: 'sarah.chen@email.com', rating: 4.8, joined: '2025-12-03', status: 'Active', testsCompleted: 62, earnings: 3120 },
  { id: 'usr_tester_003', name: 'James Wilson', type: 'Tester', email: 'j.wilson@email.com', rating: 4.7, joined: '2026-01-05', status: 'Active', testsCompleted: 45, earnings: 2340 },
  { id: 'usr_comp_004', name: 'PixelForge Studios', type: 'Company', email: 'qa@pixelforge.io', plan: 'Professional', joined: '2026-03-12', status: 'Active', testsCreated: 24, testers: 156 },
  { id: 'usr_tester_004', name: 'Emma Rodriguez', type: 'Tester', email: 'emma.r@email.com', rating: 4.6, joined: '2026-01-20', status: 'Inactive', testsCompleted: 12, earnings: 890 },
];

export const adminTests = [
  { id: 'NV-1044', name: 'E-Commerce Bug Hunt', company: 'TechCorp Inc.', type: 'Bug Hunt', status: 'Active', testers: 28, target: 30, issues: 12, critical: 2, launchDate: '2026-07-05', dueDate: '2026-07-18', progress: 93 },
  { id: 'NV-1043', name: 'Payment Gateway Integration', company: 'PayFlow Systems', type: 'Fintech', status: 'Active', testers: 20, target: 25, issues: 8, critical: 1, launchDate: '2026-07-08', dueDate: '2026-07-22', progress: 80 },
  { id: 'NV-1042', name: 'Mobile Dashboard Redesign', company: 'MedConnect Health', type: 'Usability', status: 'Active', testers: 15, target: 20, issues: 5, critical: 0, launchDate: '2026-07-10', dueDate: '2026-07-15', progress: 75 },
  { id: 'NV-1041', name: 'Crash on Checkout', company: 'TechCorp Inc.', type: 'Bug Hunt', status: 'Active', testers: 24, target: 30, issues: 47, critical: 3, launchDate: '2026-06-28', dueDate: '2026-07-10', progress: 80 },
  { id: 'NV-1040', name: 'Global Market Testing', company: 'PixelForge Studios', type: 'Global QA', status: 'In Progress', testers: 85, target: 100, issues: 34, critical: 2, launchDate: '2026-06-20', dueDate: '2026-07-25', progress: 85 },
  { id: 'NV-1020', name: 'Onboarding Study', company: 'TechCorp Inc.', type: 'Multi-Day', status: 'Completed', testers: 25, target: 25, issues: 19, critical: 0, launchDate: '2026-06-15', dueDate: '2026-06-28', progress: 100 },
  { id: 'NV-1015', name: 'Dashboard Redesign', company: 'MedConnect Health', type: 'Usability', status: 'Completed', testers: 20, target: 20, issues: 31, critical: 4, launchDate: '2026-06-01', dueDate: '2026-06-15', progress: 100 },
];

export const adminReportsData = {
  revenueByMonth: [
    { month: 'Jan', revenue: 218000, target: 200000 },
    { month: 'Feb', revenue: 234000, target: 220000 },
    { month: 'Mar', revenue: 247000, target: 240000 },
    { month: 'Apr', revenue: 259000, target: 260000 },
    { month: 'May', revenue: 271000, target: 270000 },
    { month: 'Jun', revenue: 284900, target: 280000 },
  ],
  testCompletionRate: [
    { week: 'W1', completion: 82 },
    { week: 'W2', completion: 85 },
    { week: 'W3', completion: 88 },
    { week: 'W4', completion: 91 },
  ],
  userSatisfaction: [
    { metric: 'Company Satisfaction', score: 4.6 },
    { metric: 'Tester Satisfaction', score: 4.8 },
    { metric: 'Platform UX', score: 4.5 },
    { metric: 'Support Quality', score: 4.7 },
  ],
  testTypeDistribution: [
    { name: 'Bug Hunt', value: 320, color: '#ef4444' },
    { name: 'Usability', value: 280, color: '#a78bfa' },
    { name: 'Load Test', value: 120, color: '#fbbf24' },
    { name: 'Other', value: 564, color: '#94a3b8' },
  ],
};

export const adminSecurityLog = [
  { id: 1, action: 'Admin Login', user: 'admin@nyvel.co', timestamp: '2026-07-14 14:32:10', ip: '192.168.1.100', status: 'Success' },
  { id: 2, action: 'User Role Changed', user: 'admin@nyvel.co', timestamp: '2026-07-14 13:15:44', ip: '192.168.1.100', status: 'Success', details: 'Upgraded TechCorp to Enterprise' },
  { id: 3, action: 'Failed Login Attempt', user: 'unknown@email.com', timestamp: '2026-07-14 12:48:22', ip: '203.45.89.12', status: 'Failed' },
  { id: 4, action: 'API Key Generated', user: 'admin@nyvel.co', timestamp: '2026-07-13 16:25:33', ip: '192.168.1.100', status: 'Success' },
  { id: 5, action: 'Data Export', user: 'sarah@techcorp.io', timestamp: '2026-07-13 11:42:15', ip: '198.72.45.108', status: 'Success', details: 'Exported test results' },
  { id: 6, action: 'Admin Login', user: 'admin@nyvel.co', timestamp: '2026-07-12 09:10:05', ip: '192.168.1.100', status: 'Success' },
];
