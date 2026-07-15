// ─── COMPANY MOCK DATA ────────────────────────────────────────────

export const companyStats = {
  activeTests: 4,
  totalTesters: 312,
  openIssues: 89,
  completionRate: 94,
  trends: {
    activeTests: +1,
    totalTesters: +23,
    openIssues: -12,
    completionRate: +2,
  },
};

export const companyTests = [
  {
    id: 'NV-1041',
    name: 'Mobile App v3.1 — Bug Hunt',
    type: 'Bug Hunt',
    status: 'Active',
    testers: 24,
    target: 30,
    dueDate: '2026-07-18',
    issues: 47,
    criticalIssues: 3,
    platform: ['iOS', 'Android'],
  },
  {
    id: 'NV-1038',
    name: 'Checkout Flow UX Study',
    type: 'Usability',
    status: 'Active',
    testers: 18,
    target: 20,
    dueDate: '2026-07-12',
    issues: 12,
    criticalIssues: 1,
    platform: ['Web'],
  },
  {
    id: 'NV-1035',
    name: 'API Load & Performance Test',
    type: 'Load Test',
    status: 'Active',
    testers: 100,
    target: 100,
    dueDate: '2026-07-10',
    issues: 3,
    criticalIssues: 0,
    platform: ['API'],
  },
  {
    id: 'NV-1029',
    name: 'Payment Gateway Integration',
    type: 'Fintech',
    status: 'Active',
    testers: 15,
    target: 20,
    dueDate: '2026-07-22',
    issues: 8,
    criticalIssues: 2,
    platform: ['Web', 'iOS', 'Android'],
  },
  {
    id: 'NV-1020',
    name: 'Onboarding Flow — Multi-Day Study',
    type: 'Multi-Day',
    status: 'Completed',
    testers: 25,
    target: 25,
    dueDate: '2026-06-28',
    issues: 19,
    criticalIssues: 0,
    platform: ['Web', 'Mobile'],
  },
  {
    id: 'NV-1015',
    name: 'Dashboard Redesign — Usability',
    type: 'Usability',
    status: 'Completed',
    testers: 20,
    target: 20,
    dueDate: '2026-06-15',
    issues: 31,
    criticalIssues: 4,
    platform: ['Web'],
  },
];

export const activityChartData = [
  { date: 'Jun 1', issues: 12, testers: 45 },
  { date: 'Jun 5', issues: 19, testers: 62 },
  { date: 'Jun 10', issues: 28, testers: 78 },
  { date: 'Jun 15', issues: 22, testers: 95 },
  { date: 'Jun 20', issues: 35, testers: 120 },
  { date: 'Jun 25', issues: 41, testers: 155 },
  { date: 'Jun 29', issues: 47, testers: 190 },
];

export const issuesBySeverity = [
  { name: 'Critical', value: 6, color: '#ef4444' },
  { name: 'High', value: 23, color: '#f97316' },
  { name: 'Medium', value: 38, color: '#f59e0b' },
  { name: 'Low', value: 22, color: '#6366f1' },
];

// ─── TESTER MOCK DATA ─────────────────────────────────────────────

export const testerStats = {
  activeTests: 2,
  completed: 127,
  totalEarned: 3842,
  pendingPayout: 145,
  trends: {
    activeTests: 0,
    completed: +5,
    totalEarned: +145,
    pendingPayout: 0,
  },
};

export const availableTests = [
  {
    id: 'NV-1044',
    name: 'E-Commerce App — End-to-End Test',
    company: 'ShopFast Inc.',
    type: 'Bug Hunt',
    compensation: 40,
    deadline: '2026-07-20',
    duration: '3–4 hours',
    slots: 8,
    slotsTotal: 25,
    platforms: ['iOS', 'Android'],
    tags: ['Mobile', 'E-Commerce', 'Payments'],
    description: 'Test the full shopping experience from browse to checkout. Focus on payment flows and order management.',
  },
  {
    id: 'NV-1043',
    name: 'SaaS Dashboard — UX Feedback',
    company: 'DataView Analytics',
    type: 'Usability',
    compensation: 55,
    deadline: '2026-07-18',
    duration: '1–2 hours',
    slots: 5,
    slotsTotal: 15,
    platforms: ['Web'],
    tags: ['SaaS', 'Dashboard', 'Analytics'],
    description: 'Provide usability feedback on our redesigned analytics dashboard. Session recorded via screen share.',
  },
  {
    id: 'NV-1042',
    name: 'Banking App — Security & Payment Flow',
    company: 'NeoBank Ltd.',
    type: 'Fintech',
    compensation: 75,
    deadline: '2026-07-25',
    duration: '2–3 hours',
    slots: 12,
    slotsTotal: 20,
    platforms: ['iOS', 'Android'],
    tags: ['Fintech', 'Security', 'Banking'],
    description: 'Certified fintech test. Real-environment bank transfers up to $1. NDA required.',
  },
  {
    id: 'NV-1040',
    name: 'Game Beta — Multiplayer Stress Test',
    company: 'PixelForge Studios',
    type: 'Game',
    compensation: 30,
    deadline: '2026-07-15',
    duration: '4–6 hours',
    slots: 47,
    slotsTotal: 100,
    platforms: ['PC', 'Mac'],
    tags: ['Gaming', 'Multiplayer', 'Performance'],
    description: 'Play and stress-test our upcoming multiplayer shooter. Report bugs, latency issues, and balance feedback.',
  },
];

export const myApplications = [
  {
    id: 'APP-901',
    testName: 'Healthcare App — Accessibility Audit',
    company: 'MedConnect',
    type: 'Accessibility',
    appliedDate: '2026-06-25',
    status: 'Active',
    compensation: 60,
    dueDate: '2026-07-08',
    progress: 65,
  },
  {
    id: 'APP-887',
    testName: 'AI Writing Tool — Multi-Day Study',
    company: 'WordSmith AI',
    type: 'Multi-Day',
    appliedDate: '2026-06-20',
    status: 'Active',
    compensation: 90,
    dueDate: '2026-07-10',
    progress: 40,
  },
  {
    id: 'APP-854',
    testName: 'Travel App — Global QA Test',
    company: 'WanderRoute',
    type: 'QA',
    appliedDate: '2026-06-10',
    status: 'Completed',
    compensation: 45,
    dueDate: '2026-06-22',
    progress: 100,
  },
];

export const earningsData = [
  { month: 'Jan', earned: 220 },
  { month: 'Feb', earned: 310 },
  { month: 'Mar', earned: 280 },
  { month: 'Apr', earned: 430 },
  { month: 'May', earned: 390 },
  { month: 'Jun', earned: 580 },
];

// ─── ADMIN MOCK DATA ──────────────────────────────────────────────

export const adminStats = {
  totalUsers: 412847,
  activeTests: 1284,
  monthlyRevenue: 284900,
  uptime: 99.97,
  trends: {
    totalUsers: '+3.2%',
    activeTests: '+12%',
    monthlyRevenue: '+8.4%',
    uptime: '0.00%',
  },
};

export const platformGrowthData = [
  { month: 'Jan', users: 342000, tests: 980, revenue: 218000 },
  { month: 'Feb', users: 356000, tests: 1020, revenue: 234000 },
  { month: 'Mar', users: 371000, tests: 1080, revenue: 247000 },
  { month: 'Apr', users: 385000, tests: 1140, revenue: 259000 },
  { month: 'May', users: 398000, tests: 1210, revenue: 271000 },
  { month: 'Jun', users: 412847, tests: 1284, revenue: 284900 },
];

export const recentPlatformActivity = [
  { id: 1, event: 'New company registered', detail: 'PayServe Inc. joined as Enterprise', time: '2 min ago', type: 'company' },
  { id: 2, event: 'Test launched', detail: 'NV-1044: E-Commerce Bug Hunt (25 slots)', time: '8 min ago', type: 'test' },
  { id: 3, event: 'Payout processed', detail: '$4,200 disbursed to 84 testers', time: '15 min ago', type: 'payment' },
  { id: 4, event: 'Critical bug reported', detail: 'NV-1041: Crash on checkout — iOS 17', time: '23 min ago', type: 'alert' },
  { id: 5, event: 'Test completed', detail: 'NV-1020: Onboarding Study — 98% satisfaction', time: '1 hr ago', type: 'test' },
  { id: 6, event: '500 new testers joined', detail: 'Primary source: referral campaign', time: '2 hr ago', type: 'tester' },
];

export const topCompanies = [
  { name: 'TechCorp Inc.', tests: 42, spend: 18400, plan: 'Enterprise' },
  { name: 'PayFlow Systems', tests: 31, spend: 14200, plan: 'Professional' },
  { name: 'MedConnect Health', tests: 28, spend: 12800, plan: 'Enterprise' },
  { name: 'PixelForge Studios', tests: 24, spend: 9400, plan: 'Professional' },
  { name: 'DataView Analytics', tests: 19, spend: 7200, plan: 'Starter' },
];

// ─── SHARED ───────────────────────────────────────────────────────

export const tickerItems = [
  '🟢 TechCorp launched Mobile Bug Hunt · 30 tester slots open',
  '🔵 @tester_jay found 3 critical bugs in PayFlow v2.1',
  '🟣 Nyvel verified payment flow for NeoBank — 0 issues',
  '⭐ MedConnect received 98% tester satisfaction score',
  '🚀 PixelForge Game Beta now live · 100 testers needed',
  '🔵 @tester_priya completed E-Commerce test · $45 earned',
  '🟢 WanderRoute launched Global QA Test in 42 countries',
  '✅ DataView dashboard redesign passed all usability tests',
];

export const testTypes = [
  { name: 'Bug Hunt', icon: '🐛', desc: 'Crowdsourced defect discovery with real users across real devices.', color: 'red' },
  { name: 'Usability Study', icon: '🎯', desc: 'Recorded sessions capturing how users actually navigate your product.', color: 'violet' },
  { name: 'Load Test', icon: '⚡', desc: 'Live concurrent user sessions to stress-test your infrastructure.', color: 'yellow' },
  { name: 'Multi-Day Study', icon: '📅', desc: 'Longitudinal feedback collected over days or weeks of real usage.', color: 'blue' },
  { name: 'Fintech & Payments', icon: '💳', desc: 'Non-sandbox payment testing with real-world financial flows.', color: 'green' },
  { name: 'Game Playtesting', icon: '🎮', desc: 'Multiplayer, balance, and performance testing by real gamers.', color: 'purple' },
  { name: 'Global QA', icon: '🌍', desc: 'Manual testing with localized testers in the markets you target.', color: 'cyan' },
  { name: 'In-Home Usage', icon: '🏠', desc: 'Field testing for physical or location-dependent digital products.', color: 'orange' },
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
      'CSV export',
    ],
    cta: 'Start Free Trial',
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
      'API access & webhooks',
      'Team collaboration (5 seats)',
    ],
    cta: 'Get Started',
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
      'SSO & advanced security',
      'SLA guarantees',
      'Custom integrations',
    ],
    cta: 'Talk to Sales',
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
