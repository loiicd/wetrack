Vercel Deployment Check — Anleitung

Ziel
----
Sicherstellen, dass Vercel-Deployments erst ausgeführt werden, wenn der GitHub-Check "Unit Tests" erfolgreich ist.

Kurz (empfohlen)
----------------
1. Öffne Vercel → Projekt auswählen
2. Settings → Git → Deployment Checks
3. Add Check → GitHub Status Check (oder "Require a GitHub check")
4. Als Check-Name exakt eintragen: Unit Tests
5. Als "Required" markieren und speichern

Warum das so funktioniert
------------------------
Der CI-Job in diesem Repo heißt "Unit Tests" (siehe .github/workflows/ci.yml). Vercel vergleicht die Check-Namen mit den GitHub-Status-Checks auf dem Commit. Sobald du den Check als required konfigurierst, startet Vercel den Build erst, wenn der GitHub-Check erfolgreich ist.

Alternative: GitHub Branch Protection
------------------------------------
Falls du lieber in GitHub erzwingen möchtest, dass Tests vor Merge laufen:
1. GitHub → Repository → Settings → Branches → Add rule
2. Branch pattern z.B. "main"
3. Require status checks to pass before merging → wähle "Unit Tests"
4. Save

Automatisierung / API (optional)
--------------------------------
Vercel bietet teilweise API- oder CLI-Optionen; in vielen Fällen ist die Dashboard-Einstellung die zuverlässigste Methode. Falls du möchtest, dass ich das per API automatisiere, bitte folgendes bereitstellen (NICHT hier im Repo):
- VERCEL_TOKEN (Personal Token mit Projekt-Rechten)
- VERCEL_PROJECT_ID (Project ID in Vercel)

Mit diesen kann ich per API/CLI die Checks konfigurieren oder es für dich über die Vercel-API anlegen.

Was im Repository bereits erledigt wurde
--------------------------------------
- CI-Job "Unit Tests" angelegt (.github/workflows/ci.yml)
- Tests laufen mit Coverage (apps/dashboard) und es gibt ein Script, das Coverage-Grenzen prüft: apps/dashboard/scripts/check-coverage.js
- Branch/PR: branch feature/add-ci-tests-job mit den Änderungen ist gepusht. PR-Erstellung per GitHub CLI schlug fehl (gh nicht authentifiziert) — PR kann in GitHub UI schnell aus dem Branch erstellt werden.

Nächste Schritte (wenn du nicht manuell willst)
----------------------------------------------
Wenn du automatische Konfiguration willst, gib kurz Bescheid und stelle VERCEL_TOKEN + VERCEL_PROJECT_ID in einer sicheren Weise zur Verfügung (z.B. per Secret). Dann konfiguriere ich den Deployment Check programmatisch.

Support
-------
Wenn du willst, erstelle ich die Pull-Request (brauche GH token) oder führe die Vercel-API-Konfiguration aus (brauche VERCEL_TOKEN + projectId). Ansonsten ist die manuelle Dashboard-Anleitung oben der schnellste Weg.
