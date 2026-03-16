import { Chart, Dashboard, DataSource, Query, Stack } from "dashboard_as_code";

// ---- DataSources ----

const postsApi = new DataSource("jsonplaceholder-posts", {
  type: "rest",
  config: { url: "https://jsonplaceholder.typicode.com/posts", method: "get" },
});

const productsApi = new DataSource("dummyjson-products", {
  type: "rest",
  config: { url: "https://dummyjson.com/products?limit=100", method: "get" },
});

// ---- Dashboards ----

const emergencyDashboard = new Dashboard("open-emergency-data-dashboard", {
  label: "Open Emergency Data Dashboard",
});

const userActivityDashboard = new Dashboard("user-activity-dashboard", {
  label: "User Activity Dashboard",
});

const productsDashboard = new Dashboard("products-dashboard", {
  label: "Products Dashboard",
});

const worldClockDashboard = new Dashboard("world-clock-dashboard", {
  label: "World Clock",
  description: "Uhren verschiedener Zeitzonen",
});

// ---- Queries ----

const postsAll = new Query("posts-all", {
  type: "jsonpath",
  dataSource: postsApi.key,
  jsonPath: "$[*]",
});

const postsTop10 = new Query("posts-top-10-query", {
  type: "jsonpath",
  dataSource: postsApi.key,
  jsonPath: "$[0:10]",
});

const postsFirst5 = new Query("posts-first-5-query", {
  type: "jsonpath",
  dataSource: postsApi.key,
  jsonPath: "$[0:5]",
});

const postsUser1 = new Query("posts-user1-sql", {
  type: "sql",
  sourceQuery: postsAll.key,
  sql: "SELECT id, title, userId FROM ? WHERE userId = 1 ORDER BY id",
});

const postsUser2 = new Query("posts-user2-sql", {
  type: "sql",
  sourceQuery: postsAll.key,
  sql: "SELECT id, title, userId FROM ? WHERE userId = 2 ORDER BY id",
});

const postsCountByUser = new Query("posts-count-by-user", {
  type: "sql",
  sourceQuery: postsAll.key,
  sql: "SELECT userId, COUNT(*) AS postCount FROM ? GROUP BY userId ORDER BY userId",
});

const postsTop5Desc = new Query("posts-top5-by-id-desc", {
  type: "sql",
  sourceQuery: postsAll.key,
  sql: "SELECT id, title FROM ? ORDER BY id DESC LIMIT 5",
});

const postsMultiSeries = new Query("posts-multi-series", {
  type: "sql",
  sourceQuery: postsAll.key,
  sql: "SELECT userId, COUNT(*) AS totalPosts, MAX(id) AS maxId, MIN(id) AS minId FROM ? GROUP BY userId ORDER BY userId",
});

const postsIdSeriesLine = new Query("posts-id-series-line", {
  type: "sql",
  sourceQuery: postsAll.key,
  sql: "SELECT id, userId FROM ? ORDER BY id LIMIT 20",
});

const postsMultiLine = new Query("posts-multi-line", {
  type: "sql",
  sourceQuery: postsAll.key,
  sql: "SELECT userId, COUNT(*) AS totalPosts, MAX(id) AS maxId FROM ? GROUP BY userId ORDER BY userId",
});

const productsAll = new Query("products-all", {
  type: "jsonpath",
  dataSource: productsApi.key,
  jsonPath: "$.products[*]",
});

const productsPriceByCategory = new Query("products-price-by-category", {
  type: "sql",
  sourceQuery: productsAll.key,
  sql: "SELECT category, ROUND(AVG(price), 2) AS avgPrice, ROUND(MAX(price), 2) AS maxPrice, ROUND(MIN(price), 2) AS minPrice FROM ? GROUP BY category ORDER BY avgPrice DESC",
});

const productsStockByCategory = new Query("products-stock-by-category", {
  type: "sql",
  sourceQuery: productsAll.key,
  sql: "SELECT category, SUM(stock) AS totalStock FROM ? GROUP BY category ORDER BY totalStock DESC",
});

const productsRatingTop10 = new Query("products-rating-top10", {
  type: "sql",
  sourceQuery: productsAll.key,
  sql: "SELECT title, ROUND(rating, 2) AS rating, ROUND(price, 2) AS price FROM ? ORDER BY rating DESC LIMIT 10",
});

const productsDiscountTop10 = new Query("products-discount-top10", {
  type: "sql",
  sourceQuery: productsAll.key,
  sql: "SELECT title, ROUND(discountPercentage, 1) AS discount FROM ? ORDER BY discountPercentage DESC LIMIT 10",
});

const productsStatCount = new Query("products-stat-count", {
  type: "sql",
  sourceQuery: productsAll.key,
  sql: "SELECT COUNT(*) AS total FROM ?",
});

const productsStatAvgPrice = new Query("products-stat-avg-price", {
  type: "sql",
  sourceQuery: productsAll.key,
  sql: "SELECT ROUND(AVG(price), 2) AS avgPrice FROM ?",
});

const productsStatTotalStock = new Query("products-stat-total-stock", {
  type: "sql",
  sourceQuery: productsAll.key,
  sql: "SELECT SUM(stock) AS totalStock FROM ?",
});

const productsStatMaxRating = new Query("products-stat-max-rating", {
  type: "sql",
  sourceQuery: productsAll.key,
  sql: "SELECT ROUND(MAX(rating), 2) AS maxRating FROM ?",
});

// ---- Charts ----

const postsCountByUserChartWide = new Chart("posts-count-by-user-chart-wide", {
  dashboard: emergencyDashboard.key,
  source: postsCountByUser,
  label: "Posts pro User – horizontal, Labels",
  description: "COUNT GROUP BY userId, horizontal, Labels an.",
  type: "bar",
  config: {
    categoryField: "userId",
    valueFields: ["postCount"],
    orientation: "horizontal",
    showLabels: true,
    showTooltip: true,
  },
  layout: { x: 0, y: 0, w: 12, h: 3 },
});

const postsTop10Vertical = new Chart("posts-top-10-vertical", {
  dashboard: emergencyDashboard.key,
  source: postsTop10,
  label: "Top 10 Posts – vertikal",
  description: "JSONPath $[0:10], vertical, kein Label, mit Tooltip.",
  type: "bar",
  config: {
    categoryField: "id",
    valueFields: ["id"],
    orientation: "vertical",
    showLabels: false,
    showTooltip: true,
    colors: ["var(--chart-2)"],
  },
  layout: { x: 0, y: 3, w: 6, h: 3 },
});

const postsFirst5Stacked = new Chart("posts-first-5-stacked", {
  dashboard: emergencyDashboard.key,
  source: postsFirst5,
  label: "Erste 5 – gestapelt (id + userId)",
  description: "Zwei Werte gestapelt, vertikal.",
  type: "bar",
  config: {
    categoryField: "id",
    valueFields: ["id", "userId"],
    orientation: "vertical",
    stacked: true,
    showLabels: false,
    showTooltip: true,
    colors: ["var(--chart-3)", "var(--chart-4)"],
  },
  layout: { x: 6, y: 3, w: 6, h: 3 },
});

const postsMultiSeriesChart = new Chart("posts-multi-series-chart", {
  dashboard: emergencyDashboard.key,
  source: postsMultiSeries,
  label: "Multi-Series: maxId & minId pro User",
  description: "Gruppiert, horizontal, 2 Wert-Felder pro User.",
  type: "bar",
  config: {
    categoryField: "userId",
    valueFields: ["maxId", "minId"],
    orientation: "horizontal",
    stacked: false,
    showLabels: true,
    showTooltip: true,
    colors: ["var(--chart-1)", "var(--chart-5)"],
  },
  layout: { x: 0, y: 6, w: 8, h: 3 },
});

const postsTop5DescSmall = new Chart("posts-top5-desc-small", {
  dashboard: emergencyDashboard.key,
  source: postsTop5Desc,
  label: "Top 5 absteigend – kein Tooltip",
  description: "SQL ORDER BY id DESC, kein Tooltip, kein Label.",
  type: "bar",
  config: {
    categoryField: "id",
    valueFields: ["id"],
    orientation: "vertical",
    showLabels: false,
    showTooltip: false,
    colors: ["var(--chart-2)"],
  },
  layout: { x: 8, y: 6, w: 4, h: 3 },
});

const user1PostsBar = new Chart("user1-posts-bar-chart", {
  dashboard: userActivityDashboard.key,
  source: postsUser1,
  label: "Posts von User 1 (SQL)",
  description: "Alle Posts von userId=1.",
  type: "bar",
  config: {
    categoryField: "title",
    valueFields: ["id"],
    orientation: "horizontal",
    showLabels: true,
    showTooltip: true,
  },
  layout: { x: 0, y: 0, w: 12, h: 3 },
});

const postsCountByUserChart = new Chart("posts-count-by-user-chart", {
  dashboard: userActivityDashboard.key,
  source: postsCountByUser,
  label: "Posts pro User (COUNT + GROUP BY)",
  description: "Anzahl Posts je userId – gestapelt.",
  type: "bar",
  config: {
    categoryField: "userId",
    valueFields: ["postCount"],
    orientation: "vertical",
    stacked: false,
    showLabels: false,
    showTooltip: true,
  },
  layout: { x: 0, y: 3, w: 12, h: 3 },
});

const postsLineSimple = new Chart("posts-line-simple", {
  dashboard: userActivityDashboard.key,
  source: postsIdSeriesLine,
  label: "Post-IDs als Linie (einfach)",
  description: "userId pro Post-ID – einzelne Linie mit Dots.",
  type: "line",
  config: {
    xField: "id",
    valueFields: ["userId"],
    showDots: true,
    filled: false,
    showTooltip: true,
    showLabels: false,
  },
  layout: { x: 0, y: 6, w: 12, h: 3 },
});

const postsLineMulti = new Chart("posts-line-multi", {
  dashboard: userActivityDashboard.key,
  source: postsMultiLine,
  label: "Multi-Line: totalPosts & maxId pro User",
  description: "Zwei Linien pro User – gefüllt, mit Tooltip.",
  type: "line",
  config: {
    xField: "userId",
    valueFields: ["totalPosts", "maxId"],
    showDots: true,
    filled: true,
    showTooltip: true,
    showLabels: false,
    colors: ["var(--chart-1)", "var(--chart-3)"],
  },
  layout: { x: 0, y: 9, w: 12, h: 3 },
});

const productsStatTotal = new Chart("products-stat-total", {
  dashboard: productsDashboard.key,
  source: productsStatCount,
  label: "Produkte gesamt",
  type: "stat",
  config: { valueField: "total", unit: "Stk." },
  layout: { x: 0, y: 0, w: 3, h: 2 },
});

const productsStatAvgPriceCard = new Chart("products-stat-avg-price-card", {
  dashboard: productsDashboard.key,
  source: productsStatAvgPrice,
  label: "Ø Preis",
  type: "stat",
  config: {
    valueField: "avgPrice",
    unit: "€",
    decimals: 2,
    color: "var(--chart-1)",
  },
  layout: { x: 3, y: 0, w: 3, h: 2 },
});

const productsStatStockCard = new Chart("products-stat-stock-card", {
  dashboard: productsDashboard.key,
  source: productsStatTotalStock,
  label: "Lagerbestand total",
  type: "stat",
  config: { valueField: "totalStock", unit: "Stk.", color: "var(--chart-4)" },
  layout: { x: 6, y: 0, w: 3, h: 2 },
});

const productsStatRatingCard = new Chart("products-stat-rating-card", {
  dashboard: productsDashboard.key,
  source: productsStatMaxRating,
  label: "Bestes Rating",
  type: "stat",
  config: {
    valueField: "maxRating",
    unit: "/ 5",
    decimals: 2,
    color: "var(--chart-3)",
  },
  layout: { x: 9, y: 0, w: 3, h: 2 },
});

const productsAvgPriceByCategory = new Chart("products-avg-price-by-category", {
  dashboard: productsDashboard.key,
  source: productsPriceByCategory,
  label: "Ø Preis nach Kategorie",
  description: "Durchschnitt, Max und Min Preis je Kategorie – gestapelt.",
  type: "bar",
  config: {
    categoryField: "category",
    valueFields: ["avgPrice", "maxPrice", "minPrice"],
    orientation: "horizontal",
    stacked: false,
    showLabels: false,
    showTooltip: true,
    colors: ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)"],
  },
  layout: { x: 0, y: 2, w: 12, h: 4 },
});

const productsStockByCategoryChart = new Chart("products-stock-by-category", {
  dashboard: productsDashboard.key,
  source: productsStockByCategory,
  label: "Lagerbestand nach Kategorie",
  description: "Gesamter Lagerbestand je Kategorie.",
  type: "bar",
  config: {
    categoryField: "category",
    valueFields: ["totalStock"],
    orientation: "horizontal",
    showLabels: true,
    showTooltip: true,
    colors: ["var(--chart-4)"],
  },
  layout: { x: 0, y: 6, w: 6, h: 4 },
});

const productsDiscountTop10Chart = new Chart("products-discount-top10", {
  dashboard: productsDashboard.key,
  source: productsDiscountTop10,
  label: "Top 10 Rabatte",
  description: "Produkte mit höchstem Rabatt in %.",
  type: "bar",
  config: {
    categoryField: "title",
    valueFields: ["discount"],
    orientation: "horizontal",
    showLabels: true,
    showTooltip: true,
    colors: ["var(--chart-5)"],
  },
  layout: { x: 6, y: 6, w: 6, h: 4 },
});

const productsRatingLine = new Chart("products-rating-line", {
  dashboard: productsDashboard.key,
  source: productsRatingTop10,
  label: "Top 10 Produkte nach Rating",
  description: "Rating und Preis der 10 besten Produkte – Multi-Line.",
  type: "line",
  config: {
    xField: "title",
    valueFields: ["rating", "price"],
    showDots: true,
    filled: false,
    showTooltip: true,
    showLabels: false,
    colors: ["var(--chart-1)", "var(--chart-2)"],
  },
  layout: { x: 0, y: 10, w: 12, h: 3 },
});

// ---- Clock Charts ----

const clockBerlin = new Chart("clock-berlin", {
  dashboard: worldClockDashboard.key,
  label: "Berlin",
  type: "clock",
  config: { timeZone: "Europe/Berlin", labelFormat: "full", showCard: false },
  layout: { x: 0, y: 0, w: 3, h: 1 },
});

const clockNewYork = new Chart("clock-new-york", {
  dashboard: worldClockDashboard.key,
  label: "New York",
  type: "clock",
  config: { timeZone: "America/New_York", labelFormat: "full" },
  layout: { x: 3, y: 0, w: 3, h: 1 },
});

const clockTokyo = new Chart("clock-tokyo", {
  dashboard: worldClockDashboard.key,
  label: "Tokyo",
  type: "clock",
  config: { timeZone: "Asia/Tokyo", labelFormat: "full" },
  layout: { x: 6, y: 0, w: 3, h: 1 },
});

const clockSydney = new Chart("clock-sydney", {
  dashboard: worldClockDashboard.key,
  label: "Sydney",
  type: "clock",
  config: { timeZone: "Australia/Sydney", labelFormat: "full" },
  layout: { x: 9, y: 0, w: 3, h: 1 },
});

const clockLondon = new Chart("clock-london", {
  dashboard: worldClockDashboard.key,
  label: "London",
  type: "clock",
  config: { timeZone: "Europe/London", labelFormat: "full" },
  layout: { x: 0, y: 1, w: 3, h: 1 },
});

const clockDubai = new Chart("clock-dubai", {
  dashboard: worldClockDashboard.key,
  label: "Dubai",
  type: "clock",
  config: { timeZone: "Asia/Dubai", labelFormat: "full" },
  layout: { x: 3, y: 1, w: 3, h: 1 },
});

// ---- Stack ----

const stack = new Stack("main-stack", "PRODUCTION")
  .addDashboard(
    emergencyDashboard,
    userActivityDashboard,
    productsDashboard,
    worldClockDashboard,
  )
  .addDataSource(postsApi, productsApi)
  .addQuery(
    postsAll,
    postsTop10,
    postsFirst5,
    postsUser1,
    postsUser2,
    postsCountByUser,
    postsTop5Desc,
    postsMultiSeries,
    postsIdSeriesLine,
    postsMultiLine,
    productsAll,
    productsPriceByCategory,
    productsStockByCategory,
    productsRatingTop10,
    productsDiscountTop10,
    productsStatCount,
    productsStatAvgPrice,
    productsStatTotalStock,
    productsStatMaxRating,
  )
  .addChart(
    postsCountByUserChartWide,
    postsTop10Vertical,
    postsFirst5Stacked,
    postsMultiSeriesChart,
    postsTop5DescSmall,
    user1PostsBar,
    postsCountByUserChart,
    postsLineSimple,
    postsLineMulti,
    productsStatTotal,
    productsStatAvgPriceCard,
    productsStatStockCard,
    productsStatRatingCard,
    productsAvgPriceByCategory,
    productsStockByCategoryChart,
    productsDiscountTop10Chart,
    productsRatingLine,
    clockBerlin,
    clockNewYork,
    clockTokyo,
    clockSydney,
    clockLondon,
    clockDubai,
  );

export default stack;
