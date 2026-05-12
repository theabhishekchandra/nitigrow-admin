# NitiGrow Admin Panel — Claude Instructions

## What Is This?
Internal admin panel for the NitiGrow team (not for clients).
URL: admin.nitigrow.in
Used by: Super Admin, Support Agents, Billing Manager, Operations team.

## Tech Stack
Same as web dashboard:
- React.js 18 + Vite
- React Router v6
- Zustand
- Axios + React Query
- Tailwind CSS
- Recharts
- Socket.io-client (for live platform health)

## Critical Security Rules
- Admin login page now uses the same warm Indian premium branding as the app — per owner decision 2026-05-12. Security through obscurity was dropped in favour of consistent identity across surfaces. Compensating controls: 2FA, IP allowlist, audit log, 30-min idle timeout.
- 2FA mandatory for ALL admin accounts (TOTP)
- IP allowlist: only NitiGrow team's known IPs
- Session timeout: 30 minutes of inactivity
- Every admin action logged to audit log
- Impersonation mode: always show red banner "You are viewing as [Client]"
- Impersonation cannot access: billing changes, payment methods, account deletion

## Admin Roles
| Role | Access |
|------|--------|
| super_admin | Everything |
| support | View clients, tickets, impersonate |
| billing | Revenue, invoices, refunds |
| operations | System health, WhatsApp quality, Meta API |

## Key Screens
1. **Platform Health Dashboard** — live stats, system status (first screen on login)
2. **Client Management** — all clients table + detail page
3. **WhatsApp Monitoring** — quality ratings across all clients
4. **Support Inbox** — unified ticket system
5. **Billing Management** — failed payments, refunds, coupons
6. **Analytics** — platform growth, MRR, churn
7. **Audit Log** — all admin actions

## API Endpoints
All admin routes prefixed with `/admin/` — separate from client routes.
Admin JWT: 2-hour expiry (shorter than client JWT).

## Key Phase Doc
- `../docs/phase-1.6-admin-panel.md` — complete admin panel spec (15 sections)
