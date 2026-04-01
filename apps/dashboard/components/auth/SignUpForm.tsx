"use client";

import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import Link from "next/link";
import { Loader2Icon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";

const registerSchema = z.object({
  firstName: z.string().min(1, "Vorname ist erforderlich."),
  lastName: z.string().min(1, "Nachname ist erforderlich."),
  email: z.email("Bitte gib eine gültige E-Mail-Adresse ein."),
  password: z
    .string()
    .min(8, "Passwort muss mindestens 8 Zeichen lang sein."),
});

const verifySchema = z.object({
  code: z
    .string()
    .length(6, "Der Code muss 6 Ziffern lang sein.")
    .regex(/^\d+$/, "Nur Ziffern erlaubt."),
});

type RegisterValues = z.infer<typeof registerSchema>;
type VerifyValues = z.infer<typeof verifySchema>;

export function SignUpForm() {
  const { signUp, errors: clerkErrors, fetchStatus } = useSignUp();
  const router = useRouter();
  const [step, setStep] = useState<"register" | "verify">("register");

  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { firstName: "", lastName: "", email: "", password: "" },
  });

  const verifyForm = useForm<VerifyValues>({
    resolver: zodResolver(verifySchema),
    defaultValues: { code: "" },
  });

  const isLoading =
    fetchStatus === "fetching" ||
    registerForm.formState.isSubmitting ||
    verifyForm.formState.isSubmitting;

  const handleRegister = async (values: RegisterValues) => {
    const { error } = await signUp.password({
      emailAddress: values.email,
      password: values.password,
      firstName: values.firstName,
      lastName: values.lastName,
    });

    if (error) return;

    const { error: sendError } = await signUp.verifications.sendEmailCode();
    if (sendError) return;

    setStep("verify");
  };

  const handleVerify = async (values: VerifyValues) => {
    const { error } = await signUp.verifications.verifyEmailCode({
      code: values.code,
    });

    if (error) return;

    if (signUp.status === "complete") {
      await signUp.finalize({
        navigate: async ({ session, decorateUrl }) => {
          const destination = session.currentTask
            ? `/signUp/tasks/${session.currentTask.key}`
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
    }
  };

  const globalErrors = clerkErrors?.global ?? [];
  const emailError = clerkErrors?.fields?.emailAddress;
  const passwordError = clerkErrors?.fields?.password;
  const firstNameError = clerkErrors?.fields?.firstName;
  const lastNameError = clerkErrors?.fields?.lastName;
  const codeError = clerkErrors?.fields?.code;

  if (step === "verify") {
    return (
      <div className="w-full max-w-sm space-y-6" data-testid="verify-email-form">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-bold">E-Mail bestätigen</h1>
          <p className="text-sm text-muted-foreground">
            Wir haben einen 6-stelligen Code an deine E-Mail gesendet.
          </p>
        </div>

        <form onSubmit={verifyForm.handleSubmit(handleVerify)} noValidate>
          <FieldGroup>
            <FieldSet>
              {globalErrors.length > 0 && (
                <div
                  className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
                  data-testid="verify-global-error"
                >
                  {globalErrors[0]?.message}
                </div>
              )}

              <Field
                data-invalid={!!verifyForm.formState.errors.code || !!codeError}
              >
                <FieldLabel htmlFor="code">Bestätigungscode</FieldLabel>
                <Input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="000000"
                  autoComplete="one-time-code"
                  data-testid="verify-code"
                  aria-invalid={
                    !!verifyForm.formState.errors.code || !!codeError
                  }
                  {...verifyForm.register("code")}
                />
                {verifyForm.formState.errors.code && (
                  <FieldError errors={[verifyForm.formState.errors.code]} />
                )}
                {codeError && !verifyForm.formState.errors.code && (
                  <p className="text-sm text-destructive">{codeError.message}</p>
                )}
              </Field>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
                data-testid="verify-submit"
              >
                {isLoading ? (
                  <Loader2Icon className="animate-spin" />
                ) : (
                  "Bestätigen"
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setStep("register")}
                data-testid="verify-back"
              >
                Zurück
              </Button>
            </FieldSet>
          </FieldGroup>
        </form>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm space-y-6" data-testid="sign-up-form">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-bold">Konto erstellen</h1>
        <p className="text-sm text-muted-foreground">
          Registriere dich für WeTrack
        </p>
      </div>

      <form onSubmit={registerForm.handleSubmit(handleRegister)} noValidate>
        <FieldGroup>
          <FieldSet>
            {globalErrors.length > 0 && (
              <div
                className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
                data-testid="sign-up-global-error"
              >
                {globalErrors[0]?.message}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <Field data-invalid={!!registerForm.formState.errors.firstName || !!firstNameError}>
                <FieldLabel htmlFor="firstName">Vorname</FieldLabel>
                <Input
                  id="firstName"
                  type="text"
                  autoComplete="given-name"
                  data-testid="sign-up-firstname"
                  {...registerForm.register("firstName")}
                />
                {registerForm.formState.errors.firstName && (
                  <FieldError errors={[registerForm.formState.errors.firstName]} />
                )}
              </Field>

              <Field data-invalid={!!registerForm.formState.errors.lastName || !!lastNameError}>
                <FieldLabel htmlFor="lastName">Nachname</FieldLabel>
                <Input
                  id="lastName"
                  type="text"
                  autoComplete="family-name"
                  data-testid="sign-up-lastname"
                  {...registerForm.register("lastName")}
                />
                {registerForm.formState.errors.lastName && (
                  <FieldError errors={[registerForm.formState.errors.lastName]} />
                )}
              </Field>
            </div>

            <Field
              data-invalid={!!registerForm.formState.errors.email || !!emailError}
            >
              <FieldLabel htmlFor="email">E-Mail</FieldLabel>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                data-testid="sign-up-email"
                aria-invalid={
                  !!registerForm.formState.errors.email || !!emailError
                }
                {...registerForm.register("email")}
              />
              {registerForm.formState.errors.email && (
                <FieldError errors={[registerForm.formState.errors.email]} />
              )}
              {emailError && !registerForm.formState.errors.email && (
                <p className="text-sm text-destructive">{emailError.message}</p>
              )}
            </Field>

            <Field
              data-invalid={
                !!registerForm.formState.errors.password || !!passwordError
              }
            >
              <FieldLabel htmlFor="password">Passwort</FieldLabel>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                data-testid="sign-up-password"
                aria-invalid={
                  !!registerForm.formState.errors.password || !!passwordError
                }
                {...registerForm.register("password")}
              />
              {registerForm.formState.errors.password && (
                <FieldError errors={[registerForm.formState.errors.password]} />
              )}
              {passwordError && !registerForm.formState.errors.password && (
                <p className="text-sm text-destructive">
                  {passwordError.message}
                </p>
              )}
            </Field>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
              data-testid="sign-up-submit"
            >
              {isLoading ? (
                <Loader2Icon className="animate-spin" />
              ) : (
                "Konto erstellen"
              )}
            </Button>
          </FieldSet>
        </FieldGroup>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Bereits registriert?{" "}
        <Link
          href="/signIn/[[...signIn]]"
          className="font-medium text-foreground underline-offset-4 hover:underline"
          data-testid="sign-up-signin-link"
        >
          Anmelden
        </Link>
      </p>
    </div>
  );
}
