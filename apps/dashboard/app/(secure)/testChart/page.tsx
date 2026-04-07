// Beispiel 5: Scatter mit vielen Punkten
const data5: DataFrame = {
  fields: [
    {
      name: "x",
      type: "number",
      values: Array.from({ length: 50 }, (_, i) => i + 1),
    },
    {
      name: "y",
      type: "number",
      values: Array.from({ length: 50 }, (_, i) =>
        Math.round(Math.sin(i / 5) * 20 + 30 + Math.random() * 10),
      ),
    },
  ],
};
const config5 = {
  y: { label: "y", color: "var(--chart-4)", type: "scatter" },
} as const;
import CartesianChart, { DataFrame } from "@/components/widgets/CartesianChart";
import DonutChartCard from "@/components/widgets/donutChartCard";
import TableWidget from "@/components/widgets/table";
import StatCard from "@/components/widgets/statCard";
import ClockWidget from "@/components/widgets/clockWidget";
import { Suspense } from "react";

const Page = () => {
  const data1: DataFrame = {
    fields: [
      {
        name: "month",
        type: "string",
        values: [
          "Januar",
          "Februar",
          "März",
          "April",
          "Mai",
          "Juni",
          "Juli",
          "August",
          "September",
          "Oktober",
          "November",
          "Dezember",
        ],
      },
      {
        name: "Aufrufe",
        type: "number",
        values: [30, 20, 50, 40, 60, 35, 45, 25, 55, 30, 20, 50],
      },
      {
        name: "Besucher",
        type: "number",
        values: [20, 15, 40, 30, 50, 25, 35, 20, 45, 25, 15, 40],
      },
      {
        name: "Conversions",
        type: "number",
        values: [5, 3, 10, 7, 12, 6, 8, 4, 11, 6, 3, 9],
      },
    ],
  };
  const config1 = {
    Aufrufe: { label: "Aufrufe", color: "var(--chart-1)", type: "bar" },
    Besucher: { label: "Besucher", color: "var(--chart-2)", type: "bar" },
    Conversions: {
      label: "Conversions",
      color: "var(--chart-3)",
      type: "line",
    },
  } as const;

  const data2: DataFrame = {
    fields: [
      { name: "Tag", type: "string", values: ["Mo", "Di", "Mi", "Do", "Fr"] },
      { name: "Umsatz", type: "number", values: [100, 120, 90, 140, 110] },
      { name: "Kosten", type: "number", values: [80, 70, 60, 100, 90] },
    ],
  };
  const config2 = {
    Umsatz: { label: "Umsatz", color: "var(--chart-1)", type: "area" },
    Kosten: { label: "Kosten", color: "var(--chart-2)", type: "area" },
  } as const;

  const data3: DataFrame = {
    fields: [
      { name: "x", type: "number", values: [1, 2, 3, 4, 5, 6] },
      { name: "y", type: "number", values: [10, 15, 8, 20, 12, 18] },
    ],
  };
  const config3 = {
    y: { label: "y", color: "var(--chart-4)", type: "scatter" },
  } as const;

  const data4: DataFrame = {
    fields: [
      { name: "Quartal", type: "string", values: ["Q1", "Q2", "Q3", "Q4"] },
      { name: "Gewinn", type: "number", values: [200, 300, 250, 400] },
    ],
  };
  const config4 = {
    Gewinn: { label: "Gewinn", color: "var(--chart-5)", type: "area" },
  } as const;

  return (
    <Suspense>
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <CartesianChart
            data={data1}
            config={config1}
            title="Bar + Line (Monate)"
            description="Aufrufe/Besucher als Balken, Conversions als Linie."
          />
        </div>
        <div>
          <TableWidget
            data={data1}
            title="Tabelle: Monatliche Metriken"
            description="Aufrufe, Besucher und Conversions pro Monat"
          />
        </div>
        <div>
          <CartesianChart
            data={data2}
            config={config2}
            title="Area + Scatter (Wochentage)"
            description="Umsatz/Kosten als Fläche, Events als Punkte."
          />
        </div>
        <div>
          <TableWidget
            data={data2}
            title="Tabelle: Tägliche Finanzen"
            description="Umsatz und Kosten pro Wochentag"
          />
        </div>
        <div>
          <CartesianChart
            data={data3}
            config={config3}
            title="Scatter (xy)"
            description="Nur Punkte (Scatter)."
          />
        </div>
        <div>
          <CartesianChart
            data={data4}
            config={config4}
            title="Area (Quartale)"
            description="Nur Fläche (Area)."
          />
        </div>
        <div>
          <TableWidget
            data={data4}
            title="Tabelle: Quartalsgewinn"
            description="Gewinn nach Quartal"
          />
        </div>
        <div>
          <CartesianChart
            data={data5}
            config={config5}
            title="Scatter (viele Punkte)"
            description="Scatter-Plot mit 50 zufälligen Punkten."
          />
        </div>

        {/* ── Donut Charts ─────────────────────────────────── */}
        <div>
          <DonutChartCard
            title="Marktanteile"
            description="Prozentualer Anteil pro Produktkategorie"
            data={{
              fields: [
                {
                  name: "Kategorie",
                  type: "string",
                  values: ["Elektronik", "Kleidung", "Lebensmittel", "Haushalt", "Sport"],
                },
                {
                  name: "Anteil",
                  type: "number",
                  values: [35, 25, 20, 12, 8],
                },
              ],
            }}
            config={{
              nameField: "Kategorie",
              valueField: "Anteil",
              showTooltip: true,
              showLegend: true,
            }}
          />
        </div>
        <div>
          <DonutChartCard
            title="Budget-Verteilung"
            description="Ausgaben nach Bereich (Q1 2024)"
            data={{
              fields: [
                {
                  name: "Bereich",
                  type: "string",
                  values: ["Marketing", "Entwicklung", "Support", "Vertrieb"],
                },
                {
                  name: "Budget",
                  type: "number",
                  values: [45000, 120000, 30000, 60000],
                },
              ],
            }}
            config={{
              nameField: "Bereich",
              valueField: "Budget",
              colors: ["var(--chart-3)", "var(--chart-1)", "var(--chart-5)", "var(--chart-2)"],
              showTooltip: true,
              showLegend: true,
            }}
          />
        </div>
        <div>
          <DonutChartCard
            title="Gerätetypen"
            description="Besucher nach Endgerät (letzte 30 Tage)"
            data={{
              fields: [
                {
                  name: "Gerät",
                  type: "string",
                  values: ["Mobile", "Desktop", "Tablet"],
                },
                {
                  name: "Besucher",
                  type: "number",
                  values: [5820, 3210, 970],
                },
              ],
            }}
            config={{
              nameField: "Gerät",
              valueField: "Besucher",
              showTooltip: true,
              showLegend: true,
            }}
          />
        </div>
        <div>
          <DonutChartCard
            title="Aufgaben-Status"
            description="Aktueller Sprint-Überblick"
            data={{
              fields: [
                {
                  name: "Status",
                  type: "string",
                  values: ["Erledigt", "In Arbeit", "Offen", "Blockiert"],
                },
                {
                  name: "Anzahl",
                  type: "number",
                  values: [18, 7, 12, 3],
                },
              ],
            }}
            config={{
              nameField: "Status",
              valueField: "Anzahl",
              colors: [
                "var(--chart-2)",
                "var(--chart-1)",
                "var(--chart-4)",
                "var(--chart-5)",
              ],
              showTooltip: true,
              showLegend: false,
            }}
          />
        </div>

        {/* ── Stat Cards ────────────────────────────────────── */}
        <div>
          <StatCard
            title="Gesamtumsatz"
            description="Kumulierter Umsatz (YTD)"
            data={{
              fields: [
                {
                  name: "umsatz",
                  type: "number",
                  values: [142300],
                },
              ],
            }}
            config={{ valueField: "umsatz", unit: "€", decimals: 0, color: "var(--chart-1)", showCard: true }}
          />
        </div>
        <div>
          <StatCard
            title="Conversion Rate"
            description="Monatlicher Verlauf"
            data={{
              fields: [
                {
                  name: "rate",
                  type: "number",
                  values: [3.2, 3.8, 4.1, 3.9, 4.5, 4.8, 5.1, 4.9, 5.4, 5.8, 5.5, 6.1],
                },
              ],
            }}
            config={{ valueField: "rate", unit: "%", decimals: 1, color: "var(--chart-2)", showCard: true }}
          />
        </div>
        <div>
          <StatCard
            title="Offene Tickets"
            description="Stand heute"
            data={{
              fields: [
                {
                  name: "tickets",
                  type: "number",
                  values: [42, 38, 45, 50, 47, 39, 42],
                },
              ],
            }}
            config={{ valueField: "tickets", decimals: 0, color: "var(--chart-4)", showCard: true }}
          />
        </div>

        {/* ── Clock Widgets ─────────────────────────────────── */}
        <div>
          <ClockWidget
            timeZone="Europe/Berlin"
            labelFormat="full"
          />
        </div>
        <div>
          <ClockWidget
            timeZone="America/New_York"
            labelFormat="city"
          />
        </div>
        <div>
          <ClockWidget
            timeZone="Asia/Tokyo"
            labelFormat="full"
            showSeconds={false}
          />
        </div>
      </div>
    </div>
    </Suspense>
  );
};

export default Page;
