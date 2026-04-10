import { Dashboard } from "@/generated/prisma/client";
import DateRangePicker from "../dateRangePicker";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { LoaderIcon } from "lucide-react";

type Props = {
  dashboard: Dashboard;
};

const Test = ({ dashboard }: Props) => {
  const items = [
    { label: "30 seconds", value: 300 },
    { label: "1 min", value: 600 },
    { label: "5 min", value: 3000 },
    { label: "15 min", value: 9000 },
    { label: "1 hour", value: 3600 },
    { label: "Off", value: "off" },
  ];

  return (
    <div className="flex flex-row gap-4 justify-between items-center">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold">{dashboard.label}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {dashboard.description}
        </p>
      </div>

      <DateRangePicker />
      <Button size="icon" variant="secondary">
        <LoaderIcon />
      </Button>
      <Select items={items}>
        <SelectTrigger className="w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {items.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default Test;
