import Link from "next/link";
import { cn } from "@/lib/utils";

type Environment = "PRODUCTION" | "STAGING" | "DEVELOPMENT";

type EnvironmentEntry = {
  id: string;
  environment: Environment;
};

type Props = {
  currentId: string;
  environments: EnvironmentEntry[];
};

const ENV_LABEL: Record<Environment, string> = {
  PRODUCTION: "Production",
  STAGING: "Staging",
  DEVELOPMENT: "Development",
};

const ENV_ORDER: Environment[] = ["PRODUCTION", "STAGING", "DEVELOPMENT"];

const EnvironmentTabs = ({ currentId, environments }: Props) => {
  if (environments.length <= 1) return null;

  const sorted = [...environments].sort(
    (a, b) => ENV_ORDER.indexOf(a.environment) - ENV_ORDER.indexOf(b.environment),
  );

  return (
    <div className="flex items-center gap-1 rounded-lg border bg-muted p-1">
      {sorted.map(({ id, environment }) => (
        <Link
          key={id}
          href={`/dashboard/${id}`}
          className={cn(
            "rounded-md px-3 py-1 text-sm font-medium transition-colors",
            id === currentId
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {ENV_LABEL[environment]}
        </Link>
      ))}
    </div>
  );
};

export default EnvironmentTabs;
