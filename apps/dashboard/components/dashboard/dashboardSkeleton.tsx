import { Skeleton } from "@/components/ui/skeleton";

const DashboardSkeleton = () => {
  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-row justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-8 w-24 rounded-md" />
      </div>

      {/* Stat cards row */}
      <div className="grid grid-cols-3 gap-2.5">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-[330px] rounded-xl" />
        ))}
      </div>

      {/* Wide chart */}
      <Skeleton className="h-[670px] w-full rounded-xl" />

      {/* Two side-by-side charts */}
      <div className="grid grid-cols-2 gap-2.5">
        <Skeleton className="h-[500px] rounded-xl" />
        <Skeleton className="h-[500px] rounded-xl" />
      </div>
    </div>
  );
};

export default DashboardSkeleton;
