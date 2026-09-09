"use client";

import { useRef, useState, type FormEvent } from "react";

import {
  Button,
  FormField,
  InlineError,
  Input,
  PasswordInput,
} from "@/shared/components/ui";

import {
  validateLoginCredentials,
  type LoginCredentials,
  type LoginFieldErrors,
} from "../schemas/login-form.schema";
import { loginFormContract } from "../schemas/login-form.contract";
import { createLoginSubmissionLock } from "../schemas/login-submission-lock";
import styles from "./login-form.module.css";

export type LoginFormResult =
  | { success: true }
  | {
      success: false;
      code:
        | "INVALID_CREDENTIALS"
        | "ACCOUNT_DISABLED"
        | "ACCOUNT_LOCKED"
        | "RATE_LIMITED"
        | "NETWORK_ERROR"
        | "UNKNOWN_ERROR";
      message: string;
      fieldErrors?: Record<string, string[]>;
    };

export type LoginFormProps = {
  onSubmit: (credentials: LoginCredentials) => Promise<LoginFormResult>;
};

type LoginFormState =
  | "idle"
  | "validating"
  | "submitting"
  | "success"
  | "invalid_credentials"
  | "account_disabled"
  | "account_locked"
  | "rate_limited"
  | "network_error"
  | "server_error";

const errorMessages: Record<
  Exclude<LoginFormState, "idle" | "validating" | "submitting" | "success">,
  string
> = {
  invalid_credentials: "بيانات تسجيل الدخول غير صحيحة",
  account_disabled: "هذا الحساب معطّل، تواصل مع المسؤول للمساعدة",
  account_locked: "هذا الحساب مقفل مؤقتًا، حاول مرة أخرى لاحقًا",
  rate_limited: "عدد المحاولات كبير، انتظر قليلًا ثم حاول مجددًا",
  network_error: "تعذّر إتمام تسجيل الدخول، تحقق من الاتصال وحاول مجددًا",
  server_error: "تعذّر إتمام تسجيل الدخول الآن، حاول مجددًا",
};

const resultState: Record<
  Exclude<LoginFormResult, { success: true }>["code"],
  LoginFormState
> = {
  INVALID_CREDENTIALS: "invalid_credentials",
  ACCOUNT_DISABLED: "account_disabled",
  ACCOUNT_LOCKED: "account_locked",
  RATE_LIMITED: "rate_limited",
  NETWORK_ERROR: "network_error",
  UNKNOWN_ERROR: "server_error",
};

export function LoginForm({ onSubmit }: LoginFormProps) {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    identity: "",
    password: "",
  });
  const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({});
  const [state, setState] = useState<LoginFormState>("idle");
  const identityRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const submissionLockRef = useRef(createLoginSubmissionLock());
  const submitting = state === "submitting";
  const generalError = errorMessages[state as keyof typeof errorMessages];

  const focusFirstInvalidField = (errors: LoginFieldErrors) => {
    if (errors.identity) identityRef.current?.focus();
    else if (errors.password) passwordRef.current?.focus();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const submissionLock = submissionLockRef.current;
    if (submitting || !submissionLock.tryAcquire()) return;

    setState("validating");
    const validationErrors = validateLoginCredentials(credentials);
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setState("idle");
      focusFirstInvalidField(validationErrors);
      submissionLock.release();
      return;
    }

    setFieldErrors({});
    setState("submitting");
    try {
      const result = await onSubmit(credentials);
      if (result.success) {
        setState("success");
        return;
      }

      const safeFieldErrors: LoginFieldErrors = {};
      if (result.fieldErrors?.identity)
        safeFieldErrors.identity = ["راجع هذا الحقل ثم حاول مجددًا"];
      if (result.fieldErrors?.password)
        safeFieldErrors.password = ["راجع هذا الحقل ثم حاول مجددًا"];
      setFieldErrors(safeFieldErrors);
      setState(resultState[result.code]);
      focusFirstInvalidField(safeFieldErrors);
    } catch {
      setState("network_error");
    } finally {
      submissionLock.release();
    }
  };

  return (
    <form
      className={styles.form}
      action={loginFormContract.action}
      method={loginFormContract.method}
      noValidate
      onSubmit={handleSubmit}
      aria-busy={submitting}
    >
      <div className={styles.fields}>
        {generalError && <InlineError>{generalError}</InlineError>}
        {state === "success" && (
          <p className="ui-success-message" role="status">
            تم تسجيل الدخول بنجاح
          </p>
        )}
        <FormField
          label="البريد الإلكتروني"
          message={fieldErrors.identity?.[0]}
          error={Boolean(fieldErrors.identity)}
        >
          <Input
            ref={identityRef}
            name="identity"
            autoComplete="username"
            value={credentials.identity}
            onChange={(event) =>
              setCredentials((value) => ({
                ...value,
                identity: event.target.value,
              }))
            }
            placeholder="name@company.com"
          />
        </FormField>
        <FormField
          label="كلمة المرور"
          message={fieldErrors.password?.[0]}
          error={Boolean(fieldErrors.password)}
        >
          <PasswordInput
            ref={passwordRef}
            name="password"
            autoComplete="current-password"
            value={credentials.password}
            onChange={(event) =>
              setCredentials((value) => ({
                ...value,
                password: event.target.value,
              }))
            }
            placeholder="أدخل كلمة المرور"
          />
        </FormField>
        <Button
          type="submit"
          loading={submitting}
          disabled={submitting}
          className={styles.submit ?? ""}
        >
          <span>تسجيل الدخول</span>
          <span className={styles.submitArrow} aria-hidden="true">
            ←
          </span>
        </Button>
        <div className={styles.assurance}>
          <span aria-hidden="true">⌾</span>
          بيانات الجلسة محمية ولا تظهر داخل المتصفح
        </div>
      </div>
    </form>
  );
}

export type { LoginCredentials };
