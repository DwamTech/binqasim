"use client";

import { useEffect, useState } from "react";

import { Button, Input, Skeleton } from "@/shared/components/ui/primitives";
import { ErrorState } from "@/shared/components/ui/feedback";
import { FormField } from "@/shared/components/ui/forms";

import {
  businessSettingsSchema,
  phoneSettingsSchema,
  siteContactUpdateSchema,
  socialSettingsSchema,
  type SiteContact,
} from "../settings.contracts";
import {
  getContact,
  SettingsClientError,
  updateContact,
  updateContactFamily,
} from "../settings.client";
import styles from "./settings.module.css";

type Values = Record<string, string>;
type Family = "social" | "phones" | "business";

const fieldGroups = {
  social: [
    ["youtube", "YouTube"],
    ["twitter", "X / Twitter"],
    ["facebook", "Facebook"],
    ["snapchat", "Snapchat"],
    ["instagram", "Instagram"],
    ["tiktok", "TikTok"],
  ],
  phones: [
    ["support_phone", "هاتف الدعم"],
    ["management_phone", "هاتف الإدارة"],
    ["backup_phone", "الهاتف الاحتياطي"],
  ],
  business: [
    ["address", "العنوان"],
    ["commercial_register", "السجل التجاري"],
    ["email", "البريد الإلكتروني"],
  ],
} as const;

const familyContracts = {
  social: socialSettingsSchema,
  phones: phoneSettingsSchema,
  business: businessSettingsSchema,
};

const emptyValues: Values = Object.fromEntries(
  Object.values(fieldGroups)
    .flat()
    .map(([key]) => [key, ""]),
);

function valuesFromContact(contact: SiteContact): Values {
  return Object.fromEntries(
    Object.entries({
      ...contact.social,
      ...contact.phones,
      ...contact.business_details,
    }).map(([key, value]) => [key, value ?? ""]),
  );
}

export function ContactSettings() {
  const [contact, setContact] = useState<SiteContact>();
  const [values, setValues] = useState<Values>(emptyValues);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState<Family | "all">();
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    async function load() {
      setLoading(true);
      setLoadError("");
      try {
        const result = await getContact(controller.signal);
        if (!active) return;
        setContact(result);
        setValues(valuesFromContact(result));
      } catch (reason) {
        if (!active) return;
        setLoadError(
          reason instanceof Error ? reason.message : "تعذر تحميل البيانات.",
        );
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
      controller.abort();
    };
  }, [reloadKey]);

  const save = async (family: Family | "all") => {
    const keys =
      family === "all"
        ? Object.keys(values)
        : fieldGroups[family].map(([key]) => key);
    const candidate = Object.fromEntries(keys.map((key) => [key, values[key]]));
    const contract =
      family === "all" ? siteContactUpdateSchema : familyContracts[family];
    const parsed = contract.safeParse(candidate);
    if (!parsed.success) {
      setFieldErrors(parsed.error.flatten().fieldErrors);
      setError("راجع الحقول الموضحة قبل الحفظ.");
      return;
    }
    setSaving(family);
    setError("");
    setNotice("");
    setFieldErrors({});
    try {
      if (family === "all") await updateContact(parsed.data);
      else await updateContactFamily(family, parsed.data);
      setNotice(
        family === "all"
          ? "تم حفظ جميع بيانات التواصل."
          : "تم حفظ هذه المجموعة بنجاح.",
      );
    } catch (reason) {
      if (reason instanceof SettingsClientError)
        setFieldErrors(reason.fieldErrors ?? {});
      setError(reason instanceof Error ? reason.message : "تعذر الحفظ.");
    } finally {
      setSaving(undefined);
    }
  };

  if (loading)
    return (
      <div className={styles.loadingGrid} aria-busy="true">
        {[1, 2, 3].map((item) => (
          <Skeleton key={item} className={styles.cardSkeleton ?? ""} />
        ))}
      </div>
    );
  if (loadError)
    return (
      <ErrorState
        title="تعذر تحميل بيانات التواصل"
        description={loadError}
        onRetry={() => setReloadKey((value) => value + 1)}
      />
    );
  if (!contact) return null;

  return (
    <div className={styles.sectionStack}>
      <div className={styles.sectionHeading}>
        <div>
          <span className={styles.kicker}>متاح لمفوّضي الإعدادات</span>
          <h2>بيانات التواصل والمنشأة</h2>
          <p>كل بطاقة تُحفظ بصورة مستقلة، ويمكن حفظ الكل من الشريط الأخير.</p>
        </div>
        <span className={styles.recordMeta}>سجل #{contact.id}</span>
      </div>
      {notice && (
        <p className={styles.successNotice} role="status">
          {notice}
        </p>
      )}
      {error && (
        <p className={styles.errorNotice} role="alert">
          {error}
        </p>
      )}
      <div className={styles.cardGrid}>
        <ContactCard
          family="business"
          title="بيانات المنشأة"
          description="العنوان والبريد والسجل التجاري الظاهر للجمهور."
          values={values}
          fieldErrors={fieldErrors}
          saving={saving}
          onChange={(key, value) =>
            setValues((current) => ({ ...current, [key]: value }))
          }
          onSave={save}
        />
        <ContactCard
          family="phones"
          title="أرقام التواصل"
          description="أرقام الدعم والإدارة والقناة الاحتياطية."
          values={values}
          fieldErrors={fieldErrors}
          saving={saving}
          onChange={(key, value) =>
            setValues((current) => ({ ...current, [key]: value }))
          }
          onSave={save}
        />
        <ContactCard
          family="social"
          title="شبكات التواصل"
          description="روابط الحسابات الرسمية فقط، متضمنة البروتوكول."
          values={values}
          fieldErrors={fieldErrors}
          saving={saving}
          onChange={(key, value) =>
            setValues((current) => ({ ...current, [key]: value }))
          }
          onSave={save}
          wide
        />
      </div>
      <footer className={styles.saveBar}>
        <div>
          <strong>حفظ شامل</strong>
          <small>يراجع كل الحقول ثم يرسلها في طلب إدارة واحد.</small>
        </div>
        <Button loading={saving === "all"} onClick={() => void save("all")}>
          حفظ جميع البيانات
        </Button>
      </footer>
    </div>
  );
}

function ContactCard({
  family,
  title,
  description,
  values,
  fieldErrors,
  saving,
  onChange,
  onSave,
  wide = false,
}: {
  family: Family;
  title: string;
  description: string;
  values: Values;
  fieldErrors: Record<string, string[]>;
  saving: Family | "all" | undefined;
  onChange: (key: string, value: string) => void;
  onSave: (family: Family) => Promise<void>;
  wide?: boolean;
}) {
  return (
    <article className={`${styles.settingCard} ${wide ? styles.wideCard : ""}`}>
      <header>
        <div className={styles.cardIcon} aria-hidden="true">
          {family === "social" ? "@" : family === "phones" ? "☎" : "⌂"}
        </div>
        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
      </header>
      <div className={family === "social" ? styles.formGrid3 : styles.formGrid}>
        {fieldGroups[family].map(([key, label]) => (
          <FormField
            key={key}
            label={label}
            error={Boolean(fieldErrors[key]?.[0])}
            message={fieldErrors[key]?.[0]}
          >
            <Input
              value={values[key] ?? ""}
              type={key === "email" ? "email" : "text"}
              dir={key === "address" ? "rtl" : "ltr"}
              onChange={(event) => onChange(key, event.target.value)}
            />
          </FormField>
        ))}
      </div>
      <footer>
        <Button
          variant="secondary"
          loading={saving === family}
          disabled={saving !== undefined}
          onClick={() => void onSave(family)}
        >
          حفظ {title}
        </Button>
      </footer>
    </article>
  );
}
