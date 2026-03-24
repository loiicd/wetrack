import { Card } from "@/components/ui/card";
import {
  FileText,
  Database,
  Filter,
  BarChart3,
  Send,
  CheckCircle2,
} from "lucide-react";

const steps = [
  {
    title: "Define",
    description: "Schreibe deine Stack.ts Datei",
    icon: FileText,
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  {
    title: "DataSources",
    description: "Verbinde APIs und externe Services",
    icon: Database,
    color: "bg-green-500/10 text-green-600 dark:text-green-400",
  },
  {
    title: "Transform",
    description: "JSONPath oder SQL Queries",
    icon: Filter,
    color: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  },
  {
    title: "Visualize",
    description: "Charts, Cards und Widgets",
    icon: BarChart3,
    color: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  },
  {
    title: "Deploy",
    description: "wetrack deploy stack.ts",
    icon: Send,
    color: "bg-pink-500/10 text-pink-600 dark:text-pink-400",
  },
  {
    title: "Live",
    description: "Echtzeitdaten in der Cloud",
    icon: CheckCircle2,
    color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
];

export function WorkflowTimeline() {
  return (
    <Card className="p-8 mb-8">
      <h2 className="text-2xl font-bold mb-8">Der WeTrack Workflow</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        {steps.map((step, idx) => {
          const IconComponent = step.icon;
          return (
            <div key={idx} className="relative">
              {/* Connector line */}
              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute left-[60%] top-10 w-[40%] h-0.5 bg-linear-to-r from-primary to-transparent" />
              )}

              <div className="flex flex-col items-center text-center">
                <div className={`${step.color} rounded-full p-3 mb-3`}>
                  <IconComponent className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-sm">{step.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 p-4 rounded-lg bg-muted/50 border text-sm text-muted-foreground text-center">
        <code className="font-mono">
          wetrack synth stack.ts && wetrack deploy stack.ts
        </code>
      </div>
    </Card>
  );
}
