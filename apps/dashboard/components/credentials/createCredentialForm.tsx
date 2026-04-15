"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { createCredential } from "@/actions/credential/create";
import { KeyRound } from "lucide-react";

type Props = {
  onCreated: () => void;
};

const credentialTypes = [
  { value: "api-key", label: "API Key (X-Api-Key header)" },
  { value: "bearer", label: "Bearer Token (Authorization: Bearer)" },
  { value: "basic", label: "Basic Auth (Authorization: Basic)" },
  { value: "header", label: "Custom Header" },
] as const;

export function CreateCredentialForm({ onCreated }: Props) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [type, setType] = useState("api-key");

  const handleSubmit = async (formData: FormData) => {
    setPending(true);
    setError(null);
    const result = await createCredential(formData);
    setPending(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    onCreated();
  };

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="cred-label">Label</Label>
        <Input
          id="cred-label"
          name="label"
          placeholder="e.g. my-api-key"
          required
          maxLength={100}
        />
        <p className="text-xs text-muted-foreground">
          Reference this label in your DataSource config as{" "}
          <code className="rounded bg-muted px-1 py-0.5">
            credential: &quot;my-api-key&quot;
          </code>
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cred-type">Type</Label>
        <NativeSelect
          id="cred-type"
          name="type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full"
        >
          {credentialTypes.map((t) => (
            <NativeSelectOption key={t.value} value={t.value}>
              {t.label}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>

      {type === "header" && (
        <div className="space-y-2">
          <Label htmlFor="cred-headerName">Header Name</Label>
          <Input
            id="cred-headerName"
            name="headerName"
            placeholder="e.g. X-Custom-Auth"
            required
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="cred-value">Secret Value</Label>
        <Input
          id="cred-value"
          name="value"
          type="password"
          placeholder="Enter secret value"
          required
          autoComplete="off"
        />
        <p className="text-xs text-muted-foreground">
          The value is stored securely in Infisical and never displayed after saving.
        </p>
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <Button type="submit" disabled={pending}>
        <KeyRound data-icon="inline-start" />
        {pending ? "Saving…" : "Create Credential"}
      </Button>
    </form>
  );
}
