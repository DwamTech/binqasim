"use client";

import { useEffect, useState } from "react";

import { Button, Skeleton } from "@/shared/components/ui/primitives";
import { Dialog } from "@/shared/components/ui/overlays";
import { ErrorState } from "@/shared/components/ui/feedback";

import type { SiteStatus } from "../settings.contracts";
import { getSiteStatus, updateSiteStatus } from "../settings.client";
import styles from "./settings.module.css";

export function SiteStatusSettings() {
  const [status, setStatus] = useState<SiteStatus>();
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [loadError, setLoadError] = useState("");
  const [target, setTarget] = useState<SiteStatus>();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    async function load() {
      setLoading(true);
      setLoadError("");
      try {
        const result = await getSiteStatus(controller.signal);
        if (active) setStatus(result.status);
      } catch (reason) {
        if (active)
          setLoadError(
            reason instanceof Error ? reason.message : "تعذر التحميل.",
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

  const confirm = async () => {
    if (!target || saving) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const result = await updateSiteStatus(target);
      setStatus(result.status);
      setTarget(undefined);
      setNotice("تم تحديث حالة الموقع بنجاح.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "تعذر تحديث الحالة.");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <Skeleton
        className={styles.largeSkeleton ?? ""}
        aria-label="جار التحميل"
      />
    );
  if (loadError)
    return (
      <ErrorState
        title="تعذر تحميل حالة الموقع"
        description={loadError}
        onRetry={() => setReloadKey((value) => value + 1)}
      />
    );
  if (!status) return null;

  const open = status === "open";
  return (
    <div className={styles.sectionStack}>
      <div className={styles.sectionHeading}>
        <div>
          <span className={styles.adminKicker}>قرار تشغيلي حساس</span>
          <h2>حالة الموقع العامة</h2>
          <p>الإيقاف يؤثر فورًا على تجربة الزائر، لذلك يتطلب تأكيدًا صريحًا.</p>
        </div>
      </div>
      {notice && <p className={styles.successNotice}>{notice}</p>}
      {error && (
        <p className={styles.errorNotice} role="alert">
          {error}
        </p>
      )}
      <article
        className={`${styles.statusCard} ${open ? styles.open : styles.closed}`}
      >
        <div className={styles.statusOrb} aria-hidden="true">
          <span />
        </div>
        <div>
          <span className={styles.kicker}>الحالة الحالية</span>
          <h3>{open ? "الموقع مفتوح ويعمل" : "الموقع متوقف للزوار"}</h3>
          <p>
            {open
              ? "الخدمات العامة متاحة وفق إعدادات الموديولات."
              : "أعد فتح الموقع بعد انتهاء سبب الإيقاف."}
          </p>
        </div>
        <Button
          variant={open ? "danger" : "primary"}
          onClick={() => setTarget(open ? "closed" : "open")}
        >
          {open ? "إيقاف الموقع" : "فتح الموقع"}
        </Button>
      </article>
      <Dialog
        open={Boolean(target)}
        onOpenChange={(value) => {
          if (!value && !saving) setTarget(undefined);
        }}
        title={target === "closed" ? "تأكيد إيقاف الموقع" : "تأكيد فتح الموقع"}
        dismissible={!saving}
        footer={
          <div className={styles.dialogActions}>
            <Button
              variant="secondary"
              disabled={saving}
              onClick={() => setTarget(undefined)}
            >
              إلغاء
            </Button>
            <Button
              variant={target === "closed" ? "danger" : "primary"}
              loading={saving}
              onClick={() => void confirm()}
            >
              نعم، نفّذ التغيير
            </Button>
          </div>
        }
      >
        <p>
          {target === "closed"
            ? "لن يتم إغلاق النافذة أو تغيير الحالة المعروضة إلا بعد تأكيد الخادم."
            : "سيعود الموقع إلى الحالة المفتوحة فور نجاح العملية."}
        </p>
      </Dialog>
    </div>
  );
}
