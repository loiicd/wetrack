import Link from "next/link";
import { Card } from "../ui/card";
import { Dashboard } from "@/generated/prisma/client";
import { ChevronRight, Clock, LayoutDashboard } from "lucide-react";

type Props = {
  dashboard: Dashboard;
};

const DashboardCard = ({ dashboard }: Props) => {
  return (
    <Link href={`/dashboard/${dashboard.id}`}>
      <Card className="group flex flex-row  items-center gap-4 px-4 py-4 border-l-4 border-l-primary cursor-pointer">
        <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
          <LayoutDashboard className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{dashboard.label}</p>
          <p className="text-sm text-muted-foreground truncate">
            {dashboard.description}
          </p>
          <div className="flex items-center gap-1 mt-0.5 text-muted-foreground">
            <Clock className="w-3 h-3 shrink-0" />
            <span className="text-xs">
              {dashboard.updatedAt.toLocaleDateString("de-DE")},{" "}
              {dashboard.updatedAt.toLocaleTimeString("de-DE", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" />
      </Card>
    </Link>
  );
};

export default DashboardCard;
