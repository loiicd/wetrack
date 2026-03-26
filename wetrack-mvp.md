# WeTrack — MVP Requirements

> **Stand:** März 2026
> **URLs:** `wetrack.dev` (Landing) · `app.wetrack.dev` (App) · `docs.wetrack.dev` (Docs)
> **Produkt-Typ:** SaaS für Entwickler — Dashboard-as-Code

---

## 1. Vision & Problem

### Das Problem

Dashboards veralten. Sie werden einmal gebaut und danach nicht mehr aktualisiert, weil der Prozess manuell und von der eigentlichen Entwicklung entkoppelt ist. Bestehende Dashboard-as-Code Ansätze (Grafana-as-Code etc.) nutzen YAML oder JSON — schlechte DX, fehleranfällig, keine Typ-Sicherheit, für LLMs schwer zu schreiben.

### Die Lösung

**Dashboards leben im Repo — versioniert, reviewbar, CI/CD-fähig.**

TypeScript statt YAML: type-sicher, IDE-Support, AI-agent-ready. LLMs können TypeScript sehr gut schreiben und lesen — das macht Dashboards zum ersten Mal wirklich automatisierbar.

**Fokus für MVP:** Einfachheit. Nicht die mächtigsten Dashboards, sondern die einfachsten die funktionieren und gut aussehen.

### Tagline

> *Your dashboards live in your repo.*

---

## 2. Zielgruppe

| Priorität | Nutzer | Use Case |
|-----------|--------|----------|
| **Primär** | Solo-Entwickler / Indie Hacker | Schnelle interne Dashboards ohne Setup-Aufwand |
| **Sekundär** | Startup Engineering Teams (2–10 Devs) | Team-Dashboards mit Rollentrennung, CI/CD-deployed |

**Fokus Use Case:** Monitoring & Observability — Metriken, Errors, API-Stats, Service Health.
**Nicht im Fokus:** Marketing Analytics, Business Intelligence, No-Code User.

---

## 3. Produkt-Struktur (3 Repos)

```
wetrack-dashboard   npm package — open source SDK (MIT)
       ↓  wird importiert in
wetrack-cli         npm package — open source CLI (MIT)
       ↓  HTTP POST
wetrack             privates Backend — Next.js App auf app.wetrack.dev
```

**Altlast entfernen:** `packages/dashboard` (`dashboard_as_code`) und `packages/cli` im Monorepo `wetrack` werden **gelöscht**. Die standalone Repos sind die Zukunft.

---

## 4. Der Core Flow

```
Repo
└── dashboards/
    └── metrics.ts        ← Entwickler schreibt TypeScript

          ↓  git push

GitHub Actions:
  - run: npx wetrack-cli deploy dashboards/metrics.ts
    env:
      WETRACK_API_KEY: ${{ secrets.WETRACK_API_KEY }}

          ↓  HTTP POST → app.wetrack.dev/api/dashboard

app.wetrack.dev/dashboard/[uuid]   ← Dashboard ist live
```

**Das ist der MVP. Alles andere ist sekundär.**

---

## 5. Rollen & Berechtigungen

| Rolle | Rechte |
|-------|--------|
| **Viewer** | Alle Dashboards der Org ansehen |
| **Developer** | Alles außer Team-Management und Billing |
| **Admin** | Alles — Team, Billing, Credentials, API Keys |

**Org-Regel:** Jeder Nutzer gehört genau einer Organisation. Kein persönlicher Account ohne Org.

**Team-Einladungen:** Admin lädt per E-Mail ein → Nutzer bekommt Link → registriert sich → ist in der Org mit zugewiesener Rolle.

---

## 6. Pricing & Feature Gates

| Plan | Preis | Limits |
|------|-------|--------|
| **Free** | €0 / forever | 1 Org · max. 5 Dashboards · Unlimited Queries · Community Support |
| **Pro** | €29 / Monat | Unlimited Dashboards · Credential Vault · Priority Support |
| **Enterprise** | Custom | Custom Limits · SLA |

**Für MVP gilt:** Billing ist Platzhalter. Feature Gates im Code vorhanden, aber standardmäßig offen. Keine echten Zahlungen im MVP.

Clerk Feature Gates:
- `feature:deploy` — Stack via CLI deployen
- `feature:unlimited_dashboards` — Mehr als 5 Dashboards pro Org
- `feature:credential_vault` — Credentials in DataSources nutzen

---

## 7. SDK: `wetrack-dashboard`

### Ziel-DX

```bash
npm install wetrack-dashboard
```

```typescript
import { Stack, Dashboard, DataSource, Query, Chart } from "wetrack-dashboard";

export default new Stack("saas-metrics", "PRODUCTION")
  .addDashboard(
    new Dashboard("overview", { label: "SaaS Metrics" })
  )
  .addDataSource(
    new DataSource("api", {
      type: "rest",
      config: { url: "https://api.example.com/metrics", method: "get" }
    })
  )
  .addQuery(
    new Query("revenue", {
      type: "jsonpath",
      dataSource: "api",
      jsonPath: "$.metrics[*]"
    })
  )
  .addChart(
    new Chart("revenue-chart", {
      dashboard: "overview",
      source: { _entity: "query", key: "revenue" },
      label: "Monthly Recurring Revenue",
      type: "line",
      config: { xField: "month", valueFields: ["mrr"] }
    })
  );
```

### Klassen & API

**`Stack`**
```typescript
new Stack(key: string, environment: "PRODUCTION" | "STAGING" | "DEVELOPMENT")
  .addDashboard(...dashboards)
  .addDataSource(...dataSources)
  .addQuery(...queries)
  .addChart(...charts)
  .synthesize()   // → vollständiges JSON
```

**`Dashboard`**
```typescript
new Dashboard(key: string, { label: string, description?: string })
```

**`DataSource`**
```typescript
new DataSource(key: string, {
  type: "rest",
  config: {
    url: string,
    method: "get" | "post" | "put",
    headers?: Record<string, string>,
    body?: unknown,
    credential?: string   // Label-Referenz aus Vault — kein Wert, nie im Code
  }
})
```

**`Query`**
```typescript
// JSONPath
new Query(key: string, {
  type: "jsonpath",
  dataSource?: string,    // DataSource key
  sourceQuery?: string,   // andere Query als Input (Chaining)
  jsonPath: string        // z.B. "$.items[*]"
})

// SQL (in-memory alasql)
new Query(key: string, {
  type: "sql",
  dataSource?: string,
  sourceQuery?: string,
  sql: string             // z.B. "SELECT month, SUM(amount) FROM ? GROUP BY month"
})
```

Query-Chaining ist unterstützt: Eine Query kann eine andere Query als Input nutzen (beliebige Tiefe).

**`Chart`**
```typescript
new Chart(key: string, {
  dashboard: string,
  source?: { _entity: "query" | "dataSource", key: string },
  label: string,
  type: "bar" | "line" | "stat" | "clock",
  config: BarConfig | LineConfig | StatConfig | ClockConfig,
  layout?: { x: number, y: number, w: number, h: number }
  // layout weglassen → Auto-Layout
})
```

### Chart-Typen & Configs

| Typ | Pflichtfelder | Optionale Felder |
|-----|--------------|-----------------|
| `bar` | `categoryField`, `valueFields: string[]` | `orientation: "vertical"\|"horizontal"`, `stacked`, `showLabels`, `colors[]` |
| `line` | `xField`, `valueFields: string[]` | `showDots`, `filled`, `colors[]` |
| `stat` | `valueField` | `unit`, `decimals`, `color` |
| `clock` | — | `timeZone` (IANA), `showHours`, `showMinutes` |

### Layout

- **Explizit:** `layout: { x, y, w, h }` — 12-Spalten-Grid
- **Auto-Layout:** `layout` weglassen → WeTrack ordnet Charts automatisch an (links nach rechts, neue Zeile wenn voll)

### Technische Anforderungen

- Zod-Schemas für alle Entitäten (geteilt mit Backend via npm)
- Vollständige TypeScript Types + JSDoc auf allen public APIs
- Subpath Exports: `/chart`, `/query`, `/datasource`, `/stack`, `/schemas`
- Dual Build: ESM (`*.mjs`) + CJS (`*.cjs`) + Types (`*.d.ts`)
- Published auf npm als `wetrack-dashboard@1.0.0`
- Open Source auf GitHub, MIT Lizenz

---

## 8. CLI: `wetrack-cli`

### Installation

```bash
npm install -g wetrack-cli
# oder
bun add -g wetrack-cli
```

### Commands

**`wetrack synth <file>`** — TypeScript → JSON

```bash
wetrack synth dashboards/metrics.ts               # JSON → stdout
wetrack synth dashboards/metrics.ts -o out.json   # JSON → Datei
wetrack synth dashboards/metrics.ts --verbose     # + Summary
```

**`wetrack deploy <file>`** — Synth + HTTP POST

```bash
wetrack deploy dashboards/metrics.ts   # liest WETRACK_API_KEY aus Env
wetrack deploy dashboards/metrics.ts --dry-run    # kein HTTP POST
```

Flags:

| Flag | Env Var | Default | Beschreibung |
|------|---------|---------|-------------|
| `-u, --url` | `WETRACK_URL` | `https://app.wetrack.dev/api/dashboard` | Ziel-URL |
| `-k, --api-key` | `WETRACK_API_KEY` | — | Clerk API Key |
| `--dry-run` | — | false | Nur Synth, kein Deploy |
| `-v, --verbose` | — | false | Response Body anzeigen |

**`wetrack validate <file.json>`** — JSON gegen Schema validieren

### DX-Anforderungen

- Exit Code `0` = Erfolg, `1` = Fehler — CI/CD kompatibel
- Zod-Fehler mit exaktem Pfad: `• charts.0.config.categoryField: Required`
- Default-URL eingebaut → nur `WETRACK_API_KEY` setzen nötig
- Published auf npm als `wetrack-cli@1.0.0`
- Open Source auf GitHub, MIT Lizenz

### GitHub Actions Beispiel (in Docs enthalten)

```yaml
# .github/workflows/deploy-dashboards.yml
name: Deploy WeTrack Dashboards
on:
  push:
    branches: [main]
    paths: ["dashboards/**"]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npx wetrack-cli deploy dashboards/metrics.ts
        env:
          WETRACK_API_KEY: ${{ secrets.WETRACK_API_KEY }}
```

---

## 9. Backend: `app.wetrack.dev`

### 9.1 API Endpoints

| Endpoint | Methode | Auth | Beschreibung |
|----------|---------|------|-------------|
| `/api/dashboard` | POST | Clerk API Key (Bearer) | Stack deployen |
| `/api/credentials` | GET | Clerk Session | Credentials auflisten (ohne Werte) |
| `/api/credentials` | POST | Clerk Session | Credential anlegen (verschlüsselt) |
| `/api/credentials/[label]` | DELETE | Clerk Session | Credential löschen |

**Deploy-Flow (`POST /api/dashboard`):**
1. `Authorization: Bearer <clerk_api_key>` validieren
2. JSON gegen Zod-Schema validieren → bei Fehler: `400` mit `{ error, issues[] }`
3. Feature Gate `feature:deploy` prüfen (MVP: immer erlaubt)
4. Stack + alle Entitäten upserten
5. Entitäten die nicht mehr im Stack sind löschen (Cleanup)
6. `200 OK`

Fehler-Format:
```json
{
  "error": "Validation failed",
  "issues": [
    { "path": ["charts", "0", "config", "categoryField"], "message": "Required" }
  ]
}
```

### 9.2 Credential Vault — **MVP-BLOCKER** ⚠️

Credentials werden aktuell gespeichert und verschlüsselt (AES-256-GCM), aber **nicht** in DataSource REST-Calls injiziert. Das muss für MVP repariert werden — die Landing Page bewirbt dieses Feature bereits.

**Konzept (analog zu `.env`):**
- Im Code: Credential-Label deklarieren — kein Wert, nie im Repo
- In der UI (`/settings/credentials`): Wert setzen, verschlüsselt gespeichert
- Beim Data Fetch: Credential automatisch als HTTP-Header injiziert

| Credential-Typ | HTTP Header |
|---------------|------------|
| `bearer` | `Authorization: Bearer <value>` |
| `api-key` | `X-Api-Key: <value>` |
| `basic` | `Authorization: Basic <base64>` |
| `header` | Custom Header via `headerName` Feld |

**Was implementiert werden muss:**
- `DataSourceConfig` Schema: `credential?: string` ergänzen (SDK + Backend)
- `getChartData.ts`: Credential laden, entschlüsseln, Header setzen wenn `config.credential` gesetzt
- Klare Fehlermeldung wenn Credential nicht gefunden (kein 500)
- Feature Gate `feature:credential_vault` prüfen (MVP: immer erlaubt)

### 9.3 Dashboard Viewer

**URL-Struktur:**
- `/dashboard` — Flache Liste aller Dashboards der Org
- `/dashboard/[uuid]` — Dashboard-Ansicht

**Dashboard-Ansicht:**
- Responsives 12-Spalten-Grid (react-grid-layout, read-only)
- Alle 4 Chart-Typen rendern: Bar, Line, Stat, Clock
- Jeder Chart hat eigenen Error-State (Icon + Fehlermeldung) — Rest des Dashboards bleibt funktional
- **Environment-Filter:** Oben im Dashboard ein Tab/Dropdown `PRODUCTION | STAGING | DEVELOPMENT` — ein Dashboard existiert immer nur einmal, wird aber in der gewählten Environment angezeigt
- **Refresh-Dropdown direkt im Dashboard** (z.B. oben rechts): `30s | 1min | 5min | 15min | 1h` — Default: `5min`
- Refresh nur bei aktiver UI-Nutzung (kein Background-Refresh wenn Tab inaktiv)

**Daten-Pipeline pro Chart:**
1. DataSource REST API aufrufen (mit Credential-Header wenn konfiguriert)
2. JSONPath oder SQL Query ausführen
3. Optional: Query-Chaining
4. Ergebnis als DataFrame an Chart-Komponente übergeben

**Leerer State (keine Dashboards deployed):**
```
Noch keine Dashboards

Dein erstes Dashboard deployen:

  npm install wetrack-dashboard
  wetrack deploy dashboards/metrics.ts

→ Zur Dokumentation
```

### 9.4 Settings

| Seite | Rolle | Funktion |
|-------|-------|----------|
| `/settings/credentials` | Developer + Admin | Credentials listen (Label + Typ, kein Wert), anlegen, löschen |
| `/settings/api-keys` | Developer + Admin | Clerk API Keys für CLI verwalten |
| `/settings/team` | Admin | Mitglieder listen, per E-Mail einladen, Rolle zuweisen, entfernen |
| `/settings/billing` | Admin | Plan anzeigen, Upgrade-CTA (MVP: Platzhalter) |

### 9.5 Auth

- Clerk Login/Signup auf `/signIn` und `/signUp`
- Org zwingend nach Signup (erstellen oder Einladung annehmen)
- CLI Auth: `Authorization: Bearer <clerk_api_key>`
- Kein rein persönlicher Account ohne Org

### 9.6 Onboarding

Signup → Org erstellen → API Key kopieren → fertig. Rest via Docs.

### 9.7 Multi-Stack

Eine Org kann mehrere Stacks haben (z.B. ein Stack pro Microservice). Identifikation via `(key, environment, orgId)`. Wird später per Billing limitiert.

---

## 10. Daten-Refresh

| Parameter | Wert |
|-----------|------|
| Default-Intervall | 5 Minuten |
| Konfigurierbar | Ja, in der UI pro Dashboard |
| Serverseitiger Cache TTL | 60 Sekunden |
| Background Refresh | Nein — nur bei aktiver UI-Nutzung |
| Refresh-Control | Dropdown direkt im Dashboard (oben rechts) |
| Refresh-Optionen | 30s · 1min · 5min · 15min · 1h |

---

## 11. AI-Readiness

**MVP:** TypeScript-Typen + JSDoc — LLMs können das SDK sofort nutzen ohne weitere Konfiguration.

**Post-MVP:** WeTrack MCP Server (Model Context Protocol) — AI Agents können direkt Dashboards deployen, Daten abfragen, Credentials verwalten.

---

## 12. Dokumentation (`docs.wetrack.dev`)

Geht für MVP live. Die Fumadocs-Site (`apps/documentation`) ist ein **leeres Gerüst** — der gesamte Inhalt muss neu geschrieben werden.

Muss enthalten:

- Quickstart (5 Minuten von Signup bis erstem Dashboard)
- SDK Reference — alle Klassen, Felder, Typen
- CLI Reference — alle Commands und Flags
- CI/CD Guide — GitHub Actions Beispiel
- Credential Vault — Konzept + `.env`-Analogie
- Chart Types — Konfigurationsoptionen pro Typ

---

## 13. Landing Page (`wetrack.dev`) — Komplett-Redesign

> ⚠️ Die bestehende Landing Page (`apps/landing`) muss **komplett neu gestaltet** werden.

Muss enthalten:
- Hero mit Tagline + Code-Beispiel (mit korrektem `wetrack-dashboard` Package-Namen)
- Feature-Highlights (Code-first, CI/CD, Type-safe, AI-ready)
- Pricing-Sektion (Free / Pro / Enterprise)
- CTA: "Get started" → `app.wetrack.dev/signUp`
- CTA: "Docs" → `docs.wetrack.dev`

---

## 14. Repo-Hygiene (vor Launch)

**Branch-Cleanup:**

| Repo | Aktion |
|------|--------|
| `wetrack` | `feature/mvp` → `main` mergen |
| `wetrack-cli` | `feature/mvp` → `main` mergen (kein `main` existiert noch) |
| `wetrack-dashboard` | `feature/mvp` → `main` mergen + Default Branch auf `main` setzen |
| Alle | `feature/mvp` Branches nach Merge löschen |

**Altlast löschen:**
- `wetrack/packages/dashboard` löschen
- `wetrack/packages/cli` löschen

**Package-Namen konsistenz + npm public:**

| Datei | Änderung |
|-------|----------|
| `wetrack-cli/package.json` | `"private": true` entfernen |
| `wetrack-dashboard/package.json` | Sicherstellen dass `"private"` nicht gesetzt |
| `wetrack-cli/src/commands/deploy.ts` | Import `dashboard_as_code` → `wetrack-dashboard` |
| `wetrack-cli/src/commands/synth.ts` | Import `dashboard_as_code` → `wetrack-dashboard` |
| `wetrack-cli/README.md` | Alle Code-Beispiele aktualisieren |
| `wetrack/apps/landing/app/page.tsx` | Komplettes Redesign (siehe Abschnitt 13) |

---

## 15. Was bewusst NICHT im MVP ist

| Feature | Status |
|---------|--------|
| Echtes Billing / Stripe | Post-MVP — Platzhalter bleibt |
| Dashboard Drag & Drop in UI | Post-MVP |
| Dashboard Public Sharing / Embed | Post-MVP |
| Data Export (CSV, PDF) | Post-MVP |
| Weitere DataSource-Typen (DB, GraphQL) | Post-MVP |
| Template-Variablen / Dashboard-Filter | Post-MVP |
| Query Scheduling unabhängig vom UI | Post-MVP |
| Audit Logs | Post-MVP |
| Rollback / Deployment History | Git ist die History |
| Offizielles GitHub Action | Post-MVP — Docs zeigen Beispiel |
| WeTrack MCP Server | Post-MVP |
| Enterprise SSO | Nicht geplant |
| Self-Hosting | Nicht geplant |
| Unit & Integration Tests | Technische Schuld — bald nachholen |

---

## 16. Tech Stack

| Schicht | Technologie |
|---------|------------|
| Frontend | Next.js 16 (App Router), React 19, Tailwind CSS 4, shadcn/ui |
| Auth & Billing | Clerk (Orgs, Rollen, API Keys, Billing) |
| Datenbank | PostgreSQL via Prisma 7 (Neon empfohlen) |
| Charts | Recharts 2, react-grid-layout |
| Query Engine | jsonpath-plus (JSONPath), alasql (in-memory SQL) |
| Encryption | AES-256-GCM + PBKDF2 (Credential Vault) |
| Monorepo | Turborepo + Bun 1.2 |
| SDK Build | tsup (ESM + CJS + Types) |
| CLI Runtime | Bun (native TypeScript) |
| Hosting | Vercel — alle 3 Apps |

---

## 17. Definition of Done

**MVP ist fertig wenn alle 3 Domains live sind und dieser vollständige Flow ohne Fehler durchläuft:**

### Schritt 1 — Signup
```
https://app.wetrack.dev/signUp
→ Account erstellen
→ Organisation erstellen
→ Settings > API Keys > API Key generieren und kopieren
```

### Schritt 2 — Setup
```bash
npm install wetrack-dashboard --save-dev
npm install -g wetrack-cli
export WETRACK_API_KEY=sk_live_...
```

### Schritt 3 — Stack schreiben
```typescript
// dashboards/metrics.ts
import { Stack, Dashboard, DataSource, Query, Chart } from "wetrack-dashboard";

export default new Stack("metrics", "PRODUCTION")
  .addDashboard(new Dashboard("main", { label: "Company Metrics" }))
  .addDataSource(new DataSource("api", {
    type: "rest",
    config: { url: "https://api.example.com/stats", method: "get" }
  }))
  .addQuery(new Query("revenue", {
    type: "jsonpath", dataSource: "api", jsonPath: "$.revenue[*]"
  }))
  .addChart(new Chart("revenue-chart", {
    dashboard: "main",
    source: { _entity: "query", key: "revenue" },
    label: "Revenue",
    type: "bar",
    config: { categoryField: "month", valueFields: ["amount"] }
  }));
```

### Schritt 4 — Deploy
```bash
wetrack deploy dashboards/metrics.ts
# ✅ Stack "metrics" (PRODUCTION) synthetisiert
#    Dashboards : 1 · DataSources : 1 · Queries : 1 · Charts : 1
# 🚀 Deploying nach https://app.wetrack.dev/api/dashboard …
# ✅ Deployment erfolgreich (HTTP 200)
```

### Schritt 5 — Dashboard öffnen
```
https://app.wetrack.dev/dashboard/[uuid]
→ Bar Chart "Revenue" lädt live Daten und rendert korrekt
```

### Schritt 6 — Credential Vault
```
Settings > Credentials > Credential "my-api-key" (Typ: bearer) anlegen, Wert setzen
```
```typescript
// DataSource mit Credential-Referenz:
new DataSource("protected-api", {
  type: "rest",
  config: {
    url: "https://api.example.com/protected",
    method: "get",
    credential: "my-api-key"  // deklariert — kein Wert im Code
  }
})
```
```
wetrack deploy dashboards/metrics.ts
→ Chart lädt Daten mit "Authorization: Bearer <value>" Header
```

### Schritt 7 — CI/CD
```yaml
# .github/workflows/dashboards.yml
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npx wetrack-cli deploy dashboards/metrics.ts
        env:
          WETRACK_API_KEY: ${{ secrets.WETRACK_API_KEY }}
```
```
git push → GitHub Action läuft → Dashboard automatisch aktualisiert ✅
```

### Abnahme-Checklist

- [ ] Schritte 1–7 funktionieren ohne Fehler
- [ ] `wetrack.dev` live mit Landing Page und Pricing
- [ ] `app.wetrack.dev` live und vollständig funktional
- [ ] `docs.wetrack.dev` live mit Quickstart und Referenz
- [ ] `wetrack-dashboard@1.0.0` auf npm published (public)
- [ ] `wetrack-cli@1.0.0` auf npm published (public)
- [ ] Alle Repos auf `main` Branch — kein `feature/mvp` als Default mehr
- [ ] Alle `dashboard_as_code` Imports auf `wetrack-dashboard` umgestellt
- [ ] `packages/dashboard` + `packages/cli` aus Monorepo gelöscht
- [ ] Viewer / Developer / Admin Rollen funktionieren korrekt
- [ ] Credential Vault injiziert Auth-Header korrekt in DataSource-Calls
- [ ] Error-State pro Chart bei nicht erreichbarer DataSource
- [ ] Leerer State mit Code-Snippet wenn keine Dashboards deployed
- [ ] Landing Page (`wetrack.dev`) komplett neu gestaltet
- [ ] `docs.wetrack.dev` vollständig befüllt (Quickstart, SDK, CLI, CI/CD, Credentials, Charts)
- [ ] Refresh-Dropdown im Dashboard funktioniert mit korrekten Intervall-Optionen
- [ ] Environment-Filter (PRODUCTION / STAGING / DEVELOPMENT) im Dashboard funktioniert
