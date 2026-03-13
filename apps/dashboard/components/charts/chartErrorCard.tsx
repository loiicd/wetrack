import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

type ChartErrorCardProps = {
  title: string;
  message: string;
};

const ChartErrorCard = ({ title, message }: ChartErrorCardProps) => {
  return (
    <Card className="flex h-full flex-col border-destructive/50 bg-destructive/5">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <CardTitle className="text-base text-destructive">{title}</CardTitle>
        </div>
        <CardDescription>Chart konnte nicht geladen werden.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="rounded-md bg-destructive/10 px-3 py-2 font-mono text-xs text-destructive/80 break-all whitespace-pre-wrap">
          {message}
        </p>
      </CardContent>
    </Card>
  );
};

export default ChartErrorCard;
