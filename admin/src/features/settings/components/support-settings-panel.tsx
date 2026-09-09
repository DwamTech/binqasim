"use client";

import { useEffect, useState } from "react";

import { dashboardCopy } from "@/core/config/dashboard-copy";
import { Button, Skeleton } from "@/shared/components/ui/primitives";
import { Dialog } from "@/shared/components/ui/overlays";
import { ErrorState } from "@/shared/components/ui/feedback";

import {
  supportSettingKeys,
  type SupportSettingKey,
  type SupportSettings,
} from "../settings.contracts";
import {
  getSupport,
  updateSupport,
  updateSupportBulk,
} from "../settings.client";
import styles from "./settings.module.css";

const labels: Record<SupportSettingKey, [string, string]> = {
  individual_support_enabled: ["الدعم الفردي", "استقبال طلبات الأفراد"],
  institutional_support_enabled: ["الدعم المؤسسي", "استقبال طلبات الجهات"],
  module_articles_enabled: [
    dashboardCopy.modules.articles.navigation,
    "إظهار محتوى هذا القسم المنشور للعامة",
  ],
  module_audios_enabled: ["الصوتيات", "إظهار موديول الصوتيات"],
  module_listening_enabled: [
    dashboardCopy.modules.listening.navigation,
    "إظهار السلاسل والمجالس والتسجيلات الصوتية للعامة",
  ],
  module_hadith_cards_enabled: [
    dashboardCopy.modules.hadithCards.navigation,
    "إظهار مشروعات البطاقات الحديثية المصوّرة للعامة",
  ],
  module_visuals_enabled: ["المرئيات", "إظهار موديول المرئيات"],
  module_scientific_videos_enabled: [
    dashboardCopy.modules.scientificVideos.navigation,
    "إظهار المكتبة المرئية الجديدة للعامة دون التأثير على موديول المرئيات المشترك",
  ],
  module_galleries_enabled: ["المعارض", "إظهار موديول المعارض"],
  module_library_enabled: [
    dashboardCopy.modules.library.navigation,
    "إظهار المصنَّفات وملفات القراءة والتحميل للعامة",
  ],
  module_dissertations_enabled: [
    dashboardCopy.modules.dissertations.navigation,
    "إظهار الرسائل العلمية وسجل الإشراف والمشاركة للعامة",
  ],
  module_scientific_fatwas_enabled: [
    dashboardCopy.modules.scientificFatwas.navigation,
    "إظهار المسائل والأجوبة العلمية المنشورة للعامة",
  ],
  module_links_enabled: ["الروابط", "إظهار موديول الروابط"],
};

type Pending =
  | { type: "single"; key: SupportSettingKey; value: boolean }
  | { type: "bulk"; value: boolean };

export function SupportSettingsPanel() {
  const [settings, setSettings] = useState<SupportSettings>();
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [loadError, setLoadError] = useState("");
  const [pending, setPending] = useState<Pending>();
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    async function load() {
      setLoading(true);
      setLoadError("");
      try {
        const result = await getSupport(controller.signal);
        if (active) setSettings(result);
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
    if (!pending || !settings || saving) return;
    setSaving(true);
    setNotice("");
    setError("");
    try {
      if (pending.type === "single") {
        await updateSupport(pending.key, pending.value);
        setSettings({ ...settings, [pending.key]: pending.value });
      } else {
        await updateSupportBulk(pending.value);
        setSettings({
          ...settings,
          individual_support_enabled: pending.value,
          institutional_support_enabled: pending.value,
        });
      }
      setNotice("تم تطبيق الإعداد بعد تأكيد الخادم.");
      setPending(undefined);
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "تعذر تطبيق التغيير.",
      );
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
        title="تعذر تحميل إعدادات الخدمات"
        description={loadError}
        onRetry={() => setReloadKey((value) => value + 1)}
      />
    );
  if (!settings) return null;

  return (
    <div className={styles.sectionStack}>
      <div className={styles.sectionHeading}>
        <div>
          <span className={styles.adminKicker}>Admin فقط</span>
          <h2>الخدمات والموديولات العامة</h2>
          <p>لا يتغير أي مفتاح في الواجهة قبل تأكيد نجاح Laravel.</p>
        </div>
      </div>
      {notice && <p className={styles.successNotice}>{notice}</p>}
      {error && (
        <p className={styles.errorNotice} role="alert">
          {error}
        </p>
      )}
      <div className={styles.bulkBar}>
        <div>
          <strong>بوابتا الدعم</strong>
          <small>تفعيل أو إيقاف استقبال الطلبات الفردية والمؤسسية معًا.</small>
        </div>
        <div>
          <Button
            variant="secondary"
            onClick={() => setPending({ type: "bulk", value: true })}
          >
            تفعيل الكل
          </Button>
          <Button
            variant="secondary"
            onClick={() => setPending({ type: "bulk", value: false })}
          >
            إيقاف الكل
          </Button>
        </div>
      </div>
      <div className={styles.toggleGrid}>
        {supportSettingKeys.map((key) => (
          <article className={styles.toggleCard} key={key}>
            <div>
              <strong>{labels[key][0]}</strong>
              <small>{labels[key][1]}</small>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={settings[key]}
              className={settings[key] ? styles.switchOn : styles.switchOff}
              onClick={() =>
                setPending({ type: "single", key, value: !settings[key] })
              }
            >
              <span />
              {settings[key] ? "مفعّل" : "متوقف"}
            </button>
          </article>
        ))}
      </div>
      <Dialog
        open={Boolean(pending)}
        onOpenChange={(open) => {
          if (!open && !saving) setPending(undefined);
        }}
        title="تأكيد تغيير إعداد حساس"
        dismissible={!saving}
        footer={
          <div className={styles.dialogActions}>
            <Button
              variant="secondary"
              disabled={saving}
              onClick={() => setPending(undefined)}
            >
              إلغاء
            </Button>
            <Button loading={saving} onClick={() => void confirm()}>
              تأكيد التغيير
            </Button>
          </div>
        }
      >
        <p>
          سيؤثر هذا التغيير على الخدمات المتاحة لزوار الموقع. لن نحدّث الحالة
          المعروضة إلا بعد نجاح الطلب.
        </p>
      </Dialog>
    </div>
  );
}
