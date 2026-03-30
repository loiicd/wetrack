# WeTrack — Vorgehen (Autonomer Bauplan)

> Dieses Dokument definiert exakt was gebaut werden muss, in welcher Reihenfolge,
> und was ich autonom tun kann vs. was menschliche Aktion erfordert.

---

## Ehrliche Einschätzung

**Was ich autonom erledigen kann:** Alle Code-Änderungen in allen 3 Repos — 100%.

**Was zwingend menschliche Aktion braucht (Infrastructure):**

| Schritt | Warum |
|---------|-------|
| `npm publish wetrack-dashboard` | Braucht npm-Token / 2FA |
| `npm publish wetrack-cli` | Braucht npm-Token / 2FA |
| Vercel: Projekte anlegen & deployen | Braucht Vercel-Account |
| Vercel: Environment Variables setzen | Braucht Vercel-Account |
| Clerk: Billing-Pläne konfigurieren | Braucht Clerk-Dashboard |
| Neon/Supabase: Datenbank anlegen | Braucht Account |
| DNS: wetrack.dev / app.wetrack.dev | Braucht Domain-Zugang |

**Alles andere = ich mache es.**

---

## Aktueller Code-Stand (nach Analyse)

### ✅ Bereits fertig
- SDK Klassen (`Stack`, `Dashboard`, `DataSource`, `Query`, `Chart`) — vollständig
- CLI Commands (`synth`, `deploy`, `validate`) — vollständig
- Dashboard Viewer (List + Detail + Charts) — funktional
- Credential Vault (DB-Model + AES-256-GCM Encryption) — gespeichert, aber nicht genutzt
- Onboarding Modal (3-Schritt) — fertig
- Empty State bei keinen Dashboards — fertig
- Prisma Schema — vollständig
- Docs-Site Shell (Fumadocs) — existiert, hat bereits Basis-Content
- Landing Page — existiert, needs redesign

### ❌ Noch nicht fertig / Bugs
1. **Credential Injection** — gespeichert aber NICHT in REST-Calls injiziert (MVP-Blocker)
2. **Method-Enum zu restriktiv** — `RestApiConfigSchema` erlaubt nur `"get"`, kein `"post"` / `"put"`
3. **SDK ohne Credential-Feld** — `DataSource` hat kein `credential` Feld
4. **Environment-Filter im Viewer** — kein Tab/Dropdown für PRODUCTION/STAGING/DEVELOPMENT
5. **Refresh-Interval** — nur ein Button, kein Dropdown mit Optionen (30s/1min/5min/15min/1h)
6. **Altlast** — `packages/dashboard` und `packages/cli` im Monorepo noch vorhanden
7. **Package-Namen** — CLI und Docs nutzen noch `dashboard_as_code` statt `wetrack-dashboard`
8. **Landing Page** — muss komplett neu designed werden
9. **`private: true`** — wetrack-cli kann nicht auf npm published werden

---

## Reihenfolge der Arbeit

### PHASE 1 — SDK (`wetrack-dashboard`) updaten

**Warum zuerst:** Alle anderen Teile (CLI, Backend) hängen vom SDK ab.

**Repo:** `wetrack-dashboard`

#### 1.1 `credential` Feld zu DataSource hinzufügen

**Datei:** `src/types/datasource.ts`
```typescript
// Vorher:
export type RestDataSourceConfig = {
  url: string;
  method: "get" | "post" | "put";
  headers?: Record<string, string>;
  body?: unknown;
};

// Nachher:
export type RestDataSourceConfig = {
  url: string;
  method: "get" | "post" | "put";
  headers?: Record<string, string>;
  body?: unknown;
  credential?: string;  // Label-Referenz aus Vault — kein Wert, nie im Code
};
```

**Datei:** `src/schemas.ts`
```typescript
// In dataSourceConfigSchema:
credential: z.string().optional(),  // Vault-Referenz hinzufügen
```

#### 1.2 Method-Enum fixen

Prüfen ob in `src/schemas.ts` method auf `z.enum(["get", "post", "put"])` gesetzt ist.

#### 1.3 JSDoc verbessern

Auf `credential` und auf allen public API-Klassen vollständige JSDoc-Kommentare für LLM-Readiness.

#### 1.4 Build verifizieren

```bash
cd wetrack-dashboard && bun run build
```

---

### PHASE 2 — Backend: Credential Injection implementieren

**Repo:** `wetrack`

**Das ist der MVP-Blocker. Muss 100% korrekt sein.**

#### 2.1 RestApiConfig Schema fixen

**Datei:** `apps/dashboard/schemas/configs/restApiConfig.ts`

```typescript
// Vorher:
method: z.enum(["get"]),

// Nachher:
method: z.enum(["get", "post", "put"]),
credential: z.string().optional(),
```

#### 2.2 DataSource DB-Interface updaten

**Datei:** `apps/dashboard/lib/database/dataSource.ts`

`getById` muss `stack.orgId` mit zurückgeben (für Credential-Lookup).
Prisma-Query mit `include: { stack: { select: { orgId: true } } }` ergänzen.

#### 2.3 Credential Injection in `getChartData.ts`

**Datei:** `apps/dashboard/lib/workflows/getChartData.ts`

Flow:
1. DataSource laden (inkl. `stack.orgId`)
2. Config parsen
3. Wenn `config.credential` gesetzt: Credential aus DB laden + entschlüsseln
4. Je nach `credential.type` den richtigen Auth-Header bauen:
   - `bearer` → `Authorization: Bearer <value>`
   - `api-key` → `X-Api-Key: <value>`
   - `basic` → `Authorization: Basic <base64(value)>`
   - `header` → Custom Header via `credential.headerName`
5. Header in `fetch()` injizieren
6. Klarer Fehler wenn Credential nicht gefunden (kein 500)

#### 2.4 Deployment Workflow: credential im Stack speichern

**Datei:** `apps/dashboard/lib/workflows/main.ts`

Prüfen ob `credential` Feld beim DataSource-Upsert korrekt gespeichert wird.
Das `config` JSON-Feld in der DB muss `credential` enthalten.

---

### PHASE 3 — UI: Environment-Filter & Refresh-Dropdown

**Repo:** `wetrack`

#### 3.1 Environment-Filter im Dashboard-Viewer

**Konzept:**
- Dashboard-Key existiert potenziell in mehreren Stacks (PRODUCTION, STAGING, DEVELOPMENT)
- Liste zeigt Dashboards gruppiert nach Key (nicht nach Stack)
- In der Detailansicht: Tabs oder Dropdown `PRODUCTION | STAGING | DEVELOPMENT`
- Nur Environments anzeigen die für dieses Dashboard existieren

**Technische Umsetzung:**
- Dashboard-List-Query gruppiert nach `dashboard.key`, gibt verfügbare Environments zurück
- URL-Parameter `?env=PRODUCTION` für aktive Environment
- Bei Env-Wechsel: Seite neu laden mit neuem `?env=` Parameter (Server Component)

**Dateien:**
- `apps/dashboard/app/(secure)/dashboard/page.tsx` — Dashboard-Liste mit Env-Badges
- `apps/dashboard/app/(secure)/dashboard/[dashboardId]/page.tsx` — Env-Tab/Dropdown
- `apps/dashboard/lib/database/dashboard.ts` — Query mit Env-Gruppierung

#### 3.2 Refresh-Dropdown ersetzen

**Datei:** `apps/dashboard/components/dashboard/refreshDashboardButton.tsx`

Aktuell: einfacher Refresh-Button.
Ziel: Dropdown mit Optionen `30s | 1min | 5min | 15min | 1h`, Default `5min`.

**Technische Umsetzung:**
- Client Component mit `useEffect` + `setInterval`
- Interval-State im Component (kein Backend — nur Frontend-Polling)
- Bei Intervall-Ablauf: `router.refresh()` aufrufen (Next.js)
- Nur aktiv wenn Tab fokussiert (`document.visibilityState === "visible"`)

---

### PHASE 4 — Monorepo Cleanup

**Repo:** `wetrack`

#### 4.1 Altlast löschen

```bash
rm -rf wetrack/packages/dashboard
rm -rf wetrack/packages/cli
```

`turbo.json` und Root `package.json` prüfen ob Referenzen auf diese Packages vorhanden sind → entfernen.

#### 4.2 Package-Namen fixen

**Dateien die `dashboard_as_code` noch verwenden:**
- `apps/documentation/content/docs/*.mdx` — alle Code-Beispiele auf `wetrack-dashboard` updaten
- Landing Page wird in Phase 5 komplett neu gemacht

---

### PHASE 5 — CLI updaten

**Repo:** `wetrack-cli`

#### 5.1 Dependency von `dashboard_as_code` auf `wetrack-dashboard` umstellen

**Datei:** `package.json`
```json
"dependencies": {
  "commander": "^12.1.0",
  "wetrack-dashboard": "^1.0.0"
}
```

**Alle Imports in src/ updaten:**
- `src/commands/deploy.ts`: `import type { Stack } from "wetrack-dashboard"`
- `src/commands/synth.ts`: gleich
- `src/commands/validate.ts`: `import { stackSchema } from "wetrack-dashboard/schemas"`
- `src/index.ts`: prüfen

⚠️ **Vor npm publish:** `wetrack-dashboard` muss bereits auf npm sein, sonst schlägt `npm install` fehl.
Während der Entwicklung: `npm link` oder lokaler Pfad (`"wetrack-dashboard": "file:../wetrack-dashboard"`).

#### 5.2 `private: true` entfernen

**Datei:** `package.json`
```json
// "private": true,  ← entfernen
```

#### 5.3 README updaten

Alle Code-Beispiele von `dashboard_as_code` auf `wetrack-dashboard` umstellen.
Default URL in Beispielen auf `https://app.wetrack.dev/api/dashboard`.

---

### PHASE 6 — Landing Page Redesign

**Repo:** `wetrack` (`apps/landing`)

**Komplett neu designed.** Die bisherige Seite wird ersetzt.

**Muss enthalten:**
- Hero: Tagline + Code-Beispiel (mit `wetrack-dashboard`)
- Features: Code-first, Type-safe, CI/CD, AI-ready (4 Kacheln)
- Pricing: Free / Pro (€29) / Enterprise
- CTA: "Get started" → `https://app.wetrack.dev/signUp`
- CTA: "Docs" → `https://docs.wetrack.dev`
- Footer: Links zu GitHub (SDK + CLI), Docs, Legal

**Design-Entscheidungen (autonom):**
- Gleiches Tailwind + shadcn/ui Setup wie App
- Dark-mode-first (passt zum Developer-Fokus)
- Code-Snippet mit Syntax-Highlighting (shiki oder highlight.js)
- Minimal, clean, keine Animation-Overload

---

### PHASE 7 — Dokumentation finalisieren

**Repo:** `wetrack` (`apps/documentation`)

Basis-Content existiert bereits in `content/docs/`. Muss geupdated werden:

| Datei | Status | Was zu tun |
|-------|--------|-----------|
| `index.mdx` | Exists | Package-Namen + URLs fixen, Credential-Workflow ergänzen |
| `sdk-reference.mdx` | Exists | `credential` Feld in DataSource ergänzen, alle Beispiele auf `wetrack-dashboard` |
| `cli-reference.mdx` | Exists | Default-URL aktualisieren, Beispiele fixen |
| `credential-vault.mdx` | Missing | Neu erstellen: `.env`-Analogie, Typen, Code-Beispiel |
| `ci-cd.mdx` | Missing | Neu erstellen: GitHub Actions Beispiel |
| `chart-types.mdx` | Missing | Neu erstellen: alle 4 Typen mit Config-Referenz |

---

### PHASE 8 — Infrastructure (BEREITS EINGERICHTET ✅)

Diese Schritte kann ich nicht autonom ausführen:

#### 8.1 npm publish

```bash
# wetrack-dashboard
cd wetrack-dashboard
npm publish --access public

# wetrack-cli (nach wetrack-dashboard publish)
cd wetrack-cli
npm publish --access public
```

#### 8.2 Vercel Setup

Drei separate Vercel-Projekte:

| Projekt | Root Directory | URL |
|---------|---------------|-----|
| wetrack-app | `apps/dashboard` | app.wetrack.dev |
| wetrack-landing | `apps/landing` | wetrack.dev |
| wetrack-docs | `apps/documentation` | docs.wetrack.dev |

**Build Commands (Turbo):**
- App: `cd ../.. && bun run build --filter=dashboard`
- Landing: `cd ../.. && bun run build --filter=landing`
- Docs: `cd ../.. && bun run build --filter=documentation`

**Environment Variables (App):**

| Variable | Wert |
|----------|------|
| `DATABASE_URL` | PostgreSQL Connection String (direkt, non-pooled für Prisma) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk Publishable Key |
| `CLERK_SECRET_KEY` | Clerk Secret Key |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/signIn` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/signUp` |
| `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` | `/` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` | `/` |
| `VAULT_SECRET` | `openssl rand -base64 32` |

#### 8.3 Datenbank-Migration nach Deploy

```bash
DATABASE_URL=<url> npx prisma migrate deploy
```

#### 8.4 Clerk konfigurieren

1. Neues Clerk-Projekt → Keys kopieren
2. User & Authentication → **Organizations aktivieren**
3. User & Authentication → API Keys → **Enable**
4. Billing → Pläne anlegen (für MVP: alles auf Free lassen, Gates offen)

---

## Technische Entscheidungen (autonom)

Diese Entscheidungen treffe ich selbst, kein Input nötig:

| Entscheidung | Wahl | Begründung |
|-------------|------|-----------|
| Auto-Layout Algorithmus | 6 Spalten Breite pro Chart, max 2 pro Zeile | Vernünftiger Default, gut lesbar |
| Refresh-Dropdown Position | Oben rechts in Dashboard-Toolbar | Dort erwartet man Steuerelemente |
| Environment-Filter UI | Segmented Control / Tabs unter dem Dashboard-Titel | Klar, wenig Platz verbraucht |
| Error-State Design | Icon + kurze Message + "Retry" Link | Minimal, informativ |
| Docs Code-Highlighting | Fumadocs built-in (shiki) | Bereits im Stack |
| Landing Dark Mode | Dark-first, Light als Option via next-themes | Developer-Zielgruppe |
| Credential Error Message | "Credential 'label' not found. Add it in Settings → Credentials." | Actionable |

---

## Reihenfolge-Übersicht

```
Phase 1: SDK (wetrack-dashboard)          ~ 1h
  → credential Feld, method fix, JSDoc, build

Phase 2: Backend Credential Injection     ~ 2h
  → RestApiConfig, getChartData, DB-Interface

Phase 3: UI Improvements                  ~ 2h
  → Environment-Filter, Refresh-Dropdown

Phase 4: Monorepo Cleanup                 ~ 30min
  → packages löschen, Refs entfernen

Phase 5: CLI updaten                      ~ 1h
  → Dependency update, README, private entfernen

Phase 6: Landing Page Redesign            ~ 2h
  → Komplett neu

Phase 7: Dokumentation                    ~ 2h
  → Bestehende updaten, neue Seiten erstellen

Phase 8: Infrastructure                   ← MENSCHLICHE AKTION
  → npm publish, Vercel, Clerk, DB

Gesamt Code-Arbeit: ~10-11h
```

---

## Risiken & Fallbacks

| Risiko | Fallback |
|--------|---------|
| `unstable_cache` in Next.js 16 + Credential Injection — Cache invalidiert nicht wenn Credential geändert wird | Cache-Tag `credential:<orgId>:<label>` hinzufügen, bei Credential-Update revalidieren |
| `getChartData` ist Server-only — kein orgId-Zugriff ohne DB-Join | DataSource-Query mit `stack: { select: { orgId: true } }` joinen |
| `wetrack-dashboard` noch nicht auf npm wenn CLI gebaut wird | Während Dev: `"wetrack-dashboard": "file:../wetrack-dashboard"` in CLI package.json |
| Environment-Filter: Dashboard existiert nur in PRODUCTION, nicht in STAGING | Nur vorhandene Environments im Tab anzeigen, nicht-vorhandene deaktivieren |
| Turbo baut `packages/dashboard` noch nach Löschung | `turbo.json` und Root `package.json` `workspaces` bereinigen |
