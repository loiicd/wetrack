import { Chart, Dashboard, DataSource, Query, Stack } from "wetrack-dashboard";

/**
 * Schritt 1: DataSources definieren
 *
 * Eine DataSource beschreibt, woher die Daten kommen.
 * Aktuell unterstützt: REST-APIs
 */
const githubApi = new DataSource("github-repos", {
  type: "rest",
  config: {
    url: "https://api.github.com/orgs/vercel/repos?per_page=100",
    method: "get",
    headers: {
      Accept: "application/vnd.github+json",
    },
  },
});

/**
 * Schritt 2: Queries definieren
 *
 * Queries transformieren die Rohdaten.
 * - type "jsonpath" → filtert/selektiert direkt aus dem API-Response
 * - type "sql"      → führt SQL auf einem vorherigen Query-Ergebnis aus
 */

// Alle Repos aus dem API-Response extrahieren
const allRepos = new Query("all-repos", {
  type: "jsonpath",
  dataSource: githubApi.key,
  jsonPath: "$[*]",
});

// Nur die relevanten Felder + nach Stars sortieren
const reposByStars = new Query("repos-by-stars", {
  type: "sql",
  sourceQuery: allRepos.key,
  sql: `
    SELECT name, stargazers_count AS stars, forks_count AS forks, language
    FROM ?
    ORDER BY stars DESC
    LIMIT 10
  `,
});

// Repos nach Programmiersprache zählen
const reposByLanguage = new Query("repos-by-language", {
  type: "sql",
  sourceQuery: allRepos.key,
  sql: `
    SELECT language, COUNT(*) AS count
    FROM ?
    WHERE language IS NOT NULL
    GROUP BY language
    ORDER BY count DESC
    LIMIT 8
  `,
});

// Gesamt-Statistiken
const totalStats = new Query("total-stars", {
  type: "sql",
  sourceQuery: allRepos.key,
  sql: "SELECT SUM(stargazers_count) AS totalStars FROM ?",
});

/**
 * Schritt 3: Dashboards definieren
 *
 * Ein Dashboard ist ein benannter Bereich, dem Charts zugewiesen werden.
 */
const overviewDashboard = new Dashboard("github-overview", {
  label: "GitHub Übersicht",
  description: "Statistiken der Vercel GitHub Organisation",
});

/**
 * Schritt 4: Charts definieren
 *
 * Jeder Chart verweist auf ein Dashboard und eine Query.
 * layout: { x, y, w, h } → Position im 12-Spalten-Grid
 *
 * Typen: "bar" | "line" | "stat"
 */

// Kennzahl: Gesamte Stars
const starsStatCard = new Chart("total-stars-card", {
  dashboard: overviewDashboard.key,
  source: totalStats,
  label: "GitHub Stars gesamt",
  type: "stat",
  config: {
    valueField: "totalStars",
    unit: "★",
    color: "var(--chart-1)",
  },
  layout: { x: 0, y: 0, w: 4, h: 2 },
});

// Balkendiagramm: Top 10 Repos nach Stars
const topReposChart = new Chart("top-repos-by-stars", {
  dashboard: overviewDashboard.key,
  source: reposByStars,
  label: "Top 10 Repos nach Stars",
  description: "Die 10 meistgenutzten Repos der Vercel Organisation",
  type: "bar",
  config: {
    categoryField: "name",
    valueFields: ["stars", "forks"],
    orientation: "horizontal",
    showLabels: true,
    showTooltip: true,
    colors: ["var(--chart-1)", "var(--chart-2)"],
  },
  layout: { x: 0, y: 2, w: 12, h: 4 },
});

// Balkendiagramm: Repos nach Sprache
const languageChart = new Chart("repos-by-language", {
  dashboard: overviewDashboard.key,
  source: reposByLanguage,
  label: "Repos nach Sprache",
  type: "bar",
  config: {
    categoryField: "language",
    valueFields: ["count"],
    orientation: "vertical",
    showLabels: true,
    showTooltip: true,
    colors: ["var(--chart-3)"],
  },
  layout: { x: 0, y: 6, w: 12, h: 3 },
});

/**
 * Schritt 5: Stack zusammenbauen
 *
 * Der Stack bündelt alles und wird als default exportiert.
 * Die CLI liest diesen Export automatisch.
 *
 * Environments: "PRODUCTION" | "STAGING" | "DEVELOPMENT"
 */
const stack = new Stack("github-stack", "DEVELOPMENT")
  .addDashboard(overviewDashboard)
  .addDataSource(githubApi)
  .addQuery(allRepos, reposByStars, reposByLanguage, totalStats)
  .addChart(starsStatCard, topReposChart, languageChart);

export default stack;

/**
 * Dann einfach in der CLI:
 *
 *   wetrack synth my-stack.ts              → JSON auf stdout
 *   wetrack synth my-stack.ts -o out.json  → JSON in Datei
 *   wetrack deploy my-stack.ts             → direkt deployen
 *   wetrack deploy my-stack.ts --dry-run   → nur synthetisieren
 */
