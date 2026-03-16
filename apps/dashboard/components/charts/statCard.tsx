import ChartWrapper from "@/components/chartWrapper";
import type { StatCardConfig } from "@/schemas/dashboard";
import type { DataFrame } from "@/types/dataframe";

type StatCardProps = {
  title: string;
  description?: string | null;
  data: DataFrame;
  config: StatCardConfig;
};

const formatValue = (
  raw: unknown,
  decimals?: number,
  unit?: string,
): string => {
  let formatted: string;

  if (typeof raw === "number") {
    formatted = decimals !== undefined ? raw.toFixed(decimals) : String(raw);
  } else {
    formatted = String(raw ?? "–");
  }

  return unit ? `${formatted} ${unit}` : formatted;
};

const StatCard = ({ title, description, data, config }: StatCardProps) => {
  const { valueField, unit, color, decimals, showCard = true } = config;

  const field = data.fields.find((f) => f.name === valueField);
  const raw = field?.values[0];
  const displayValue = formatValue(raw, decimals, unit);

  return (
    <ChartWrapper
      title={title}
      description={description}
      showCard={showCard}
      className="justify-between"
      titleClassName="text-sm font-medium text-muted-foreground"
    >
      <p
        className="text-4xl font-bold tracking-tight"
        style={{ color: color ?? "inherit" }}
      >
        {displayValue}
      </p>
    </ChartWrapper>
  );
};

export default StatCard;
