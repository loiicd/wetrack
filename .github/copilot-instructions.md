# WeTrack – GitHub Copilot Instructions

## Projekt-Überblick

WeTrack ist eine **Dashboard-as-Code** Plattform. Dashboards werden als TypeScript-Dateien im Repository definiert und über den WeTrack-Stack orchestriert.

Lies `AGENTS.md` im Repo-Root für die vollständige Referenz.

## Vor jedem Commit: Pflicht-Checks

**Niemals committen ohne diese Checks erfolgreich durchgeführt zu haben:**

```bash
# 1. TypeScript – Typfehler prüfen
cd apps/dashboard && npx tsc --noEmit

# 2. Build – Production Build prüfen (deckt Prerender-Fehler auf)
cd apps/dashboard && bun run build

# 3. Lint
cd apps/dashboard && bun run lint
```

Alle drei müssen **ohne Fehler** durchlaufen. Warnungen sind ok, Fehler nicht.

> Warum Build? Next.js 16 wirft beim statischen Prerendering Fehler (z.B. `usePathname()` außerhalb `<Suspense>`), die TypeScript nicht erkennt — nur `next build` deckt diese auf.

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

## Datenbank-Regeln (Prisma)

**Alle Datenbankoperationen ausschließlich über Prisma-Befehle — kein manuelles SQL, kein direktes `ALTER TABLE`, kein `DROP CONSTRAINT` per Hand.**

### Pflicht-Befehle

| Zweck | Befehl |
|-------|--------|
| Migration erstellen | `cd apps/dashboard && bunx prisma migrate dev --name <name>` |
| Migration deployen (Prod) | `cd apps/dashboard && bunx prisma migrate deploy` |
| Client neu generieren | `cd apps/dashboard && bunx prisma generate` |
| DB-Status prüfen | `cd apps/dashboard && bunx prisma migrate status` |
| Schema pushen (kein History) | `cd apps/dashboard && bunx prisma db push` |

### Wichtige Hinweise

- **Niemals** Migrations-SQL manuell schreiben oder bearbeiten — immer `prisma migrate dev` nutzen, das generiert korrektes SQL basierend auf dem tatsächlichen DB-Schema.
- **Niemals** Constraint-Namen erraten — Prisma kennt die exakten Namen aus dem echten Schema.
- Unique Indexes in Prisma werden als `CREATE UNIQUE INDEX` (nicht als `CONSTRAINT`) angelegt → `DROP INDEX`, nicht `DROP CONSTRAINT`.
- `prisma generate` funktioniert ohne DB-Verbindung; `prisma migrate dev/deploy` benötigt `DATABASE_URL`.
- Nach Schema-Änderungen in `schema.prisma` immer `prisma generate` ausführen damit der generierte Client aktuell ist.

### package.json Scripts (apps/dashboard)

```json
"migrate": "prisma migrate deploy",      // Prod: deploy pending migrations
"prisma:migrate": "prisma migrate dev",  // Dev: create + apply new migration
"prisma:generate": "prisma generate",    // Client neu generieren
"prisma:studio": "prisma studio",        // DB GUI
"prisma:dbpush": "prisma db push",       // Schema push ohne History
"postinstall": "prisma generate"
```



```bash
bun install              # Dependencies
bun dev                  # Alle Apps starten
cd apps/dashboard && bun dev  # Nur Dashboard (Port 3000)
wetrack synth stack.ts   # TypeScript → JSON
wetrack deploy stack.ts  # Deploy zu localhost:3000
```
