import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export type BarChartDatum = {
  category: string;
  value: number;
};

type BarChartCardProps = {
  title: string;
  description?: string | null;
  data: BarChartDatum[];
};

const BarChartCard = ({ title, description, data }: BarChartCardProps) => {
  const maxValue = data.reduce((currentMax, datum) => {
    return Math.max(currentMax, datum.value);
  }, 0);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="space-y-3">
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Keine gültigen Daten für dieses Bar-Chart gefunden.
          </p>
        ) : (
          data.map((datum, index) => {
            const barWidth = maxValue > 0 ? (datum.value / maxValue) * 100 : 0;

            return (
              <div key={`${datum.category}-${index}`} className="space-y-1">
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="truncate text-foreground">
                    {datum.category}
                  </span>
                  <span className="shrink-0 text-muted-foreground">
                    {datum.value.toLocaleString("de-DE")}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded bg-muted">
                  <div
                    className="h-full rounded bg-primary"
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};

export default BarChartCard;
