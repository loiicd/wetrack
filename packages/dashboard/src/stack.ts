import { Chart } from "./chart";
import { Dashboard } from "./dashboard";
import { DataSource } from "./datasource";
import { Query } from "./query";
import type { StackDefinition, StackEnvironment } from "../types/stack";

export class Stack {
  key: string;
  environment: StackEnvironment;
  dashboards: Dashboard[] = [];
  dataSources: DataSource[] = [];
  queries: Query[] = [];
  charts: Chart[] = [];

  constructor(key: string, environment: StackEnvironment) {
    this.key = key;
    this.environment = environment;
  }

  // ---- Builder-Methoden (Fluent API) ----

  addDashboard(...dashboards: Dashboard[]): this {
    for (const d of dashboards) {
      if (this.dashboards.some((x) => x.key === d.key))
        throw new Error(`Duplicate dashboard key: "${d.key}"`);
      this.dashboards.push(d);
    }
    return this;
  }

  addDataSource(...dataSources: DataSource[]): this {
    for (const ds of dataSources) {
      if (this.dataSources.some((x) => x.key === ds.key))
        throw new Error(`Duplicate dataSource key: "${ds.key}"`);
      this.dataSources.push(ds);
    }
    return this;
  }

  addQuery(...queries: Query[]): this {
    for (const q of queries) {
      if (this.queries.some((x) => x.key === q.key))
        throw new Error(`Duplicate query key: "${q.key}"`);
      this.queries.push(q);
    }
    return this;
  }

  addChart(...charts: Chart[]): this {
    for (const c of charts) {
      if (this.charts.some((x) => x.key === c.key))
        throw new Error(`Duplicate chart key: "${c.key}"`);
      this.charts.push(c);
    }
    return this;
  }

  // ---- Serialisierung ----

  synthesize(): StackDefinition {
    return {
      key: this.key,
      environment: this.environment,
      dashboards: this.dashboards.map((d) => d.synthesize()),
      dataSources: this.dataSources.map((ds) => ds.synthesize()),
      queries: this.queries.map((q) => q.synthesize()),
      charts: this.charts.map((c) => c.synthesize()),
    };
  }

  // ---- Factory: JSON → Stack ----

  static fromJSON(json: StackDefinition): Stack {
    const stack = new Stack(json.key, json.environment);

    for (const d of json.dashboards ?? []) {
      stack.addDashboard(Dashboard.fromJSON(d));
    }
    for (const ds of json.dataSources ?? []) {
      stack.addDataSource(DataSource.fromJSON(ds));
    }
    for (const q of json.queries ?? []) {
      stack.addQuery(Query.fromJSON(q));
    }
    for (const c of json.charts ?? []) {
      stack.addChart(Chart.fromJSON(c));
    }

    return stack;
  }

  // ---- Deployment ----

  async deploy(apiUrl: string): Promise<{ status: number; body: string }> {
    const payload = this.synthesize();

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const body = await response.text();
    return { status: response.status, body };
  }
}
