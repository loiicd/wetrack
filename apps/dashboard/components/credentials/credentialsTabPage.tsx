"use client";

import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CreateCredentialForm } from "./createCredentialForm";
import { Plus, Trash2, KeyRound, AlertTriangle } from "lucide-react";

type Credential = {
  id: string;
  label: string;
  type: string;
  headerName: string | null;
  createdAt: string;
  updatedAt: string;
};

const typeLabels: Record<string, string> = {
  "api-key": "API Key",
  bearer: "Bearer",
  basic: "Basic Auth",
  header: "Custom Header",
};

export function CredentialsTabPage() {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [vaultConfigured, setVaultConfigured] = useState(true);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deletingLabel, setDeletingLabel] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const fetchCredentials = async () => {
    const res = await fetch("/api/credentials");
    if (res.status === 503) {
      setVaultConfigured(false);
      setLoading(false);
      return;
    }
    if (res.ok) {
      const data: Credential[] = await res.json();
      setCredentials(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCredentials();
  }, []);

  const handleDelete = async (label: string) => {
    setDeletingLabel(label);
    await fetch(`/api/credentials/${encodeURIComponent(label)}`, { method: "DELETE" });
    startTransition(() => {
      fetchCredentials();
    });
    setDeletingLabel(null);
  };

  const handleCreated = () => {
    setDialogOpen(false);
    fetchCredentials();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-muted-foreground">Loading credentials…</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Credential Vault</h2>
          <p className="text-sm text-muted-foreground">
            Manage encrypted credentials for your data source connections.
          </p>
        </div>
        {vaultConfigured && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger
              render={
                <Button>
                  <Plus data-icon="inline-start" />
                  Add Credential
                </Button>
              }
            />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Credential</DialogTitle>
                <DialogDescription>
                  Create a new encrypted credential for use in DataSource configurations.
                </DialogDescription>
              </DialogHeader>
              <CreateCredentialForm onCreated={handleCreated} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {!vaultConfigured && (
        <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-destructive" />
          <div className="space-y-1">
            <p className="text-sm font-medium">Vault not configured</p>
            <p className="text-sm text-muted-foreground">
              Set the{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-xs">VAULT_SECRET</code>{" "}
              environment variable to enable the Credential Vault.
            </p>
          </div>
        </div>
      )}

      {vaultConfigured && credentials.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
          <KeyRound className="mb-3 size-8 text-muted-foreground" />
          <p className="text-sm font-medium">No credentials yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Add a credential to securely inject API keys and tokens into your data sources.
          </p>
        </div>
      )}

      {credentials.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Label</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Header</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {credentials.map((cred) => (
              <TableRow key={cred.id}>
                <TableCell className="font-mono text-sm">{cred.label}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{typeLabels[cred.type] ?? cred.type}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {cred.type === "header" ? cred.headerName ?? "—" : "—"}
                </TableCell>
                <TableCell className="font-mono text-muted-foreground">••••••••</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(cred.updatedAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button
                    variant="destructive"
                    size="icon-xs"
                    onClick={() => handleDelete(cred.label)}
                    disabled={deletingLabel === cred.label}
                  >
                    <Trash2 />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
