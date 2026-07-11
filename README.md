# Nyvel — Beta Testing Platform MVP

A full-stack MVP for the Nyvel beta testing platform: real human testing guided by a
professional QA team. Includes a marketing landing site and multi-role platform UI for
companies, testers, and admins.

---

## Quick Start

### Prerequisites
- Node.js 16+ and npm

### 1. Install dependencies

```bash
cd nyvel-platform
npm install
```

### 2. Start the dev server

```bash
npm start
```

Opens at **http://localhost:3000**

---

## Demo Login

Visit `/login` (or click **Get Started** from the landing page).

Use **any email and password** — pick a role:

| Role | Access |
|------|--------|
| 🏢 **Company** | Dashboard, Create Test wizard, test table with charts |
| 👤 **Tester** | Dashboard, Available Tests, My Applications, Earnings, Profile |
| 🛡️ **Admin** | Platform analytics, activity feed, top companies, growth charts |

> **Demo tip:** Once logged in, use the **role switcher** at the bottom of the sidebar to switch between Company, Tester, and Admin views without logging out.
>
> **Note:** Dashboard figures are illustrative placeholder data for the MVP, not real platform metrics.

---

## Project Structure

```
src/
├── App.js                    # Router, AuthContext, protected routes
├── index.css                 # Tailwind + custom design tokens
├── data/
│   └── mockData.js           # All mock/demo data for every view
├── components/
│   ├── ui/
│   │   ├── Button.jsx        # Multi-variant button (primary/secondary/ghost/etc.)
│   │   ├── Badge.jsx         # Status, type, severity badges
│   │   └── StatCard.jsx      # Dashboard metric cards with trend indicators
│   ├── marketing/
│   │   ├── Navbar.jsx        # Fixed scroll-aware nav with dropdown
│   │   ├── Hero.jsx          # Ticker (demo), gradient text, value props, dual CTAs
│   │   ├── Features.jsx      # 6-feature grid
│   │   ├── HowItWorks.jsx    # Tabbed company/tester flow
│   │   ├── Pricing.jsx       # 3-tier pricing with highlighted plan
│   │   ├── Testimonials.jsx  # Illustrative use-case cards (no fabricated endorsements)
│   │   └── Footer.jsx        # Full link footer
│   └── platform/
│       └── PlatformLayout.jsx # Sidebar + header shell, role switcher
└── pages/
    ├── LandingPage.jsx       # Marketing site (all sections)
    ├── LoginPage.jsx         # Split-panel login with role selector
    ├── CompanyDashboard.jsx  # Stats, charts, test table
    ├── CreateTest.jsx        # 3-step wizard: details → criteria → launch
    ├── TesterDashboard.jsx   # Tests, applications, earnings tab
    ├── TesterOnboarding.jsx  # 4-step profile setup
    ├── TesterProfile.jsx     # Profile with skills, devices, history
    └── AdminDashboard.jsx    # Platform analytics, activity, companies
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + Create React App |
| Routing | React Router v6 |
| Styling | Tailwind CSS v3 |
| Charts | Recharts |
| Icons | Lucide React |
| Fonts | Space Grotesk + IBM Plex Sans + IBM Plex Mono (Google Fonts) |

---

## Design System — Nyvel

| Token | Value | Use |
|-------|-------|-----|
| `brand-500` | `#17A897` | Primary color (precision teal) |
| `brand-600` | `#0D8578` | Primary hover / solid surfaces |
| `accent-500` | `#F59E0B` | Secondary accent (signal amber / "gold standard") |
| `slate-950` | `#020617` | Dark hero / sidebar background |
| `slate-50` | `#F8FAFC` | Page background |
| Font Display | Space Grotesk | Headings, dashboard titles |
| Font Body | IBM Plex Sans | Body text, UI copy |
| Font Mono | IBM Plex Mono | IDs, code, ticker |

**Direction:** an engineered, precise identity for a QA/testing brand — teal for technical
trust, amber as the quality signal. All color/type decisions live in `tailwind.config.js`,
so the palette can be tuned in one place.

### Signature element
**Platform activity ticker** — the hero features a scrolling activity feed, labelled as an
illustrative demo preview until real platform activity is live.

---

## Production Build

```bash
npm run build
```

Outputs to `/build` — ready to deploy to Netlify, Vercel, or any static host.

---

## Next Steps (Beyond MVP)

- [ ] Connect to a real backend (Node.js + Fastify + Prisma + PostgreSQL)
- [ ] Add real authentication (replace demo sessionStorage auth)
- [ ] Wire footer legal links to real ToS / Privacy Policy / GDPR pages (pending legal foundation)
- [ ] Wire social links to the real Nyvel handles once claimed
- [ ] Implement test detail pages (`/company/tests/:id`)
- [ ] Add file/screen recording upload for testers
- [ ] Build notification system
- [ ] Add payments for tester payouts
- [ ] Replace illustrative use cases with real customer stories as the first cohort completes

---

## v1.4 — UI Craft & Accessibility Pass

**Design craft**
- ✅ New signature logomark (`NyvelMark`) — a "passing test in assertion brackets" glyph grounded in QA, replacing the generic gradient-square + Zap icon across nav, footer, login, and app shell
- ✅ Reduced gradient-text to a single deliberate accent per section (was applied to every headline + stat)
- ✅ Consistent elevation scale (`.card` / `.card-interactive`) applied across marketing + app surfaces

**Accessibility (WCAG 2.1 AA)**
- ✅ **Fixed reduced-motion bug**: hero content revealed from `opacity:0` would stay invisible when the OS requested reduced motion — now forced visible via a `prefers-reduced-motion` safeguard
- ✅ Focus rings now adapt ring-offset to light vs. dark surfaces (visible on the dark hero/footer)
- ✅ Raised idle footer-link contrast for AA compliance
- ✅ Removed false "clickable" affordance from non-interactive test-type cards

**Consistency**
- ✅ Cleaned stale `violet`/`cyan` palette defaults from `StatCard` and `Badge` so the teal/amber system is coherent on every dashboard (legacy aliases kept so nothing breaks)

## v1.3 — Nyvel Rebrand + Honesty QA Pass

**Rebrand**
- ✅ BlueTek → Nyvel across all UI, logo lockups, meta tags, manifest, storage keys, test IDs
- ✅ New palette: violet/cyan → precision teal (`#17A897`) + signal amber (`#F59E0B`)
- ✅ New type system: Plus Jakarta / Inter / JetBrains → Space Grotesk / IBM Plex Sans / IBM Plex Mono
- ✅ Admin/support identity updated to `@nyvel.co`

**Honesty pass — removed unverifiable / false public claims**
- ✅ Removed borrowed customer logos (Disney, McAfee, Xerox, Roku, HotJar, Typeform)
- ✅ Removed fabricated scale stats (400K+ testers, 200+ countries, 99.8%/98.2% success, 1,000+ companies)
- ✅ Removed false certification claims (SOC2 Type II, ISO 27001) — replaced with honest security-practices language (NDAs, encryption, GDPR/CCPA-aligned)
- ✅ Replaced fabricated named testimonials with clearly-illustrative use-case cards
- ✅ Neutralized real brand name (Stripe) in demo data; labelled hero ticker as a demo preview

**Accessibility & hygiene**
- ✅ Added accessible names to icon-only social links
- ✅ Normalized font weights to the loaded type range
- ✅ All 24 source files validated (JSX parse clean); package.json + manifest.json valid

## v1.1 — QA Fixes Applied
- ✅ All sidebar routes resolve (stub "Coming Soon" pages for unbuilt sections)
- ✅ Auth persists across page refresh (sessionStorage)
- ✅ Favicon, logo192/512, and manifest.json added — no console 404s
- ✅ Tester onboarding reachable via dashboard banner; completion state persisted
- ✅ Navbar dropdown: keyboard accessible, valid HTML, closes on selection/Escape
- ✅ User menu closes on outside click and Escape
- ✅ Empty states added for test tables/lists
