"use client";

import z from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "./ui/field";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { inviteMembership } from "@/actions/membership/invite";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";

const formSchema = z.object({
  email: z.email({ error: "Bitte eine gültige E-Mail-Adresse eingeben." }),
  role: z.enum(["org:admin", "org:member"]),
});

const InviteUserForm = () => {
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: "org:member",
    },
  });

  const selectItems = [
    { value: "org:admin", label: "Admin" },
    { value: "org:member", label: "Member" },
  ];

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    const result = await inviteMembership(data.email, data.role);
    if (result.success) {
      form.reset();
      router.refresh();
    } else {
      toast.error(result.error || "Failed to invite user");
    }
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} noValidate>
      <FieldGroup>
        <FieldSet>
          <Controller
            control={form.control}
            name="email"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>E-Mail</FieldLabel>
                <Input aria-invalid={fieldState.invalid} type="email" {...field} />
                {fieldState.error && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Controller
            control={form.control}
            name="role"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Role</FieldLabel>
                <Select
                  value={field.value}
                  items={selectItems}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className="w-45">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {selectItems.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {fieldState.error && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Button type="submit">
            {form.formState.isSubmitting ? (
              <Loader2Icon className="animate-spin" />
            ) : (
              "Invite"
            )}
          </Button>
        </FieldSet>
      </FieldGroup>
    </form>
  );
};

export default InviteUserForm;
