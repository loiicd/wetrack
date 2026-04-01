# WeTrack – AI Agent Guide

## ⚡ Skills – IMMER zuerst lesen

Dieses Projekt hat spezialisierte **Skills** installiert. **Vor jeder relevanten Arbeit MÜSSEN diese Skills gelesen und angewendet werden.**

```bash
# Verfügbare Skills prüfen
npx skills list
```

| Skill | Wann nutzen |
|-------|-------------|
| `clerk-custom-ui` | Custom Sign-In/Sign-Up UI, Appearance, Themes |
| `clerk-nextjs-patterns` | Middleware, Server Actions, Caching mit Clerk |
| `clerk-backend-api` | Clerk Backend API (Orgs, User, Memberships) |
| `clerk` | Allgemeine Clerk-Integration, Setup |
| `cypress` | E2E Tests mit Cypress |
| `shadcn` | shadcn/ui Komponenten hinzufügen/konfigurieren |
| `prisma-cli` | Prisma Migrations, DB-Operationen |
| `prisma-postgres` | Prisma mit PostgreSQL/Neon |

**Regel:** Wenn du an Auth-Code arbeitest → `clerk-*` Skills lesen. Wenn du E2E Tests schreibst → `cypress` Skill lesen. Wenn du UI-Komponenten hinzufügst → `shadcn` Skill lesen.

```bash
# Skill-Inhalte lesen (Beispiel)
cat .agents/skills/clerk-custom-ui/skill.md
cat .agents/skills/cypress/skill.md
```

---

WeTrack ist eine **Dashboard-as-Code** Plattform. Dashboards, Charts, DataSources und Queries werden als TypeScript-Code im Repository definiert, mit dem CLI synthetisiert und über eine REST-API in die laufende Next.js-App deployed.

---

## Monorepo-Struktur

```
wetrack/
├── apps/
│   ├── dashboard/          # Next.js App (Haupt-App, Port 3000)
│   ├── documentation/      # Fumadocs-Dokumentationssite
│   └── landing/            # Landing Page
├── packages/
│   ├── dashboard/          # SDK: dashboard_as_code (Stack, Chart, …)
│   ├── cli/                # WeTrack CLI (wetrack synth / deploy)
│   ├── ui/                 # Shared UI-Komponenten (shadcn/ui)
│   ├── eslint-config/      # Shared ESLint-Konfiguration
│   └── typescript-config/  # Shared tsconfig-Basis
└── turbo.json              # Turborepo Build-Graph
```

**Packagemanager:** Bun  
**Build-System:** Turborepo  
**Framework der Haupt-App:** Next.js 15 (App Router)  
**ORM:** Prisma (SQLite in Entwicklung)  
**Styling:** Tailwind CSS v4 + shadcn/ui

---

## Core-Konzepte

### 1. Stack

Ein `Stack` ist der Root-Container. Er enthält alle Ressourcen und wird als Default-Export in einer `.ts`-Datei definiert.

```typescript
import { Stack } from "dashboard_as_code";
export default new Stack("my-stack", "PRODUCTION");
```

**Environments:** `"PRODUCTION"` | `"STAGING"` | `"DEVELOPMENT"`

### 2. Dashboard

Container für Charts. Jedes Dashboard hat ein eigenes Grid (12 Spalten).

```typescript
import { Dashboard } from "dashboard_as_code";

const myDashboard = new Dashboard("sales-dashboard", {
  label: "Sales Dashboard",
  description: "Übersicht der Verkaufszahlen", // optional
});
```

### 3. DataSource

Externe Datenquelle. Aktuell wird `rest` (HTTP GET) unterstützt.

```typescript
import { DataSource } from "dashboard_as_code";

const salesApi = new DataSource("sales-api", {
  type: "rest",
  config: {
    url: "https://api.example.com/sales",
    method: "get",
  },
});
```

### 4. Query

Transformiert Daten einer DataSource. Zwei Typen:

**JSONPath** – filtert/selektiert aus JSON:

```typescript
import { Query } from "dashboard_as_code";

const allItems = new Query("all-items", {
  type: "jsonpath",
  dataSource: salesApi.key, // oder sourceQuery: otherQuery.key
  jsonPath: "$[*]",
});
```

**SQL** – führt SQL auf einem Datensatz aus (Tabelle ist immer `?`):

```typescript
const topSales = new Query("top-sales", {
  type: "sql",
  sourceQuery: allItems.key, // oder dataSource: salesApi.key
  sql: "SELECT product, SUM(revenue) AS total FROM ? GROUP BY product ORDER BY total DESC LIMIT 10",
});
```

> Queries können gestapelt werden: Eine SQL-Query kann eine JSONPath-Query als `sourceQuery` nutzen.

### 5. Chart

Visuelles Element innerhalb eines Dashboards. Vier Typen:

#### Bar Chart

```typescript
import { Chart } from "dashboard_as_code";

new Chart("sales-bar", {
  dashboard: myDashboard.key,
  source: topSales, // Query oder DataSource
  label: "Top 10 Produkte",
  type: "bar",
  config: {
    categoryField: "product", // Pflichtfeld: Kategorie-Achse
    valueFields: ["total"], // mind. 1 Wert-Feld; mehrere = Gruppen
    orientation: "vertical", // "vertical" | "horizontal"
    stacked: false, // Bars stapeln
    showLabels: true, // Werte an Bars anzeigen
    showTooltip: true,
    colors: ["var(--chart-1)"], // optional; CSS-Farbe oder CSS-Var
    showCard: true,
  },
  layout: { x: 0, y: 0, w: 6, h: 3 },
});
```

#### Line Chart

```typescript
new Chart("revenue-line", {
  dashboard: myDashboard.key,
  source: topSales,
  label: "Umsatz über Zeit",
  type: "line",
  config: {
    xField: "month",
    valueFields: ["revenue", "profit"], // eine Linie pro Feld
    showDots: true,
    filled: false,
    showTooltip: true,
    showLabels: false,
    colors: ["var(--chart-1)", "var(--chart-2)"],
    showCard: true,
  },
  layout: { x: 6, y: 0, w: 6, h: 3 },
});
```

#### Stat Card

```typescript
new Chart("total-revenue-stat", {
  dashboard: myDashboard.key,
  source: totalRevenueQuery,
  label: "Gesamtumsatz",
  type: "stat",
  config: {
    valueField: "total",
    unit: "€",
    decimals: 2,
    color: "var(--chart-1)",
    showCard: true,
  },
  layout: { x: 0, y: 3, w: 3, h: 1 },
});
```

#### Clock Card

```typescript
new Chart("berlin-clock", {
  dashboard: myDashboard.key,
  label: "Berlin",
  type: "clock",
  config: {
    timeZone: "Europe/Berlin", // IANA-Timezone; undefined = lokale Zeit
    labelFormat: "city", // "city" | "offset" | "abbreviation" | "full" | "raw"
    showHours: true,
    showMinutes: true,
    showSeconds: true,
    showCard: true,
  },
  layout: { x: 0, y: 0, w: 3, h: 1 },
});
```

> Clocks haben **keine** `source` (sie brauchen keine Daten).

---

## Layout-System

Das Grid hat **12 Spalten**. Koordinaten beginnen bei (0, 0).

| Feld | Typ   | Beschreibung             |
| ---- | ----- | ------------------------ |
| `x`  | `int` | Spalte (0–11)            |
| `y`  | `int` | Zeile (0 = oben)         |
| `w`  | `int` | Breite in Spalten (1–12) |
| `h`  | `int` | Höhe in Einheiten (≥ 1)  |

Typische Größen:

- Kleines Stat-Widget: `w: 3, h: 1`
- Halbes Dashboard: `w: 6, h: 3`
- Volle Breite: `w: 12, h: 3`

---

## Stack zusammenbauen

```typescript
import { Stack, Dashboard, DataSource, Query, Chart } from "dashboard_as_code";

const api = new DataSource("api", {
  type: "rest",
  config: { url: "…", method: "get" },
});
const dash = new Dashboard("main", { label: "Main Dashboard" });
const allData = new Query("all", {
  type: "jsonpath",
  dataSource: api.key,
  jsonPath: "$[*]",
});
const chart = new Chart("chart-1", {
  dashboard: dash.key,
  source: allData,
  label: "Chart",
  type: "bar",
  config: {
    categoryField: "id",
    valueFields: ["value"],
    orientation: "vertical",
  },
  layout: { x: 0, y: 0, w: 12, h: 3 },
});

export default new Stack("my-stack", "PRODUCTION")
  .addDashboard(dash)
  .addDataSource(api)
  .addQuery(allData)
  .addChart(chart);
```

**Wichtig:** Jeder `key` (Stack, Dashboard, DataSource, Query, Chart) muss **eindeutig** sein. Duplikate werfen einen Fehler.

---

## CLI

```bash
# Stack synthetisieren (TypeScript → JSON)
wetrack synth path/to/stack.ts

# JSON in Datei ausgeben
wetrack synth path/to/stack.ts -o output.json

# Stack synthetisieren & deployen
wetrack deploy path/to/stack.ts

# Deploy mit expliziter API-URL
wetrack deploy path/to/stack.ts --url https://my-dashboard.example.com/api/dashboard

# Nur testen, nichts deployen
wetrack deploy path/to/stack.ts --dry-run
```

Standard-API-URL für `deploy`: `http://localhost:3000/api/dashboard`

---

## API-Endpunkt

```
POST /api/dashboard
Content-Type: application/json
Body: <synthesized stack JSON>
```

Antwort: `200 OK` → Stack wurde verarbeitet und gespeichert.

Das JSON entspricht dem Output von `stack.synthesize()` / `wetrack synth`.

---

## Prisma / Datenbank

- Schema: `apps/dashboard/prisma/schema.prisma`
- Nach Schema-Änderungen: `npx prisma db push` (Dev) oder Migration erstellen
- Client wird generiert nach: `apps/dashboard/generated/prisma/`

---

## Entwicklung

```bash
# Alle Packages installieren
bun install

# Dashboard-App starten (Port 3000)
cd apps/dashboard && bun dev

# Alle Apps starten
bun dev

# TypeScript-Typen prüfen
bun run typecheck

# Linting
bun run lint
```

---

## Wichtige Dateipfade

| Pfad                                        | Inhalt                             |
| ------------------------------------------- | ---------------------------------- |
| `packages/dashboard/src/`                   | SDK-Klassen (Stack, Chart, …)      |
| `packages/dashboard/types/`                 | TypeScript-Typen des SDK           |
| `packages/cli/src/`                         | CLI-Commands                       |
| `apps/dashboard/schemas/dashboard.ts`       | Zod-Validierungsschemas            |
| `apps/dashboard/lib/workflows/main.ts`      | Deploy-Workflow (DB-Persistierung) |
| `apps/dashboard/app/api/dashboard/route.ts` | API-Route Handler                  |
| `apps/dashboard/prisma/schema.prisma`       | Datenbank-Schema                   |
| `apps/dashboard/example/stack.ts`           | Vollständiges Beispiel-Stack       |

---

## Häufige Aufgaben für AI-Agents

### Neuen Stack erstellen

1. Neue `.ts`-Datei anlegen (z.B. in `example/` oder im User-Projekt)
2. DataSources, Dashboards, Queries, Charts definieren
3. `export default new Stack(...)` mit allem verknüpft via Fluent-API
4. Mit `wetrack deploy path/to/stack.ts` deployen

### Neuen Chart-Typ hinzufügen

1. Typen in `packages/dashboard/types/chart.ts` ergänzen
2. Zod-Schema in `apps/dashboard/schemas/dashboard.ts` ergänzen
3. React-Komponente in `apps/dashboard/components/charts/` erstellen
4. In `apps/dashboard/components/chartWrapper.tsx` registrieren

### API erweitern

- Workflow-Logik: `apps/dashboard/lib/workflows/main.ts`
- DB-Helfer: `apps/dashboard/lib/database/`
- API-Route: `apps/dashboard/app/api/`

---

## Konventionen

- **Keys** sind kebab-case Strings, z.B. `"sales-dashboard"`, `"revenue-query"`
- **Farben** in Chart-Configs: CSS-Vars wie `var(--chart-1)` bis `var(--chart-5)` bevorzugen
- **Imports** aus dem SDK immer via `"dashboard_as_code"` (Package-Alias aus `packages/dashboard`)
- **TypeScript** durchgehend – keine `.js`-Dateien im Source-Code
- **Kein** `layout` zwingend – wird weggelassen wenn `undefined` (automatisches Layout)
