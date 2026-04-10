import { Dashboard } from "@/generated/prisma/client";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "../ui/item";
import { Skeleton } from "../ui/skeleton";
import Link from "next/link";
import { ChevronRightIcon, LayoutDashboardIcon } from "lucide-react";

type Props = {
  dashboard: Dashboard;
};

const DashboardListItem = ({ dashboard }: Props) => {
  return (
    <Item
      variant="outline"
      render={<Link href={`/dashboard/${dashboard.id}`} />}
    >
      <ItemMedia>
        <LayoutDashboardIcon />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>{dashboard.label}</ItemTitle>
        <ItemDescription>{dashboard.description}</ItemDescription>
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
