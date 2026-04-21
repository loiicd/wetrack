import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "../ui/item";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "../ui/skeleton";
import Link from "next/link";
import { ChevronRightIcon, LayoutDashboardIcon } from "lucide-react";

type Environment = "PRODUCTION" | "STAGING" | "DEVELOPMENT";

type GroupedDashboard = {
  key: string;
  label: string;
  description?: string | null;
  environments: { id: string; environment: Environment }[];
  preferredId: string;
};

type Props = {
  dashboard: GroupedDashboard;
};

const ENV_BADGE: Record<Environment, { label: string; variant: "default" | "secondary" | "outline" }> = {
  PRODUCTION: { label: "Production", variant: "default" },
  STAGING: { label: "Staging", variant: "secondary" },
  DEVELOPMENT: { label: "Development", variant: "outline" },
};

const ENV_ORDER: Environment[] = ["PRODUCTION", "STAGING", "DEVELOPMENT"];

const DashboardListItem = ({ dashboard }: Props) => {
  const sortedEnvs = [...dashboard.environments].sort(
    (a, b) => ENV_ORDER.indexOf(a.environment) - ENV_ORDER.indexOf(b.environment),
  );

  return (
    <Item
      variant="outline"
      render={<Link href={`/dashboard/${dashboard.preferredId}`} />}
    >
      <ItemMedia>
        <LayoutDashboardIcon />
      </ItemMedia>
      <ItemContent>
        <div className="flex items-center gap-2 flex-wrap">
          <ItemTitle>{dashboard.label}</ItemTitle>
          {sortedEnvs.map(({ id, environment }) => {
            const { label, variant } = ENV_BADGE[environment];
            return (
              <Badge key={id} variant={variant} className="text-xs">
                {label}
              </Badge>
            );
          })}
        </div>
        {dashboard.description && (
          <ItemDescription>{dashboard.description}</ItemDescription>
        )}
      </ItemContent>
      <ItemActions>
        <ChevronRightIcon className="size-4" />
      </ItemActions>
    </Item>
  );
};

DashboardListItem.skeleton = () => {
  return (
    <Item variant="outline">
      <ItemContent>
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-3 w-1/2" />
      </ItemContent>
      <ItemActions>
        <ChevronRightIcon className="size-4" />
      </ItemActions>
    </Item>
  );
};

export default DashboardListItem;
