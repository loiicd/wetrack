import { Skeleton } from "./ui/skeleton";

const OrganizationSwitchSkeleton = () => {
  return (
    <div className="w-full p-2 flex items-center gap-2">
      <Skeleton className="size-8 rounded-md" />
      <div className="ml-4 flex-1">
        <Skeleton className="h-4 w-full rounded-md" />
      </div>
    </div>
  );
};

export default OrganizationSwitchSkeleton;
