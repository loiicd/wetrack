import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  const { valueField, unit, color, decimals } = config;

  const field = data.fields.find((f) => f.name === valueField);
  const raw = field?.values[0];
  const displayValue = formatValue(raw, decimals, unit);

  return (
    <Card className="flex h-full flex-col justify-between">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>
        <p
          className="text-4xl font-bold tracking-tight"
          style={{ color: color ?? "inherit" }}
        >
          {displayValue}
        </p>
      </CardContent>
    </Card>
  );
};

export default StatCard;
