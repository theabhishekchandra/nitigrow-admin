import React from 'react';
import './FeatureSpecPage.css';

// ─── Atom components ───────────────────────────────────────────────────────

const Section = ({ id, num, title, sub, newTag, description, children }) => (
  <section id={id}>
    <div className="sec-head">
      <div className="sec-num">{num}</div>
      <div className="sec-title">
        <h2>
          {title}
          {newTag && <span className="new-tag">NEW</span>}
        </h2>
        <div className="sub">{sub}</div>
      </div>
    </div>
    {description && <p className="description">{description}</p>}
    {children}
  </section>
);

const Features = ({ items }) => (
  <ul className="features">
    {items.map((node, i) => <li key={i}>{node}</li>)}
  </ul>
);

const Card = ({ role, title, items }) => (
  <div className="card">
    <div className="role">{role}</div>
    <h4>{title}</h4>
    <Features items={items} />
  </div>
);

const Grid2 = ({ children }) => <div className="grid-2">{children}</div>;

const Pills = ({ items }) => (
  <div className="pills">
    {items.map((p, i) => <span key={i} className={`pill ${p.tone || ''}`.trim()}>{p.label}</span>)}
  </div>
);

const Tweak = ({ children }) => <span className="tweak">{children}</span>;

const Note = ({ children }) => (
  <div className="note">
    <span className="note-icon">i</span>
    <div>{children}</div>
  </div>
);

// ─── TOC data ──────────────────────────────────────────────────────────────

const TOC = [
  { label: 'Foundations', items: [
    { num: '00',  id: 'login',         text: 'Login' },
    { num: '·',   id: 'shell',         text: 'Admin Shell' },
    { num: '01',  id: 'dashboard',     text: 'Platform Health' },
  ]},
  { label: 'Client management', items: [
    { num: '02',  id: 'tenants',       text: 'Tenants' },
    { num: '·',   id: 'tenant-detail', text: 'Tenant Detail' },
    { num: '03',  id: 'users',         text: 'Users' },
  ]},
  { label: 'Operations', items: [
    { num: '04',  id: 'whatsapp',      text: 'WhatsApp Monitor' },
    { num: '05',  id: 'system',        text: 'System Ops' },
    { num: '06',  id: 'support',       text: 'Support Inbox' },
  ]},
  { label: 'Money', items: [
    { num: '07',  id: 'billing',       text: 'Billing Ops' },
    { num: '08',  id: 'analytics',     text: 'Analytics' },
  ]},
  { label: 'Trust', items: [
    { num: '09',  id: 'audit',         text: 'Audit Log' },
    { num: '10',  id: 'announcements', text: 'Announcements' },
  ]},
  { label: 'Overlays', items: [
    { num: '·',   id: 'notifications', text: 'Notifications' },
    { num: '·',   id: 'cmdk',          text: 'Command Palette' },
  ]},
  { label: 'Improvements ✦', items: [
    { num: 'M1',  id: 'impersonate',     text: 'Impersonate Client',  isNew: true },
    { num: 'M2',  id: '2fa',             text: '2FA Enforcement',     isNew: true },
    { num: 'M3',  id: 'ip-allowlist',    text: 'IP Allowlist',        isNew: true },
    { num: 'M4',  id: 'quality-radar',   text: 'Quality Radar',       isNew: true },
    { num: 'M5',  id: 'failed-payments', text: 'Failed Payments',     isNew: true },
    { num: 'M6',  id: 'coupons',         text: 'Coupon Manager',      isNew: true },
    { num: 'M7',  id: 'refunds',         text: 'Refunds & Disputes',  isNew: true },
    { num: 'M8',  id: 'churn-radar',     text: 'Churn Radar',         isNew: true },
    { num: 'M9',  id: 'slo-monitor',     text: 'SLO Monitor',         isNew: true },
    { num: 'M10', id: 'data-export',     text: 'Data Export',         isNew: true },
  ]},
  { label: 'System', items: [
    { num: '·',   id: 'tweaks',          text: 'Tweaks Panel' },
    { num: '·',   id: 'shortcuts',       text: 'Keyboard Shortcuts' },
  ]},
];

// ─── Page ──────────────────────────────────────────────────────────────────

export default function FeatureSpecPage() {
  return (
    <div className="fs-page">
      <div className="wrap">
        {/* ─────────── Sidebar TOC ─────────── */}
        <aside>
          <div style={{ padding: '0 12px 0' }}>
            <div className="brand">
              <div className="brand-mark">N</div>
              <div className="brand-name">NitiGrow · Admin</div>
            </div>
            <div style={{ fontSize: 11, color: 'var(--fs-mute)', letterSpacing: '.04em', marginBottom: 24 }}>
              Internal Specification · v2026.1
            </div>
          </div>

          <nav className="toc">
            {TOC.map((group, gi) => (
              <div key={gi} className="toc-group">
                <div className="toc-label">{group.label}</div>
                {group.items.map((item) => (
                  <a key={item.id} href={`#${item.id}`}>
                    <span className="num">{item.num}</span>
                    {item.text}
                    {item.isNew && <span className="new">NEW</span>}
                  </a>
                ))}
              </div>
            ))}
          </nav>
        </aside>

        {/* ─────────── Main ─────────── */}
        <main>
          {/* Hero */}
          <div className="hero">
            <div className="eyebrow">Admin Specification</div>
            <h1>Every internal lever, <em>itemised.</em></h1>
            <p className="lede">
              A screen-by-screen catalogue of the NitiGrow admin panel — built for
              the team behind the platform. Operations, support, billing and trust,
              in one source of truth.
            </p>
            <div className="meta">
              <div className="meta-item"><span className="k">Version</span><span className="v">2026.1</span></div>
              <div className="meta-item"><span className="k">Screens</span><span className="v">13</span></div>
              <div className="meta-item"><span className="k">Overlays</span><span className="v">12</span></div>
              <div className="meta-item"><span className="k">Audience</span><span className="v">Internal · ARDYM team</span></div>
              <div className="meta-item"><span className="k">Stack</span><span className="v">React · Vite · Pure CSS</span></div>
            </div>
          </div>

          {/* ═════════ FOUNDATIONS ═════════ */}

          <Section
            id="login" num="00" title="Login"
            sub="Plain, unbranded. Security through obscurity."
            description="No NitiGrow logo, no marketing copy, no help links. A black box that accepts admin credentials and forwards to 2FA. Designed so casual visitors can't tell what runs behind it."
          >
            <Card role="Composition" title="Single-column · centred" items={[
              <><b>No branding</b> — generic page title, no company name, no marketing copy</>,
              <><b>Email + password</b> — the only two visible inputs, no "sign up" link</>,
              <><b>2FA step</b> — TOTP code (6 digits) on next screen after password</>,
              <><b>IP-blocked state</b> — generic "Access denied" if the caller's IP isn't allowlisted</>,
              <><b>Rate limited</b> — 5 attempts per 15 min per IP, then lockout</>,
            ]}/>
            <Pills items={[
              { label: 'Unbranded' },
              { label: 'Mandatory 2FA', tone: 'warm' },
              { label: 'IP allowlist', tone: 'brand' },
            ]}/>
          </Section>

          <Section
            id="shell" num="·" title="Admin Shell"
            sub="Sidebar · Top bar · Notification bell · ⌘K · Theme toggle."
            description="The chrome wrapping every admin route. Sidebar holds the 10 main sections. Top bar shows breadcrumbs, search trigger, platform-status dot, alert bell and the signed-in admin's avatar."
          >
            <Grid2>
              <Card role="Sidebar" title="Persistent navigation" items={[
                <>10 routes grouped: <b>Clients</b>, <b>Ops</b>, <b>Money</b>, <b>Trust</b></>,
                <>Role-gated items hidden for non-permitted admins</>,
                <>Footer: signed-in admin chip + environment badge (prod/staging)</>,
                <>Collapsible · 260px ↔ 72px</>,
              ]}/>
              <Card role="Top bar" title="Per-route chrome" items={[
                <>Breadcrumbs + page title</>,
                <>Command palette trigger (⌘K)</>,
                <>Platform status dot — green / amber / red</>,
                <>Notification bell · unread count</>,
                <>Theme toggle · light / dark</>,
                <>Avatar menu — Profile, 2FA, Sign out</>,
              ]}/>
            </Grid2>
          </Section>

          <Section
            id="dashboard" num="01" title="Platform Health"
            sub="The first thing every admin sees on login."
            description="A bird's-eye snapshot — tenant count, MRR, message volume, queue depth, incident banner. Designed to surface anomalies in 3 seconds."
          >
            <Card role="Sections" title="What's on the page" items={[
              <><b>Status banner</b> — "All systems operational" / "Degraded" / "Major incident" with link to System Ops</>,
              <><b>KPI grid</b> — Active tenants · MRR (₹) · Messages today · Tickets open, each with delta vs yesterday</>,
              <><b>Live activity</b> — last 10 platform events (signups, payments, quality drops, support tickets)</>,
              <><b>Top alarms</b> — WhatsApp quality red, failed payment retries, SLO breaches</>,
              <><b>Charts</b> — 30-day MRR line, 7-day message volume bars</>,
              <><b>New signups today</b> — sparkline + count with click-through to Tenants</>,
            ]}/>
          </Section>

          {/* ═════════ CLIENT MANAGEMENT ═════════ */}

          <Section
            id="tenants" num="02" title="Tenants"
            sub="The clients table. One row per workspace."
          >
            <Features items={[
              <><b>Table</b> — name, plan, status (active/trial/past-due/cancelled), MRR, WABA quality, last activity</>,
              <><b>Filters</b> — plan, status, quality rating, region, signup date</>,
              <><b>Search</b> — by name, email, GSTIN, WABA ID, phone</>,
              <><b>Row actions</b> — Open detail · Impersonate · Suspend · Add note</>,
              <><b>Bulk actions</b> — Export CSV · Tag · Send announcement to selection</>,
              <><b>Quality column</b> — green/amber/red dot inline; click to drill into Quality Radar</>,
            ]}/>
          </Section>

          <Section
            id="tenant-detail" num="·" title="Tenant Detail"
            sub="The deep-dive for a single client."
          >
            <Grid2>
              <Card role="Profile" title="The basics" items={[
                <>Display name, legal name, GSTIN, address</>,
                <>Owner contact · phone · email</>,
                <>Signup date, source, sales rep</>,
                <>Internal notes timeline</>,
              ]}/>
              <Card role="Members" title="Users on this workspace" items={[
                <>Role, last active, login count</>,
                <>Disable user (with reason) · resend invite</>,
                <>Cross-link to Users page</>,
              ]}/>
              <Card role="Billing" title="Money for this tenant" items={[
                <>Current plan, next invoice, MRR</>,
                <>Past invoices (paid/failed)</>,
                <>Manual invoice · apply coupon · issue refund</>,
              ]}/>
              <Card role="WhatsApp" title="WABA status" items={[
                <>Phone numbers, quality rating, tier, blocked state</>,
                <>Last quality check time</>,
                <>Re-verify · request rating review</>,
              ]}/>
              <Card role="Volume" title="Message activity" items={[
                <>Messages sent / received, 7d / 30d</>,
                <>Conversation count by category (marketing/utility/auth/service)</>,
                <>Spend in ₹ on conversations</>,
              ]}/>
              <Card role="Trust" title="Audit + impersonation" items={[
                <>Per-tenant audit trail (filtered slice of the global log)</>,
                <>Impersonate button → red banner session <span className="pill warm">M1</span></>,
                <>Open support tickets for this tenant</>,
              ]}/>
            </Grid2>
          </Section>

          <Section
            id="users" num="03" title="Users"
            sub="Cross-tenant user search."
          >
            <Features items={[
              <><b>Search</b> — by email, phone, name across every tenant</>,
              <><b>Row</b> — name, email, tenant chip, role, last login, status</>,
              <><b>Multi-tenant users</b> — collapses into one row showing all their workspaces</>,
              <><b>Actions</b> — Force sign-out · Reset password · Disable account</>,
              <><b>Filters</b> — role, status, signup date, last-active range</>,
            ]}/>
          </Section>

          {/* ═════════ OPERATIONS ═════════ */}

          <Section
            id="whatsapp" num="04" title="WhatsApp Monitor"
            sub="Quality ratings across every tenant's phones."
          >
            <Features items={[
              <><b>Phone table</b> — phone number, tenant, quality rating (GREEN/YELLOW/RED), messaging tier, blocked state, last-checked timestamp</>,
              <><b>Filters</b> — quality, tier, blocked-only, tenant</>,
              <><b>Sort</b> — by quality (worst first), by tier, by recency of drop</>,
              <><b>Row actions</b> — Open tenant · Trigger quality refresh · Request rating review · Mark for ops review</>,
              <><b>Alerts</b> — RED rating triggers internal Slack ping and notification bell entry</>,
              <><b>Map view</b> — see Quality Radar <span className="pill warm">M4</span></>,
            ]}/>
          </Section>

          <Section
            id="system" num="05" title="System Ops"
            sub="Service health · queue depth · uptime."
          >
            <Features items={[
              <><b>Service tiles</b> — API · MongoDB · Redis · Meta API · Razorpay · MinIO · Socket gateway</>,
              <><b>Per-service</b> — status, latency p50/p95, error rate, uptime 30d</>,
              <><b>Queue depth</b> — broadcast queue, webhook retry queue, AI inference queue</>,
              <><b>Incidents</b> — currently open + recent (last 30d) with timeline</>,
              <><b>Manual controls</b> — drain queue, flush Redis key, restart worker (per-role gated)</>,
              <><b>SLO snapshot</b> — current vs targets, link to SLO Monitor <span className="pill warm">M9</span></>,
            ]}/>
          </Section>

          <Section
            id="support" num="06" title="Support Inbox"
            sub="Unified ticket inbox across every client."
          >
            <Features items={[
              <><b>Three columns</b> — ticket list · thread · client context</>,
              <><b>Ticket list</b> — subject, requester (with tenant chip), priority, status, age, assignee</>,
              <><b>Filters</b> — status (Open/Pending/Resolved), priority, assignee, tenant, channel (email/widget/in-app)</>,
              <><b>Thread</b> — messages timeline, internal notes (yellow), attachments</>,
              <><b>Client context drawer</b> — tenant card, plan, MRR, recent activity, jump to Tenant Detail</>,
              <><b>Macros</b> — canned replies for common issues; "/" trigger</>,
              <><b>Assignment</b> — round-robin or manual; SLA badge inline</>,
            ]}/>
          </Section>

          {/* ═════════ MONEY ═════════ */}

          <Section
            id="billing" num="07" title="Billing Ops"
            sub="Revenue management for the platform."
          >
            <Features items={[
              <><b>Failed payments queue</b> — list of dunning attempts with retry/refund/contact actions <span className="pill warm">M5</span></>,
              <><b>Manual invoices</b> — issue an off-cycle invoice with custom line items + GST</>,
              <><b>Refunds</b> — search a transaction, partial/full refund through Razorpay <span className="pill warm">M7</span></>,
              <><b>Coupons</b> — promo codes with caps, validity, plan restrictions <span className="pill warm">M6</span></>,
              <><b>Plan changes</b> — force upgrade/downgrade with proration preview</>,
              <><b>Cancellation flow</b> — reason capture, retention offer, mark date</>,
              <><b>Revenue snapshot</b> — MRR · ARR · ARPU · LTV with deltas</>,
            ]}/>
          </Section>

          <Section
            id="analytics" num="08" title="Analytics"
            sub="Platform growth, retention, and pricing."
          >
            <Features items={[
              <><b>Date range</b> — Today · 7d · 30d · 90d · YTD · custom</>,
              <><b>Growth charts</b> — MRR over time, new signups, paid conversions</>,
              <><b>Retention</b> — cohort grid (signup month × month-N retention)</>,
              <><b>Churn</b> — monthly churn rate, top reasons, churn risk leaderboard <span className="pill warm">M8</span></>,
              <><b>Plan distribution</b> — donut by plan, MRR contribution per plan</>,
              <><b>Trial-to-paid funnel</b> — signup → onboarded → first message → paid</>,
              <><b>Export</b> — CSV · PDF · scheduled email digest</>,
            ]}/>
          </Section>

          {/* ═════════ TRUST ═════════ */}

          <Section
            id="audit" num="09" title="Audit Log"
            sub="Every admin action, logged forever."
          >
            <Features items={[
              <><b>Timeline</b> — reverse-chronological events, infinite scroll</>,
              <><b>Per row</b> — actor (avatar + name + role), action verb, object (with tenant chip), IP, user-agent, timestamp</>,
              <><b>Diff view</b> — click an event for before/after JSON on mutating actions</>,
              <><b>Categories</b> — Auth · Tenant · Billing · Refunds · Impersonation · Settings · System</>,
              <><b>Filters</b> — actor, category, tenant, date range, IP, free-text</>,
              <><b>Export</b> — CSV (filtered), with compliance hash chain</>,
              <><b>Retention</b> — 1 year on disk, archived to cold storage after</>,
            ]}/>
            <Note>
              <b>Tamper-evident.</b> Each entry chains to the previous via SHA-256; tampering breaks the chain and lights up an integrity alarm.
            </Note>
          </Section>

          <Section
            id="announcements" num="10" title="Announcements"
            sub="Compose platform-wide messages."
          >
            <Features items={[
              <><b>Composer</b> — title, body (rich text), CTA button + URL</>,
              <><b>Targeting</b> — by plan, role, region, signup window, custom tenant list</>,
              <><b>Surface</b> — banner (top of app), modal (full-screen on next load), or in-app notification</>,
              <><b>Schedule</b> — send now / send at / recurring (e.g. festival reminders)</>,
              <><b>Preview</b> — phone + desktop preview of each surface</>,
              <><b>Stats</b> — impressions, click-through, dismissal rate</>,
            ]}/>
          </Section>

          {/* ═════════ OVERLAYS ═════════ */}

          <Section
            id="notifications" num="·" title="Notifications Drawer"
            sub="The admin's own bell. Right-side drawer."
          >
            <Features items={[
              <><b>Tabs</b> — All · Signups · Payments · Quality · Tickets · System</>,
              <><b>Item</b> — severity icon, title, tenant chip, snippet, timestamp, unread dot</>,
              <><b>Severity</b> — info · warning · critical (red border)</>,
              <><b>Actions</b> — mark all read, snooze, "see in context" deep-link</>,
              <><b>Sources</b> — new signup, failed payment, WhatsApp quality drop, SLO breach, urgent ticket</>,
            ]}/>
          </Section>

          <Section
            id="cmdk" num="·" title="Command Palette ⌘K"
            sub="The everything-jumper for admins."
          >
            <Features items={[
              <><b>Search</b> — fuzzy across tenants (by name/email/wabaId), users, tickets, invoices, audit entries</>,
              <><b>Sections</b> — Tenants · Users · Tickets · Navigate · Quick actions</>,
              <><b>Quick actions</b> — Issue refund · New announcement · Drain queue · Toggle theme · Sign out</>,
              <><b>Result row</b> — shows tenant chip + plan badge for context</>,
              <><b>Keyboard</b> — ↑↓ navigate, Enter select, Esc close</>,
            ]}/>
          </Section>

          {/* ═════════ IMPROVEMENTS ═════════ */}

          <Section
            id="impersonate" num="M1" title="Impersonate Client" newTag
            sub="See the app exactly as the client sees it."
            description="A scoped, short-lived token issued by the admin backend that lets the admin operate inside a client workspace. A loud red banner makes the state impossible to miss. Destructive paths are disabled."
          >
            <Features items={[
              <><b>Trigger</b> — Impersonate button on Tenant Detail or row action on Tenants table</>,
              <><b>Token</b> — short-lived JWT (30 min), scoped to that tenant, marked <code>impersonator: adminId</code></>,
              <><b>Banner</b> — sticky red bar: "Viewing as Kalakriti Boutique · Pankaj J · Exit"</>,
              <><b>Restrictions</b> — no billing changes, no payment-method edits, no account deletion, no member-role escalations</>,
              <><b>Session timeout</b> — auto-exit at 30 min or on manual exit; tokens revoked immediately</>,
              <><b>Audit</b> — every action during impersonation is dual-logged (admin actor + as-tenant context)</>,
            ]}/>
          </Section>

          <Section
            id="2fa" num="M2" title="2FA Enforcement" newTag
            sub="TOTP for every admin. No exceptions."
          >
            <Features items={[
              <><b>Setup</b> — QR + secret on first login, scanned with Authenticator app</>,
              <><b>Recovery codes</b> — 10 one-time codes shown once, downloadable as text</>,
              <><b>Policy</b> — "all admins required" enforced server-side; admin can't sign in without TOTP</>,
              <><b>Reset flow</b> — only super_admin can clear another admin's 2FA, with reason logged to audit</>,
              <><b>Lockout</b> — 5 failed TOTP attempts → 15-min cooldown, then escalation email to super_admin</>,
              <><b>WebAuthn (future)</b> — passkey alternative for super_admin role</>,
            ]}/>
          </Section>

          <Section
            id="ip-allowlist" num="M3" title="IP Allowlist" newTag
            sub="Only known IPs can reach the admin panel."
          >
            <Features items={[
              <><b>Allowlist editor</b> — list of CIDR blocks with label, owner, last-used timestamp</>,
              <><b>Per-admin scope</b> — optionally restrict an individual admin to their own IPs</>,
              <><b>Global scope</b> — defaults applied to everyone if no per-admin entry</>,
              <><b>Add flow</b> — capture current IP with one click + label</>,
              <><b>Blocked attempts</b> — visible feed showing rejected requests with IP + country</>,
              <><b>Emergency bypass</b> — super_admin can issue a one-time signed URL for off-network access</>,
            ]}/>
          </Section>

          <Section
            id="quality-radar" num="M4" title="WhatsApp Quality Radar" newTag
            sub="Visual map of phone quality across the platform."
          >
            <Features items={[
              <><b>Grid view</b> — every phone as a coloured tile (green/yellow/red), grouped by tenant or region</>,
              <><b>Hover</b> — tenant, phone, tier, last-rated, current message volume</>,
              <><b>Click-through</b> — drill into the tenant's WhatsApp tab in Tenant Detail</>,
              <><b>Filters</b> — colour, tier, plan, region, custom tags</>,
              <><b>Trend strip</b> — 30-day timeline of red/yellow counts platform-wide</>,
              <><b>Anomaly highlight</b> — tiles flash when freshly dropped to red</>,
            ]}/>
          </Section>

          <Section
            id="failed-payments" num="M5" title="Failed Payment Queue" newTag
            sub="Recover lost revenue without losing the client."
          >
            <Features items={[
              <><b>Queue</b> — every failed charge with tenant, amount, reason code, attempts, next-retry</>,
              <><b>Row actions</b> — Retry now · Refund (full/partial) · Contact client · Move to manual collections</>,
              <><b>Reason codes</b> — Razorpay-mapped (insufficient funds, card expired, bank decline)</>,
              <><b>Auto-dunning timeline</b> — retry at +1d, +3d, +7d; configurable per plan</>,
              <><b>Client contact</b> — opens a pre-filled email/WhatsApp template addressed to the workspace owner</>,
              <><b>Recovery rate</b> — KPI: % of failed payments recovered within 14d</>,
            ]}/>
          </Section>

          <Section
            id="coupons" num="M6" title="Coupon Manager" newTag
            sub="Promo codes with rails."
          >
            <Features items={[
              <><b>Coupon list</b> — code, type (% or ₹), value, used/cap, validity, status</>,
              <><b>Create / edit</b> — code, discount, plan eligibility, first-time-only flag, expiry</>,
              <><b>Usage caps</b> — global cap + per-tenant cap</>,
              <><b>Validity window</b> — from/to dates, plus weekday/time restriction (festival sales)</>,
              <><b>Redemption log</b> — which tenant used which code when</>,
              <><b>Disable</b> — flip to inactive without deleting; preserves audit trail</>,
            ]}/>
          </Section>

          <Section
            id="refunds" num="M7" title="Refunds & Disputes" newTag
            sub="Razorpay-integrated refund flow."
          >
            <Features items={[
              <><b>Transaction search</b> — by tenant, invoice number, payment ID, date</>,
              <><b>Refund form</b> — amount (full or partial), reason category, internal note</>,
              <><b>Razorpay call</b> — initiated server-side; status reflected on the row</>,
              <><b>Dispute notes</b> — for chargebacks: evidence files, response template, deadline timer</>,
              <><b>Notifications</b> — outcome (success / failed) pushed to bell + email</>,
              <><b>Approval workflow</b> — refunds above ₹10,000 require super_admin co-sign</>,
            ]}/>
          </Section>

          <Section
            id="churn-radar" num="M8" title="Churn Risk Radar" newTag
            sub="Tenants we are about to lose."
          >
            <Features items={[
              <><b>Risk score</b> — composite per tenant: usage drop, ticket volume, payment failures, NPS</>,
              <><b>Leaderboard</b> — top 50 at-risk tenants sorted by score</>,
              <><b>Signals column</b> — chips showing what triggered the score (low activity, open ticket, failed payment)</>,
              <><b>Actions</b> — Schedule call · Send retention coupon · Assign CSM · Mark for review</>,
              <><b>Trend</b> — 30-day risk-score curve per tenant</>,
              <><b>Auto-rules</b> — if score &gt; 80 for 7d → auto-create a CS task</>,
            ]}/>
          </Section>

          <Section
            id="slo-monitor" num="M9" title="SLO Monitor" newTag
            sub="Internal SLAs vs targets."
          >
            <Features items={[
              <><b>SLO grid</b> — uptime, API p95 latency, broadcast delivery rate, ticket first-response, ticket resolution</>,
              <><b>Per row</b> — current value, target, error budget remaining, burn-rate (1h / 6h)</>,
              <><b>Alerts</b> — when burn-rate would exhaust budget in &lt; 24h, push to bell + on-call</>,
              <><b>30-day timeline</b> — area chart of attainment vs target line</>,
              <><b>Drill-in</b> — incidents that consumed the most budget for the period</>,
              <><b>Edit</b> — super_admin can adjust targets with reason captured to audit</>,
            ]}/>
          </Section>

          <Section
            id="data-export" num="M10" title="Bulk Data Export" newTag
            sub="For compliance, migration, or due diligence."
          >
            <Features items={[
              <><b>Export builder</b> — pick a tenant, choose datasets (contacts, conversations, templates, billing, audit)</>,
              <><b>Format</b> — CSV bundle or JSONL ZIP</>,
              <><b>Date range</b> — optional, default all-time</>,
              <><b>Job queue</b> — async; admin notified when ready (typically &lt; 5 min)</>,
              <><b>Signed download</b> — 24h URL, single-use, audited on access</>,
              <><b>Retention</b> — exported archives auto-deleted after 7 days</>,
              <><b>Compliance hooks</b> — GDPR-style "Right to data" requests routed here</>,
            ]}/>
          </Section>

          {/* ═════════ SYSTEM ═════════ */}

          <Section
            id="tweaks" num="·" title="Tweaks Panel"
            sub="Per-admin preferences."
            description={<>The admin's own settings. Lives in the avatar menu. Persists per signed-in admin.</>}
          >
            <Grid2>
              <Card role="Visual" title="Density & theme" items={[
                <>Theme — Light / Dark / Match system</>,
                <>Density — Compact · Comfortable · Cozy</>,
                <>Sidebar — Labeled · Icon-only</>,
                <>Typography — Default · Editorial · Mono</>,
              ]}/>
              <Card role="Alerts" title="Notification preferences" items={[
                <>Per-source toggles — signups, failed payments, quality drops, SLO breaches, tickets</>,
                <>Channel routing — bell only · bell + email · bell + Slack</>,
                <>Quiet hours — mute non-critical between 22:00–07:00 IST</>,
                <>Test notification — fires a sample to verify routing</>,
              ]}/>
            </Grid2>
          </Section>

          <Section
            id="shortcuts" num="·" title="Keyboard Shortcuts"
            sub="For the operators who live in their keyboard."
          >
            <Features items={[
              <><code>⌘K</code> / <code>Ctrl K</code> — open command palette</>,
              <><code>G</code> then <code>D</code> — Dashboard</>,
              <><code>G</code> then <code>T</code> — Tenants</>,
              <><code>G</code> then <code>U</code> — Users</>,
              <><code>G</code> then <code>W</code> — WhatsApp Monitor</>,
              <><code>G</code> then <code>S</code> — System Ops</>,
              <><code>G</code> then <code>I</code> — Support Inbox</>,
              <><code>G</code> then <code>B</code> — Billing Ops</>,
              <><code>G</code> then <code>A</code> — Analytics</>,
              <><code>G</code> then <code>L</code> — Audit Log</>,
              <><code>G</code> then <code>N</code> — Announcements</>,
              <><code>Esc</code> — close any open modal or drawer</>,
              <><code>I</code> — open impersonation prompt for the focused tenant row</>,
            ]}/>
          </Section>

          {/* Stats summary */}
          <section>
            <div className="sec-head">
              <div className="sec-num">∑</div>
              <div className="sec-title">
                <h2>By the numbers</h2>
                <div className="sub">A summary, for the all-hands deck.</div>
              </div>
            </div>
            <div className="stat-row">
              <div className="stat"><div className="n">11</div><div className="l">Core admin screens</div></div>
              <div className="stat"><div className="n">10</div><div className="l">Improvements (NEW)</div></div>
              <div className="stat"><div className="n">4</div><div className="l">Admin roles</div></div>
              <div className="stat"><div className="n">30m</div><div className="l">Impersonation TTL</div></div>
              <div className="stat"><div className="n">1y</div><div className="l">Audit retention</div></div>
              <div className="stat"><div className="n">13</div><div className="l">Keyboard shortcuts</div></div>
            </div>
          </section>

          <footer>
            <div className="ornament">❦</div>
            <div>NitiGrow Admin · Internal Specification · Generated 2026</div>
            <div style={{ marginTop: 6 }}>
              <a href="/dashboard">← Back to admin</a>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
