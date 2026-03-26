"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { CheckCircle2, Key, Terminal, Rocket } from "lucide-react";
import { useState } from "react";

const STEPS = [
  {
    icon: Key,
    title: "API Key erstellen",
    description: "Gehe zu Settings → API Keys und erstelle deinen ersten API Key für die CLI.",
    code: null,
  },
  {
    icon: Terminal,
    title: "CLI installieren",
    description: "Installiere die WeTrack CLI mit Bun oder npm:",
    code: "bun add -g @wetrack/cli",
  },
  {
    icon: Rocket,
    title: "Ersten Stack deployen",
    description: "Erstelle eine Stack-Datei und deploye sie zur WeTrack-Instanz:",
    code: `WETRACK_API_KEY=<dein-api-key>
wetrack deploy mystack.ts`,
  },
];

type Props = {
  open: boolean;
  onClose: () => void;
};

const OnboardingModal = ({ open, onClose }: Props) => {
  const [step, setStep] = useState(0);
  const currentStep = STEPS[step];
  const Icon = currentStep.icon;
  const isLast = step === STEPS.length - 1;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Icon className="h-4 w-4" />
            </span>
            Willkommen bei WeTrack
          </DialogTitle>
          <DialogDescription>
            Schritt {step + 1} von {STEPS.length}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  i <= step ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="font-semibold">{currentStep.title}</h3>
            <p className="text-sm text-muted-foreground">{currentStep.description}</p>
            {currentStep.code && (
              <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs">
                <code>{currentStep.code}</code>
              </pre>
            )}
          </div>

          {step > 0 && (
            <div className="flex flex-col gap-1">
              {STEPS.slice(0, step).map((s) => (
                <div key={s.title} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  {s.title}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-between gap-2 pt-2">
          <Button variant="ghost" onClick={onClose} size="sm">
            Überspringen
          </Button>
          <Button
            onClick={() => {
              if (isLast) {
                onClose();
              } else {
                setStep((s) => s + 1);
              }
            }}
            size="sm"
          >
            {isLast ? "Los geht's 🚀" : "Weiter"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingModal;
