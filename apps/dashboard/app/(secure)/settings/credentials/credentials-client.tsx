"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { KeyRound, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Credential = {
  id: string;
  label: string;
  type: string;
  headerName: string | null;
  createdAt: Date;
};

type Props = {
  credentials: Credential[];
};

const CREDENTIAL_TYPES = [
  { value: "api-key", label: "API Key (X-API-Key header)" },
  { value: "bearer", label: "Bearer Token (Authorization header)" },
  { value: "basic", label: "Basic Auth (username:password)" },
  { value: "header", label: "Custom Header" },
];

const CredentialsClient = ({ credentials }: Props) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deletingLabel, setDeletingLabel] = useState<string | null>(null);
  const [form, setForm] = useState({
    label: "",
    type: "api-key",
    value: "",
    headerName: "",
  });

  const handleCreate = async () => {
    if (!form.label || !form.value) return;
    setLoading(true);
    try {
      const res = await fetch("/api/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setOpen(false);
        setForm({ label: "", type: "api-key", value: "", headerName: "" });
        router.refresh();
      } else {
        const data = await res.json() as { error?: string };
        alert(data.error ?? "Fehler beim Speichern");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (label: string) => {
    if (!confirm(`Credential "${label}" wirklich löschen?`)) return;
    setDeletingLabel(label);
    try {
      await fetch(`/api/credentials/${encodeURIComponent(label)}`, {
        method: "DELETE",
      });
      router.refresh();
    } finally {
      setDeletingLabel(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            render={
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Credential hinzufügen
              </Button>
            }
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Neues Credential</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 pt-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="cred-label">Label</Label>
                <Input
                  id="cred-label"
                  placeholder="z.B. my-api-key"
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="cred-type">Typ</Label>
                <Select
                  value={form.type}
                  onValueChange={(v) => v && setForm({ ...form, type: v })}
                >
                  <SelectTrigger id="cred-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CREDENTIAL_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {form.type === "header" && (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="cred-header">Header Name</Label>
                  <Input
                    id="cred-header"
                    placeholder="z.B. X-Custom-Token"
                    value={form.headerName}
                    onChange={(e) => setForm({ ...form, headerName: e.target.value })}
                  />
                </div>
              )}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="cred-value">Wert</Label>
                <Input
                  id="cred-value"
                  type="password"
                  placeholder="Geheimer Wert"
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Wird AES-256-GCM-verschlüsselt gespeichert. Nach dem Speichern nicht mehr lesbar.
                </p>
              </div>
              <Button onClick={handleCreate} disabled={loading}>
                {loading ? "Speichern…" : "Speichern"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {credentials.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-12 text-center">
          <KeyRound className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Noch keine Credentials gespeichert.
          </p>
          <p className="text-xs text-muted-foreground">
            Füge Credentials hinzu, um sie in deinen DataSources zu referenzieren.
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Label</TableHead>
              <TableHead>Typ</TableHead>
              <TableHead>Erstellt</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {credentials.map((cred) => (
              <TableRow key={cred.id}>
                <TableCell className="font-mono text-sm">{cred.label}</TableCell>
                <TableCell>
                  {CREDENTIAL_TYPES.find((t) => t.value === cred.type)?.label ?? cred.type}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(cred.createdAt).toLocaleDateString("de-DE")}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={deletingLabel === cred.label}
                    onClick={() => handleDelete(cred.label)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default CredentialsClient;
