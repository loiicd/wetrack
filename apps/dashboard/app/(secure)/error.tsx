"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Etwas ist schiefgelaufen</h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          {error.message || "Ein unerwarteter Fehler ist aufgetreten."}
        </p>
        {error.digest && (
          <p className="text-xs text-muted-foreground font-mono">
            Fehler-ID: {error.digest}
          </p>
        )}
      </div>
      <Button onClick={reset} variant="outline">
        Erneut versuchen
      </Button>
    </div>
  );
}
