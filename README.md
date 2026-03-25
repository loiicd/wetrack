# WeTrack – Dashboard-as-Code Platform

WeTrack ist eine **Dashboard-as-Code** Plattform. Dashboards, Datenquellen, Queries und Charts werden als TypeScript-Code definiert und via CLI deployed.

---

## Setup (lokal)

### Voraussetzungen
- [Bun](https://bun.sh) ≥ 1.2 · Node.js ≥ 18 · PostgreSQL · [Clerk](https://clerk.com) Account

```bash
git clone https://github.com/your-org/wetrack
cd wetrack
bun install
cp apps/dashboard/.env.example apps/dashboard/.env
# .env befüllen (DATABASE_URL, CLERK_*, VAULT_SECRET)
```

```bash
cd apps/dashboard
npx prisma migrate deploy
npx prisma generate
bun run dev   # http://localhost:3000
```

---

## Deployment (Vercel)

1. Repo auf Vercel importieren · Root Directory: `apps/dashboard`
2. Build Command: `cd ../.. && bun run build --filter=dashboard`
3. Environment Variables setzen:

| Variable | Beschreibung |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL Connection String (Neon/Supabase empfohlen) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk Publishable Key |
| `CLERK_SECRET_KEY` | Clerk Secret Key |
| `VAULT_SECRET` | AES-Key für Credential Vault (`openssl rand -base64 32`) |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/signIn` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/signUp` |
| `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` | `/` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` | `/` |

4. Nach erstem Deploy: `DATABASE_URL=<url> npx prisma migrate deploy`

---

## Clerk konfigurieren

1. [Clerk Dashboard](https://dashboard.clerk.com) → Neues Projekt → Keys kopieren
2. User & Authentication → **Organizations** aktivieren
3. API Keys → **Enable** (für CLI-Authentifizierung via Bearer Token)

---

## CLI

```bash
bun add -g @wetrack/cli
export WETRACK_API_KEY=<clerk-api-key>
wetrack deploy mystack.ts --url https://your-app.vercel.app/api/dashboard
```

Docs: [wetrack-cli/README.md](../wetrack-cli/README.md)

---

## Monorepo-Struktur

```
wetrack/
├── apps/dashboard/     # Next.js App
├── apps/landing/       # Marketing Landing Page
├── apps/documentation/ # Docs-Site (Fumadocs)
├── packages/dashboard/ # SDK: dashboard_as_code
└── packages/cli/       # CLI: @wetrack/cli
```

## Kernkonzepte

| Konzept | Beschreibung |
|---------|-------------|
| **Stack** | Container (key + environment + orgId) |
| **Dashboard** | Gruppe von Charts |
| **DataSource** | REST API Connector |
| **Query** | JSONPath/SQL Transformation (chainbar) |
| **Chart** | BAR · LINE · STAT · CLOCK |
| **Credential** | Verschlüsselter Vault für externe API-Keys |

Für AI-Agent-Dokumentation: [AGENTS.md](./AGENTS.md)
