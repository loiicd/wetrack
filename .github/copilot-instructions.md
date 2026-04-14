# WeTrack – GitHub Copilot Instructions

## Projekt-Überblick

WeTrack ist eine **Dashboard-as-Code** SaaS-Plattform. Dashboards werden als TypeScript-Dateien im User-Repo definiert, via CLI deployed und live im Browser angezeigt.

**Vollständige Referenz:** `AGENTS.md` im Repo-Root (SDK-Konzepte, Chart-Typen, Layout).

## Tech Stack

| Tool | Version/Details |
|------|----------------|
| **Framework** | Next.js 15, App Router, React 19 |
| **Package Manager** | Bun |
| **Build System** | Turborepo |
| **ORM** | Prisma → PostgreSQL (Neon) |
| **Auth** | Clerk (Organizations aktiviert) |
| **Styling** | Tailwind CSS v4 + shadcn/ui |
| **Validation** | Zod |

## Monorepo-Struktur

```
wetrack/
├── apps/
│   ├── dashboard/          # Next.js Haupt-App (Port 3000) — app.wetrack.dev
│   ├── documentation/      # Fumadocs Docs-Site — docs.wetrack.dev
│   └── landing/            # Landing Page — wetrack.dev
└── packages/
    ├── ui/                 # Shared shadcn/ui Komponenten
    ├── eslint-config/
    └── typescript-config/
```

> ⚠️ `packages/dashboard` und `packages/cli` sind **Legacy** und werden gelöscht.
> Das SDK lebt in `wetrack-dashboard` (separates Repo/npm-Package).
> Die CLI lebt in `wetrack-cli` (separates Repo/npm-Package).

## Wichtige Dateipfade (apps/dashboard)

| Pfad | Inhalt |
|------|--------|
| `prisma/schema.prisma` | Datenbankschema |
| `generated/prisma/` | Generierter Prisma Client |
| `schemas/dashboard.ts` | Zod-Schemas für Stack-Validierung |
| `schemas/configs/restApiConfig.ts` | Zod-Schema für DataSource-Config |
| `lib/workflows/main.ts` | Deploy-Workflow (CLI → DB) |
| `lib/workflows/getChartData.ts` | REST-Call + Credential Injection |
| `lib/workflows/getQueryData.ts` | Query-Ausführung (JSONPath/SQL) |
| `lib/database/` | Prisma Interface-Funktionen |
| `lib/auth/getAuth.ts` | Auth in Server Actions |
| `lib/auth/getPageAuth.ts` | Auth in Server Components/Pages |
| `lib/billing/featureGate.ts` | Clerk Feature Gates |
| `lib/vault/encryption.ts` | AES-256-GCM Verschlüsselung |
| `app/api/dashboard/` | POST-Endpoint für CLI-Deploy |
| `app/(secure)/dashboard/` | Dashboard List + Detail Pages |
| `components/widgets/` | Chart-Komponenten (CartesianChart, StatCard, ClockWidget) |
| `components/chartGrid.tsx` | CSS-Grid Layout für Widgets |
| `components/chartWrapper.tsx` | Card-Wrapper für alle Widgets |

## Vor jedem Commit: Pflicht-Checks

```bash
# TypeScript — kein noEmit-Fehler
cd apps/dashboard && bun run check-types

# Lint
cd apps/dashboard && bun run lint

# Build (deckt Next.js Prerender-Fehler auf, die tsc nicht sieht)
cd apps/dashboard && bun run build
```

Alle drei müssen **fehlerfrei** durchlaufen. Warnungen sind ok.

## Auth-Patterns (Clerk)

**In Server Components / Pages:**
```typescript
import { getPageAuth } from "@/lib/auth/getPageAuth";
const { orgId, userId } = await getPageAuth();
```

**In Server Actions / API Routes:**
```typescript
import { getAuth } from "@/lib/auth/getAuth";
const { orgId, userId } = await getAuth();
```

- Beide Funktionen werfen, wenn nicht authentifiziert oder keine Org vorhanden
- Jeder User gehört genau einer Org — `orgId` ist immer der Tenant-Key
- Alle DB-Queries müssen nach `orgId` gefiltert werden

## Feature Gates (Billing)

```typescript
import { checkFeature, requireFeature } from "@/lib/billing/featureGate";

// Sanfter Check:
const canUseVault = await checkFeature("feature:credential_vault");

// Hard redirect auf /settings/billing wenn nicht erlaubt:
await requireFeature("feature:unlimited_dashboards");
```

Verfügbare Features: `"feature:deploy"` · `"feature:unlimited_dashboards"` · `"feature:credential_vault"`

> Im MVP sind Feature Gates standardmäßig offen (kein echtes Billing aktiv).

## Credential Vault

- Credentials werden **AES-256-GCM** verschlüsselt in der DB gespeichert (`VAULT_SECRET` env var)
- **Niemals** den eigentlichen Wert im Stack-Code oder in Logs speichern — nur die Label-Referenz
- Typen: `"bearer"` · `"api-key"` · `"basic"` · `"header"` (mit `headerName`)
- Injection passiert in `lib/workflows/getChartData.ts` beim REST-Call

```typescript
// Richtig: nur Label-Referenz im Stack
new DataSource("my-api", {
  type: "rest",
  config: {
    url: "https://api.example.com/data",
    method: "get",
    credential: "my-api-key",  // ← Label aus dem Vault, nie der echte Wert
  },
});
```

## Datenbank-Regeln (Prisma)

**Nur Prisma-Befehle — kein manuelles SQL, kein direktes ALTER TABLE.**

| Zweck | Befehl |
|-------|--------|
| Migration erstellen (Dev) | `cd apps/dashboard && bunx prisma migrate dev --name <name>` |
| Migration deployen (Prod) | `cd apps/dashboard && bunx prisma migrate deploy` |
| Client neu generieren | `cd apps/dashboard && bunx prisma generate` |
| DB-Status prüfen | `cd apps/dashboard && bunx prisma migrate status` |
| Schema push ohne History | `cd apps/dashboard && bunx prisma db push` |

- Nach Schema-Änderungen in `schema.prisma` immer `prisma generate` ausführen
- `prisma generate` braucht keine DB-Verbindung; `migrate dev/deploy` braucht `DATABASE_URL`
- Unique Indexes → `DROP INDEX`, nicht `DROP CONSTRAINT`

## Stack-Konzept (SDK `wetrack-dashboard`)

Ein Stack ist der Root-Container. Er wird als TypeScript-Datei im User-Repo definiert und via `wetrack-cli deploy` gepusht.

```typescript
import { Stack, Dashboard, DataSource, Query, Chart } from "wetrack-dashboard";

export default new Stack("saas-metrics", "PRODUCTION")
  .addDashboard(new Dashboard("overview", { label: "SaaS Metrics" }))
  .addDataSource(new DataSource("api", {
    type: "rest",
    config: { url: "https://api.example.com/metrics", method: "get" },
  }))
  .addQuery(new Query("all-data", {
    type: "jsonpath",
    dataSource: "api",
    jsonPath: "$[*]",
  }))
  .addChart(new Chart("revenue-chart", {
    dashboard: "overview",
    query: "all-data",
    label: "MRR",
    type: "line",
    config: { xField: "month", valueFields: ["mrr"] },
  }));
```

**Keys** sind kebab-case, müssen pro Stack eindeutig sein.

## Chart-Typen

| Typ | Pflicht-Config | Optional |
|-----|---------------|---------|
| `bar` | `categoryField`, `valueFields[]` | `orientation`, `stacked`, `showLabels`, `colors[]` |
| `line` | `xField`, `valueFields[]` | `showDots`, `filled`, `colors[]` |
| `stat` | `valueField` | `unit`, `decimals`, `color` |
| `clock` | — | `timeZone` (IANA), `showHours`, `showMinutes`, `showSeconds` |

**Farben:** CSS-Vars `var(--chart-1)` bis `var(--chart-5)` bevorzugen.

## Query-Typen

```typescript
// JSONPath
new Query("filtered", { type: "jsonpath", dataSource: "api", jsonPath: "$.items[*]" })

// SQL (Tabelle ist immer ?)
new Query("grouped", { type: "sql", sourceQuery: "filtered", sql: "SELECT month, SUM(revenue) FROM ? GROUP BY month" })
```

Chaining: `sourceQuery` statt `dataSource` wenn Input eine andere Query ist.

## Layout (12-Spalten-Grid)

```typescript
layout: { x: 0, y: 0, w: 6, h: 3 }  // explizit
// layout weglassen → Auto-Layout (links→rechts, neue Zeile wenn voll)
```

Typische Größen: Stat `w:3,h:1` · Halbes Dashboard `w:6,h:3` · Voll `w:12,h:3`

## neuen Chart-Typ hinzufügen

1. Typ + Config in SDK (`wetrack-dashboard`) ergänzen
2. Zod-Schema in `apps/dashboard/schemas/dashboard.ts` ergänzen
3. React-Widget in `apps/dashboard/components/widgets/` erstellen
4. In `apps/dashboard/app/(secure)/dashboard/[dashboardId]/page.tsx` registrieren

## Development

```bash
bun install                         # Dependencies
cd apps/dashboard && bun dev        # Nur Dashboard App (Port 3000)
bun dev                             # Alle Apps (Turborepo)
bun run check-types                 # TypeScript prüfen
bun run lint                        # Lint
```

## Skills (AGENTS.md für Details)

| Skill | Wann |
|-------|------|
| `clerk-nextjs-patterns` | Middleware, Server Actions, Caching mit Clerk |
| `clerk-backend-api` | Clerk Org/User/Membership API |
| `clerk-custom-ui` | Sign-In/Sign-Up UI, Appearance |
| `cypress` | E2E Tests |
| `shadcn` | UI-Komponenten hinzufügen |
| `prisma-cli` | Migrations, DB-Operationen |
| `prisma-postgres` | Prisma + PostgreSQL/Neon |
