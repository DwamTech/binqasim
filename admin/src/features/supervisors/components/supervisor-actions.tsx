"use client";

import { useState } from "react";

import { FormField, PasswordInput } from "@/shared/components/ui/forms";
import { Dialog } from "@/shared/components/ui/overlays";
import { Button } from "@/shared/components/ui/primitives";

import {
  passwordChangeSchema,
  type Supervisor,
} from "../supervisors.contracts";
import {
  changeSupervisorPassword,
  deleteSupervisor,
  setSupervisorActive,
} from "../supervisors.client";
import styles from "./supervisors.module.css";

type Operation = "activate" | "deactivate" | "delete" | "password";

export function SupervisorActions({
  supervisor,
  onComplete,
  allowPassword = false,
}: {
  supervisor: Supervisor;
  onComplete: (message: string) => void;
  allowPassword?: boolean;
}) {
  const [operation, setOperation] = useState<Operation>();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");

  const execute = async () => {
    if (!operation || saving) return;
    if (operation === "password") {
      const parsed = passwordChangeSchema.safeParse({
        password,
        password_confirmation: confirmation,
      });
      if (!parsed.success) {
        setError(
          parsed.error.flatten().fieldErrors.password_confirmation?.[0] ??
            "كلمة المرور لا تستوفي الشروط.",
        );
        return;
      }
    }
    setSaving(true);
    setError("");
    try {
      if (operation === "activate")
        await setSupervisorActive(supervisor.id, true);
      if (operation === "deactivate")
        await setSupervisorActive(supervisor.id, false);
      if (operation === "delete") await deleteSupervisor(supervisor.id);
      if (operation === "password")
        await changeSupervisorPassword(supervisor.id, {
          password,
          password_confirmation: confirmation,
        });
      const message =
        operation === "password"
          ? "تم تغيير كلمة المرور."
          : operation === "activate"
            ? "تم تفعيل الحساب."
            : operation === "delete"
              ? "تم حذف حساب المشرف."
              : "تم تعطيل الحساب.";
      setOperation(undefined);
      setPassword("");
      setConfirmation("");
      onComplete(message);
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "تعذر تنفيذ العملية.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.actionButtons}>
      <Button
        variant="secondary"
        onClick={() =>
          setOperation(supervisor.is_active ? "deactivate" : "activate")
        }
      >
        {supervisor.is_active ? "تعطيل" : "تفعيل"}
      </Button>
      {allowPassword && (
        <Button variant="secondary" onClick={() => setOperation("password")}>
          تغيير كلمة المرور
        </Button>
      )}
      <Button variant="danger" onClick={() => setOperation("delete")}>
        حذف
      </Button>
      <Dialog
        open={Boolean(operation)}
        onOpenChange={(open) => {
          if (!open && !saving) setOperation(undefined);
        }}
        title={
          operation === "password"
            ? "تغيير كلمة المرور"
            : operation === "activate"
              ? "تفعيل حساب المشرف"
              : operation === "delete"
                ? "حذف حساب المشرف"
                : "تعطيل حساب المشرف"
        }
        dismissible={!saving}
        footer={
          <div className={styles.dialogActions}>
            <Button
              variant="secondary"
              disabled={saving}
              onClick={() => setOperation(undefined)}
            >
              إلغاء
            </Button>
            <Button
              variant={operation === "activate" ? "primary" : "danger"}
              loading={saving}
              onClick={() => void execute()}
            >
              تأكيد
            </Button>
          </div>
        }
      >
        {operation === "password" ? (
          <div className={styles.passwordFields}>
            <FormField label="كلمة المرور الجديدة">
              <PasswordInput
                value={password}
                autoComplete="new-password"
                onChange={(event) => setPassword(event.target.value)}
              />
            </FormField>
            <FormField label="تأكيد كلمة المرور">
              <PasswordInput
                value={confirmation}
                autoComplete="new-password"
                onChange={(event) => setConfirmation(event.target.value)}
              />
            </FormField>
          </div>
        ) : (
          <p>
            {operation === "activate"
              ? "سيتم السماح لهذا المشرف بالدخول مجددًا."
              : operation === "delete"
                ? "سيُحذف حساب المشرف من القائمة مع الاحتفاظ بالمحتوى المرتبط به. لا يمكن التراجع عن هذه العملية من لوحة التحكم."
                : "سيُمنع هذا المشرف من الوصول بعد التحقق التالي من الجلسة."}
          </p>
        )}
        {error && (
          <p className={styles.errorNotice} role="alert">
            {error}
          </p>
        )}
      </Dialog>
    </div>
  );
}
