import Container from "@/components/layout/container";
import QueryTable from "@/components/table/queryTable";
import { Suspense } from "react";
import { Search, Terminal } from "lucide-react";

const Page = () => {
  return (
    <Container>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">Queries</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Alle registrierten Abfragen deiner Stacks. Werden über die CLI
              deployed.
            </p>
          </div>
          <div className="flex items-center gap-1.5 rounded-md border bg-muted/50 px-3 py-1.5 text-xs text-muted-foreground">
            <Terminal className="h-3.5 w-3.5" />
            <code>wetrack deploy mystack.ts</code>
          </div>
        </div>
        <div className="rounded-xl border bg-background">
          <div className="flex items-center gap-2 border-b px-4 py-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Alle Queries</span>
          </div>
          <Suspense>
            <QueryTable />
          </Suspense>
        </div>
      </div>
    </Container>
  );
};

export default Page;
