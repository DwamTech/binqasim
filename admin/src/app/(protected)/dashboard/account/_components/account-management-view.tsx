"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent, type ReactNode } from "react";

import { useAdminShellAdmin } from "@/shared/components/layout/admin-shell";
import { getAdminRoleLabel } from "@/shared/components/layout/admin-navigation.helpers";
import { PageContainer } from "@/shared/components/layout/page-container";
import { HeroSection } from "@/shared/components/ui";
import { dashboardCopy } from "@/core/config/dashboard-copy";

import styles from "./account-management-view.module.css";

type RequestState = {
  kind: "error" | "success";
  message: string;
  fields?: Record<string, string[]>;
} | null;

type BffPayload = {
  success?: boolean;
  data?: {
    account?: { id: string; name: string; email: string; role: string };
    message?: string;
  };
  error?: {
    message?: string;
    fieldErrors?: Record<string, string[]>;
  };
};

function Icon({
  children,
  viewBox = "0 0 24 24",
}: {
  children: ReactNode;
  viewBox?: string;
}) {
  return (
    <svg
      viewBox={viewBox}
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

function FieldMessage({ state, name }: { state: RequestState; name: string }) {
  const message = state?.fields?.[name]?.[0];
  return message ? <span className={styles.fieldError}>{message}</span> : null;
}

async function submitAccountRequest(
  url: string,
  method: "PATCH" | "PUT",
  body: object,
): Promise<{ ok: boolean; payload: BffPayload }> {
  const response = await fetch(url, {
    method,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = (await response.json().catch(() => ({}))) as BffPayload;
  return { ok: response.ok && payload.success === true, payload };
}

export function AccountManagementView() {
  const admin = useAdminShellAdmin();
  const router = useRouter();
  const [name, setName] = useState(admin.name);
  const [email, setEmail] = useState(admin.email);
  const [profileState, setProfileState] = useState<RequestState>(null);
  const [profileBusy, setProfileBusy] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [passwordState, setPasswordState] = useState<RequestState>(null);
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  const passwordChecks = useMemo(
    () => [
      { label: "٨ أحرف على الأقل", met: password.length >= 8 },
      {
        label: "حرف كبير وصغير",
        met: /[a-z]/.test(password) && /[A-Z]/.test(password),
      },
      { label: "رقم واحد على الأقل", met: /\d/.test(password) },
      {
        label: "متطابقة مع التأكيد",
        met: password.length > 0 && password === passwordConfirmation,
      },
    ],
    [password, passwordConfirmation],
  );

  const profileChanged =
    name.trim() !== admin.name || email.trim() !== admin.email;

  async function updateProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProfileBusy(true);
    setProfileState(null);
    try {
      const { ok, payload } = await submitAccountRequest(
        "/api/account/profile",
        "PATCH",
        { name: name.trim(), email: email.trim() },
      );
      if (!ok) {
        setProfileState({
          kind: "error",
          message:
            payload.error?.message ??
            "تعذر تحديث البيانات. راجع الحقول وحاول مرة أخرى.",
          ...(payload.error?.fieldErrors
            ? { fields: payload.error.fieldErrors }
            : {}),
        });
        return;
      }
      setProfileState({
        kind: "success",
        message: "تم حفظ الاسم والبريد الإلكتروني بنجاح.",
      });
      router.refresh();
    } catch {
      setProfileState({
        kind: "error",
        message: "تعذر الاتصال بالخادم الآن. حاول مرة أخرى بعد قليل.",
      });
    } finally {
      setProfileBusy(false);
    }
  }

  async function updatePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordState(null);
    if (password !== passwordConfirmation) {
      setPasswordState({
        kind: "error",
        message: "كلمتا المرور غير متطابقتين.",
        fields: { password_confirmation: ["أعد كتابة كلمة المرور نفسها."] },
      });
      return;
    }

    setPasswordBusy(true);
    try {
      const { ok, payload } = await submitAccountRequest(
        "/api/account/password",
        "PUT",
        {
          current_password: currentPassword,
          password,
          password_confirmation: passwordConfirmation,
        },
      );
      if (!ok) {
        setPasswordState({
          kind: "error",
          message:
            payload.error?.message ??
            "لم يتم تغيير كلمة المرور. راجع البيانات المدخلة.",
          ...(payload.error?.fieldErrors
            ? { fields: payload.error.fieldErrors }
            : {}),
        });
        return;
      }
      setCurrentPassword("");
      setPassword("");
      setPasswordConfirmation("");
      setPasswordState({
        kind: "success",
        message: "تم تغيير كلمة المرور بنجاح.",
      });
    } catch {
      setPasswordState({
        kind: "error",
        message: "تعذر الاتصال بالخادم الآن. حاول مرة أخرى بعد قليل.",
      });
    } finally {
      setPasswordBusy(false);
    }
  }

  return (
    <PageContainer
      header={
        <HeroSection
          eyebrow="إعدادات شخصية"
          title={dashboardCopy.common.account}
          description="حدّث بياناتك الأساسية وحافظ على أمان دخولك من مكان واحد."
          leading={
            <span className={styles.avatar} aria-hidden="true">
              {admin.name.trim().charAt(0).toUpperCase()}
            </span>
          }
          actions={
            <div className={styles.roleBadge}>
              <span className={styles.onlineDot} aria-hidden="true" />
              {getAdminRoleLabel(admin.role)}
            </div>
          }
        />
      }
    >
      <div className={styles.layout}>
        <div className={styles.forms}>
          <form className={styles.card} onSubmit={updateProfile}>
            <div className={styles.cardHeader}>
              <span className={`${styles.iconBox} ${styles.primaryIcon}`}>
                <Icon>
                  <path d="M20 21a8 8 0 0 0-16 0" />
                  <circle cx="12" cy="7" r="4" />
                </Icon>
              </span>
              <div>
                <h2>البيانات الشخصية</h2>
                <p>الاسم والبريد الظاهران داخل لوحة التحكم.</p>
              </div>
            </div>

            {profileState && (
              <div
                className={`${styles.notice} ${profileState.kind === "success" ? styles.success : styles.error}`}
                role="status"
              >
                {profileState.message}
              </div>
            )}

            <div className={styles.fieldsGrid}>
              <label className={styles.field}>
                <span>الاسم</span>
                <span className={styles.inputWrap}>
                  <Icon>
                    <path d="M20 21a8 8 0 0 0-16 0" />
                    <circle cx="12" cy="7" r="4" />
                  </Icon>
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    name="name"
                    autoComplete="name"
                    minLength={2}
                    maxLength={255}
                    required
                    aria-invalid={Boolean(profileState?.fields?.name)}
                  />
                </span>
                <FieldMessage state={profileState} name="name" />
              </label>

              <label className={styles.field}>
                <span>البريد الإلكتروني</span>
                <span className={styles.inputWrap}>
                  <Icon>
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="m3 7 9 6 9-6" />
                  </Icon>
                  <input
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    name="email"
                    type="email"
                    dir="ltr"
                    autoComplete="email"
                    maxLength={255}
                    required
                    aria-invalid={Boolean(profileState?.fields?.email)}
                  />
                </span>
                <FieldMessage state={profileState} name="email" />
              </label>
            </div>

            <div className={styles.cardFooter}>
              <span>لن تتغير صلاحيات الحساب من هذه الصفحة.</span>
              <button
                className={styles.primaryButton}
                type="submit"
                disabled={profileBusy || !profileChanged}
              >
                {profileBusy ? "جارٍ الحفظ…" : "حفظ التغييرات"}
              </button>
            </div>
          </form>

          <form className={styles.card} onSubmit={updatePassword}>
            <div className={styles.cardHeader}>
              <span className={`${styles.iconBox} ${styles.accentIcon}`}>
                <Icon>
                  <rect x="4" y="10" width="16" height="11" rx="2" />
                  <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" />
                </Icon>
              </span>
              <div>
                <h2>كلمة المرور</h2>
                <p>استخدم كلمة قوية لا تستعملها في حساب آخر.</p>
              </div>
            </div>

            {passwordState && (
              <div
                className={`${styles.notice} ${passwordState.kind === "success" ? styles.success : styles.error}`}
                role="status"
              >
                {passwordState.message}
              </div>
            )}

            <div className={styles.passwordGrid}>
              <label className={`${styles.field} ${styles.fullField}`}>
                <span>كلمة المرور الحالية</span>
                <span className={styles.inputWrap}>
                  <Icon>
                    <rect x="4" y="10" width="16" height="11" rx="2" />
                    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                  </Icon>
                  <input
                    value={currentPassword}
                    onChange={(event) => setCurrentPassword(event.target.value)}
                    name="current_password"
                    type={showPasswords ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    aria-invalid={Boolean(
                      passwordState?.fields?.current_password,
                    )}
                  />
                </span>
                <FieldMessage state={passwordState} name="current_password" />
              </label>
              <label className={styles.field}>
                <span>كلمة المرور الجديدة</span>
                <span className={styles.inputWrap}>
                  <Icon>
                    <path d="M7 14a5 5 0 1 1 3 4.58L7 22H4v-3H2v-3l5-5" />
                    <circle cx="16" cy="7" r=".6" fill="currentColor" />
                  </Icon>
                  <input
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    name="password"
                    type={showPasswords ? "text" : "password"}
                    autoComplete="new-password"
                    minLength={8}
                    required
                    aria-invalid={Boolean(passwordState?.fields?.password)}
                  />
                </span>
                <FieldMessage state={passwordState} name="password" />
              </label>
              <label className={styles.field}>
                <span>تأكيد كلمة المرور</span>
                <span className={styles.inputWrap}>
                  <Icon>
                    <path d="M7 14a5 5 0 1 1 3 4.58L7 22H4v-3H2v-3l5-5" />
                    <circle cx="16" cy="7" r=".6" fill="currentColor" />
                  </Icon>
                  <input
                    value={passwordConfirmation}
                    onChange={(event) =>
                      setPasswordConfirmation(event.target.value)
                    }
                    name="password_confirmation"
                    type={showPasswords ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    aria-invalid={Boolean(
                      passwordState?.fields?.password_confirmation,
                    )}
                  />
                </span>
                <FieldMessage
                  state={passwordState}
                  name="password_confirmation"
                />
              </label>
            </div>

            <div
              className={styles.passwordChecks}
              aria-label="متطلبات كلمة المرور"
            >
              {passwordChecks.map((check) => (
                <span
                  key={check.label}
                  className={check.met ? styles.checkMet : ""}
                >
                  <i aria-hidden="true">{check.met ? "✓" : "○"}</i>
                  {check.label}
                </span>
              ))}
            </div>

            <div className={styles.cardFooter}>
              <label className={styles.showPassword}>
                <input
                  type="checkbox"
                  checked={showPasswords}
                  onChange={(event) => setShowPasswords(event.target.checked)}
                />
                إظهار كلمات المرور
              </label>
              <button
                className={styles.secondaryButton}
                type="submit"
                disabled={
                  passwordBusy ||
                  !currentPassword ||
                  !password ||
                  !passwordConfirmation
                }
              >
                {passwordBusy ? "جارٍ التحديث…" : "تغيير كلمة المرور"}
              </button>
            </div>
          </form>
        </div>

        <aside className={styles.aside}>
          <section className={styles.summaryCard}>
            <span className={styles.miniAvatar} aria-hidden="true">
              {admin.name.trim().charAt(0).toUpperCase()}
            </span>
            <h2>{admin.name}</h2>
            <p dir="ltr">{admin.email}</p>
            <span className={styles.accountId}>ID · {admin.id}</span>
          </section>
          <section className={styles.securityCard}>
            <span className={styles.iconBox}>
              <Icon>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
                <path d="m9 12 2 2 4-4" />
              </Icon>
            </span>
            <div>
              <h3>حسابك محمي</h3>
              <p>
                لن نعرض كلمة مرورك أو نرسل رمز الجلسة إلى المتصفح. تغيير كلمة
                المرور يتطلب الحالية أولًا.
              </p>
            </div>
          </section>
        </aside>
      </div>
    </PageContainer>
  );
}
