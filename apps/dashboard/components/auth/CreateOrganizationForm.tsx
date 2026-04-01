"use client";

import { useOrganizationList } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { toast } from "sonner";

const formSchema = z.object({
  name: z
    .string()
    .min(2, "Name muss mindestens 2 Zeichen lang sein.")
    .max(64, "Name darf maximal 64 Zeichen lang sein."),
});

type FormValues = z.infer<typeof formSchema>;

type Props = {
  onSuccess?: () => void;
};

export function CreateOrganizationForm({ onSuccess }: Props) {
  const { createOrganization, setActive } = useOrganizationList();
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "" },
  });

  const handleSubmit = async (values: FormValues) => {
    if (!createOrganization) return;

    try {
      const org = await createOrganization({ name: values.name });
      if (setActive) {
        await setActive({ organization: org.id });
      }
      toast.success(`Organisation "${org.name}" wurde erstellt.`);
      form.reset();
      onSuccess?.();
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Organisation konnte nicht erstellt werden.";
      toast.error(message);
    }
  };

  return (
    <form
      onSubmit={form.handleSubmit(handleSubmit)}
      noValidate
      data-testid="create-org-form"
    >
      <FieldGroup>
        <FieldSet>
          <Field data-invalid={!!form.formState.errors.name}>
            <FieldLabel htmlFor="org-name">Organisationsname</FieldLabel>
            <Input
              id="org-name"
              type="text"
              placeholder="Meine Organisation"
              autoComplete="organization"
              data-testid="create-org-name"
              aria-invalid={!!form.formState.errors.name}
              {...form.register("name")}
            />
            {form.formState.errors.name && (
              <FieldError errors={[form.formState.errors.name]} />
            )}
          </Field>

          <Button
            type="submit"
            className="w-full"
            disabled={form.formState.isSubmitting}
            data-testid="create-org-submit"
          >
            {form.formState.isSubmitting ? (
              <Loader2Icon className="animate-spin" />
            ) : (
              "Organisation erstellen"
            )}
          </Button>
        </FieldSet>
      </FieldGroup>
    </form>
  );
}
