"use client";

import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import Link from "next/link";
import type { Route } from "next";
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

const formSchema = z.object({
  email: z.email("Bitte gib eine gültige E-Mail-Adresse ein."),
  password: z.string().min(1, "Passwort ist erforderlich."),
});

type FormValues = z.infer<typeof formSchema>;

export function SignInForm() {
  const { signIn, errors: clerkErrors, fetchStatus } = useSignIn();
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });

  const isLoading = fetchStatus === "fetching" || form.formState.isSubmitting;
  const isReady = !!signIn;

  const handleSubmit = async (values: FormValues) => {
    if (!signIn) return;

    const { error } = await signIn.password({
      identifier: values.email,
      password: values.password,
    });

    if (error) return;

    await signIn.finalize({
      navigate: async ({ session, decorateUrl }) => {
        const destination = session.currentTask
          ? `/signIn/tasks/${session.currentTask.key}`
          : "/";
        const url = decorateUrl(destination);
        if (url.startsWith("http")) {
          window.location.href = url;
        } else {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          router.push(url as any);
        }
      },
    });
  };

  const globalErrors = clerkErrors?.global ?? [];
  const emailError = clerkErrors?.fields?.identifier;
  const passwordError = clerkErrors?.fields?.password;

  return (
    <div className="w-full max-w-sm space-y-6" data-testid="sign-in-form">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-bold">Willkommen zurück</h1>
        <p className="text-sm text-muted-foreground">
          Melde dich mit deiner E-Mail an
        </p>
      </div>

      <form onSubmit={form.handleSubmit(handleSubmit)} noValidate>
        <FieldGroup>
          <FieldSet>
            {globalErrors.length > 0 && (
              <div
                className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
                data-testid="sign-in-global-error"
              >
                {globalErrors[0]?.message}
              </div>
            )}

            <Field data-invalid={!!form.formState.errors.email || !!emailError}>
              <FieldLabel htmlFor="email">E-Mail</FieldLabel>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                data-testid="sign-in-email"
                aria-invalid={!!form.formState.errors.email || !!emailError}
                {...form.register("email")}
              />
              {form.formState.errors.email && (
                <FieldError errors={[form.formState.errors.email]} />
              )}
              {emailError && !form.formState.errors.email && (
                <p className="text-sm text-destructive">{emailError.message}</p>
              )}
            </Field>

            <Field
              data-invalid={!!form.formState.errors.password || !!passwordError}
            >
              <FieldLabel htmlFor="password">Passwort</FieldLabel>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                data-testid="sign-in-password"
                aria-invalid={
                  !!form.formState.errors.password || !!passwordError
                }
                {...form.register("password")}
              />
              {form.formState.errors.password && (
                <FieldError errors={[form.formState.errors.password]} />
              )}
              {passwordError && !form.formState.errors.password && (
                <p className="text-sm text-destructive">
                  {passwordError.message}
                </p>
              )}
            </Field>

            <div className="flex justify-end">
              <Link
                href="/signIn/forgot-password"
                className="text-xs text-muted-foreground hover:text-foreground"
                data-testid="sign-in-forgot-password"
              >
                Passwort vergessen?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !isReady}
              data-testid="sign-in-submit"
            >
              {isLoading ? (
                <Loader2Icon className="animate-spin" />
              ) : (
                "Anmelden"
              )}
            </Button>
          </FieldSet>
        </FieldGroup>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Noch kein Konto?{" "}
        <Link
          href={"/signUp" as Route}
          className="font-medium text-foreground underline-offset-4 hover:underline"
          data-testid="sign-in-signup-link"
        >
          Registrieren
        </Link>
      </p>
    </div>
  );
}
