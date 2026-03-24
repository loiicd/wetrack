import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Code, Zap, Package } from "lucide-react";

export function HeroSection() {
  return (
    <div className="mb-12 rounded-lg border bg-gradient-to-br from-primary/5 to-primary/10 p-8 md:p-12">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-3">
            Dashboards as Code
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Definiere DataSources, Queries und Charts in TypeScript. Deploy mit
            einem Befehl. Alles versionierbar, reproduzierbar und skalierbar.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard/create">
            <Button size="lg" className="gap-2">
              <Zap className="w-4 h-4" />
              Neues Dashboard
            </Button>
          </Link>
          <Link href="https://github.com" target="_blank">
            <Button variant="outline" size="lg" className="gap-2">
              <Code className="w-4 h-4" />
              Templates ansehen
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="rounded border border-primary/20 bg-card p-4">
            <Package className="w-5 h-5 text-primary mb-2" />
            <div className="font-semibold">TypeScript-basiert</div>
            <div className="text-sm text-muted-foreground">
              SDK mit vollständiger Typensicherheit
            </div>
          </div>
          <div className="rounded border border-primary/20 bg-card p-4">
            <Zap className="w-5 h-5 text-primary mb-2" />
            <div className="font-semibold">CLI-getrieben</div>
            <div className="text-sm text-muted-foreground">
              `wetrack synth` und `wetrack deploy`
            </div>
          </div>
          <div className="rounded border border-primary/20 bg-card p-4">
            <Code className="w-5 h-5 text-primary mb-2" />
            <div className="font-semibold">Git-ready</div>
            <div className="text-sm text-muted-foreground">
              Versioniere deine Dashboards wie Code
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
