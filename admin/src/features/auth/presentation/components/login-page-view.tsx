"use client";

import type { LoginFormProps } from "./login-form";
import { LoginForm } from "./login-form";
import { AuthShell } from "@/shared/components/layout/auth-shell";

export function LoginPageView({ onSubmit }: LoginFormProps) {
  return (
    <AuthShell
      title="أهلًا بعودتك"
      description="سجّل الدخول للمتابعة إلى لوحة التحكم"
      version="الإصدار ١.٠"
    >
      <LoginForm onSubmit={onSubmit} />
    </AuthShell>
  );
}
