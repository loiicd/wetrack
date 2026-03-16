# WeTrack – GitHub Copilot Instructions

## Projekt-Überblick

WeTrack ist eine **Dashboard-as-Code** Plattform. Dashboards werden als TypeScript-Dateien im Repository definiert und über den WeTrack-Stack orchestriert.

Lies `AGENTS.md` im Repo-Root für die vollständige Referenz.

## Wichtigste Regeln

1. **SDK-Imports** immer aus `"dashboard_as_code"`:

   ```typescript
   import {
     Stack,
     Dashboard,
     DataSource,
     Query,
     Chart,
   } from "dashboard_as_code";
   ```

2. **Jeder `key` muss eindeutig** im Stack sein (kebab-case).

3. **Stack-Datei** hat immer einen default-Export:

   ```typescript
   export default new Stack("key", "PRODUCTION")
     .addDashboard(...)
     .addDataSource(...)
     .addQuery(...)
     .addChart(...);
   ```

4. **Queries referenzieren** DataSource über `dataSource: ds.key` oder andere Queries über `sourceQuery: query.key`.

5. **Charts referenzieren** ihr Dashboard über `dashboard: dash.key` und ihre Datenquelle über `source: queryOrDataSource`.

6. **Clocks** haben kein `source`-Feld.

7. **Colors** bevorzugen CSS-Vars: `var(--chart-1)` bis `var(--chart-5)`.

8. **Grid-Koordinaten**: x (0–11), y (≥0), w (1–12), h (≥1).

## Architektur-Kontext

- **`packages/dashboard/src/`** – SDK-Klassen (Stack, Chart, Dashboard, DataSource, Query)
- **`apps/dashboard/schemas/dashboard.ts`** – Zod-Validierungsschemas
- **`apps/dashboard/lib/workflows/main.ts`** – Deploy-Workflow
- **`apps/dashboard/components/charts/`** – React Chart-Komponenten
- **`packages/cli/src/`** – CLI (`wetrack synth`, `wetrack deploy`)

## Chart-Typen auf einen Blick

| Typ     | Pflich-Config-Felder                          |
| ------- | --------------------------------------------- |
| `bar`   | `categoryField`, `valueFields`, `orientation` |
| `line`  | `xField`, `valueFields`                       |
| `stat`  | `valueField`                                  |
| `clock` | – (alles optional)                            |

## Query-Typen

- `jsonpath` → benötigt `jsonPath: string` + (`dataSource` oder `sourceQuery`)
- `sql` → benötigt `sql: string` (Tabelle immer `?`) + (`dataSource` oder `sourceQuery`)

## Monorepo-Befehle

```bash
bun install              # Dependencies
bun dev                  # Alle Apps starten
cd apps/dashboard && bun dev  # Nur Dashboard (Port 3000)
wetrack synth stack.ts   # TypeScript → JSON
wetrack deploy stack.ts  # Deploy zu localhost:3000
```
