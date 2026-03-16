import { Chart } from "./chart";
import { Dashboard } from "./dashboard";
import { DataSource } from "./datasource";
import { Query } from "./query";
import { Transform } from "./transform";
import type { StackDefinition, StackEnvironment } from "../types/stack";

export class Stack {
  key: string;
  environment: StackEnvironment;
  dashboards: Dashboard[] = [];
  dataSources: DataSource[] = [];
  queries: Query[] = [];
  charts: Chart[] = [];
  transforms: Transform[] = [];

  constructor(key: string, environment: StackEnvironment) {
    this.key = key;
    this.environment = environment;
  }

  // ---- Builder-Methoden (Fluent API) ----

  addDashboard(...dashboards: Dashboard[]): this {
    this.dashboards.push(...dashboards);
    return this;
  }

  addDataSource(...dataSources: DataSource[]): this {
    this.dataSources.push(...dataSources);
    return this;
  }

  addQuery(...queries: Query[]): this {
    this.queries.push(...queries);
    return this;
  }

  addChart(...charts: Chart[]): this {
    this.charts.push(...charts);
    return this;
  }

  addTransform(...transforms: Transform[]): this {
    this.transforms.push(...transforms);
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
      transforms: this.transforms.map((t) => t.synthesize()),
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
    for (const t of json.transforms ?? []) {
      stack.addTransform(Transform.fromJSON(t));
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
