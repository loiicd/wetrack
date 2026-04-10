import { Dashboard } from "@/generated/prisma/client";
import DateRangePicker from "../dateRangePicker";

type Props = {
  dashboard: Dashboard;
};

const Test = ({ dashboard }: Props) => {
  return (
    <div className="flex flex-row gap-4 justify-between items-center">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold">{dashboard.label}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {dashboard.description}
        </p>
      </div>
      <DateRangePicker />
    </div>
  );
};

export default Test;
