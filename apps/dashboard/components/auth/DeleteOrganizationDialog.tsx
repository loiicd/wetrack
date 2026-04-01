"use client";

import { useState } from "react";
import { useOrganization, useClerk } from "@clerk/nextjs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { Loader2Icon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { deleteOrganization } from "@/actions/organization/delete";
import { toast } from "sonner";

type Props = {
  organizationName: string;
};

export function DeleteOrganizationDialog({ organizationName }: Props) {
  const [open, setOpen] = useState(false);
  const { signOut } = useClerk();
  const { organization } = useOrganization();

  const confirmSchema = z.object({
    name: z.literal(organizationName, {
      error: `Gib "${organizationName}" ein, um zu bestätigen.`,
    }),
  });

  const form = useForm<{ name: string }>({
    resolver: zodResolver(confirmSchema),
    defaultValues: { name: "" },
  });

  const handleDelete = async () => {
    const result = await deleteOrganization();
    if (!result.success) {
      toast.error(`Fehler: ${result.error}`);
      return;
    }
    toast.success("Organisation wurde gelöscht.");
    setOpen(false);
    // Sign out and redirect since the org no longer exists
    await signOut({ redirectUrl: "/signIn" });
  };

  if (!organization) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="destructive"
            size="sm"
            data-testid="delete-org-trigger"
          >
            <Trash2Icon />
            Organisation löschen
          </Button>
        }
      />
      <DialogContent data-testid="delete-org-dialog">
        <DialogHeader>
          <DialogTitle>Organisation löschen</DialogTitle>
          <DialogDescription>
            Diese Aktion ist{" "}
            <strong>unwiderruflich</strong>. Alle Dashboards, DataSources,
            Queries und Credentials dieser Organisation werden permanent
            gelöscht.
          </DialogDescription>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          Gib <strong className="text-foreground">{organizationName}</strong>{" "}
          ein, um zu bestätigen:
        </p>

        <form onSubmit={form.handleSubmit(handleDelete)} noValidate>
          <FieldGroup>
            <FieldSet>
              <Field data-invalid={!!form.formState.errors.name}>
                <FieldLabel htmlFor="confirm-name" className="sr-only">
                  Organisationsname bestätigen
                </FieldLabel>
                <Input
                  id="confirm-name"
                  type="text"
                  placeholder={organizationName}
                  data-testid="delete-org-confirm-input"
                  aria-invalid={!!form.formState.errors.name}
                  {...form.register("name")}
                />
                {form.formState.errors.name && (
                  <FieldError errors={[form.formState.errors.name]} />
                )}
              </Field>

              <Button
                type="submit"
                variant="destructive"
                className="w-full"
                disabled={form.formState.isSubmitting}
                data-testid="delete-org-confirm-submit"
              >
                {form.formState.isSubmitting ? (
                  <Loader2Icon className="animate-spin" />
                ) : (
                  "Organisation endgültig löschen"
                )}
              </Button>
            </FieldSet>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
