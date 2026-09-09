"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Alert, Button, Card, Dialog } from "@/shared/components/ui";
import {
  answerFatwaInbox,
  archiveFatwaInbox,
  FatwaInboxClientError,
  restoreFatwaInbox,
  updateFatwaInboxAnswer,
} from "../application/fatwa-inbox.client";
import type {
  FatwaAnswerValues,
  FatwaInboxDetail,
} from "../domain/fatwa-inbox.contracts";
import type { ScientificFatwaCategory } from "../domain/scientific-fatwas.contracts";
import styles from "./scientific-fatwas.module.css";

type AnswerMode = "public_listed" | "public_link" | "private";

const activityLabels: Record<string, string> = {
  fatwa_created: "استلام السؤال",
  fatwa_viewed_by_admin: "مراجعة السؤال",
  fatwa_answered: "إضافة الرد",
  fatwa_answer_updated: "تعديل الرد",
  fatwa_visibility_changed: "تغيير نوع الظهور",
  fatwa_archived: "أرشفة السؤال",
  fatwa_restored: "استعادة السؤال",
  notification_sent: "إرسال إشعار البريد",
  notification_failed: "تعذر إرسال إشعار البريد",
};

function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("ar-EG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function initialMode(item: FatwaInboxDetail): AnswerMode {
  if (item.visibility === null) return "public_listed";
  if (item.visibility === "private") return "private";
  return item.is_listed ? "public_listed" : "public_link";
}

export function FatwaInboxDetailView({
  capabilities,
  categories,
  item,
  notice,
}: {
  capabilities: {
    answer: boolean;
    updateAnswer: boolean;
    archive: boolean;
    restore: boolean;
    privateAnswer: boolean;
  };
  categories: ScientificFatwaCategory[];
  item: FatwaInboxDetail;
  notice?: "answered" | "updated" | "archived" | "restored";
}) {
  const router = useRouter();
  const editing = item.status === "answered";
  const canRespond = editing ? capabilities.updateAnswer : capabilities.answer;
  const [answer, setAnswer] = useState(item.answer ?? "");
  const [title, setTitle] = useState(item.question_title ?? "");
  const [categoryId, setCategoryId] = useState(
    item.category_id ??
      categories.find((category) => category.name === item.category)?.id ??
      "",
  );
  const [mode, setMode] = useState<AnswerMode>(initialMode(item));
  const [notifyUser, setNotifyUser] = useState(false);
  const [pending, setPending] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [archiveDialog, setArchiveDialog] = useState(false);
  const selectableCategories = categories.filter(
    (category) => category.is_active || category.id === categoryId,
  );

  function values(): FatwaAnswerValues {
    return {
      answer,
      question_title: title,
      category_id: categoryId,
      visibility: mode === "private" ? "private" : "public",
      is_listed: mode === "public_listed",
      notify_user: notifyUser,
      expected_updated_at: item.updated_at,
    };
  }

  function validate() {
    const next: Record<string, string[]> = {};
    if (answer.trim().length < 10)
      next.answer = ["الجواب العلمي مطلوب ولا يقل عن عشرة أحرف."];
    if (mode !== "private" && title.trim().length < 3)
      next.question_title = ["عنوان المسألة مطلوب للإجابة العامة."];
    if (mode !== "private" && !categoryId)
      next.category_id = ["اختر التصنيف العلمي للإجابة العامة."];
    return next;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || item.status === "archived") return;
    const nextErrors = validate();
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      setGlobalError("راجع الحقول المطلوبة قبل إرسال الرد.");
      return;
    }
    setPending(true);
    setErrors({});
    setGlobalError(null);
    try {
      await (editing
        ? updateFatwaInboxAnswer(item.id, values())
        : answerFatwaInbox(item.id, values()));
      setNotifyUser(false);
      router.replace(
        `/dashboard/scientific-fatwas/inbox/${item.id}?notice=${
          editing ? "updated" : "answered"
        }`,
      );
      router.refresh();
    } catch (reason) {
      if (reason instanceof FatwaInboxClientError && reason.fieldErrors)
        setErrors(reason.fieldErrors);
      setGlobalError(
        reason instanceof Error ? reason.message : "تعذر حفظ الرد.",
      );
    } finally {
      setPending(false);
    }
  }

  async function changeArchiveState() {
    if (pending) return;
    setPending(true);
    setGlobalError(null);
    try {
      if (item.status === "archived") {
        await restoreFatwaInbox(item.id);
        router.replace(
          `/dashboard/scientific-fatwas/inbox/${item.id}?notice=restored`,
        );
      } else {
        await archiveFatwaInbox(item.id);
        router.replace(
          `/dashboard/scientific-fatwas/inbox/${item.id}?notice=archived`,
        );
      }
      setArchiveDialog(false);
      router.refresh();
    } catch (reason) {
      setGlobalError(
        reason instanceof Error ? reason.message : "تعذر تغيير حالة السؤال.",
      );
    } finally {
      setPending(false);
    }
  }

  const noticeText =
    notice === "answered"
      ? "تم حفظ الرد وإدراج إشعار البريد للإرسال تلقائيًا."
      : notice === "updated"
        ? "تم تحديث الرد بنجاح، وطُبّق اختيار إشعار السائل الذي حددته عند الحفظ."
        : notice === "archived"
          ? "تمت أرشفة السؤال."
          : notice === "restored"
            ? "تمت استعادة السؤال."
            : null;

  return (
    <section dir="rtl" className={styles.detailStack}>
      {noticeText && (
        <div className={styles.notice} role="status">
          {noticeText}
        </div>
      )}
      {globalError && (
        <Alert variant="error" title="تعذر تنفيذ العملية">
          {globalError}
        </Alert>
      )}

      <section className={styles.inboxDetailHero}>
        <div className={styles.heroBadges}>
          <span className={styles.badge}>{item.reference_number}</span>
          <span
            className={`${styles.badge} ${
              item.status === "new"
                ? styles.scheduledBadge
                : item.status === "archived"
                  ? styles.draftBadge
                  : styles.featuredBadge
            }`}
          >
            {item.status_label ||
              (item.status === "new"
                ? "جديد"
                : item.status === "answered"
                  ? "تم الرد"
                  : "مؤرشف")}
          </span>
          {item.category && (
            <span className={styles.badge}>{item.category}</span>
          )}
        </div>
        <h1>{item.question_title || "سؤال وارد بانتظار المراجعة"}</h1>
        <p>
          استُلم في {formatDate(item.created_at)} · آخر تحديث{" "}
          {formatDate(item.updated_at)}
        </p>
        <div className={styles.heroActions}>
          {item.public_url && item.visibility === "public" && (
            <a
              href={item.public_url}
              target="_blank"
              rel="noreferrer"
              className="ui-button ui-button--primary ui-focus"
            >
              فتح رابط الفتوى
            </a>
          )}
          {((item.status === "archived" && capabilities.restore) ||
            (item.status !== "archived" && capabilities.archive)) && (
            <Button
              variant={item.status === "archived" ? "primary" : "danger"}
              onClick={() =>
                item.status === "archived"
                  ? void changeArchiveState()
                  : setArchiveDialog(true)
              }
              loading={pending && item.status === "archived"}
            >
              {item.status === "archived" ? "استعادة السؤال" : "أرشفة السؤال"}
            </Button>
          )}
        </div>
      </section>

      <div className={styles.detailGrid}>
        <Card className={styles.detailCard ?? ""}>
          <h2>بيانات السائل</h2>
          <dl className={styles.metadataList}>
            <div>
              <dt>الاسم</dt>
              <dd>{item.name || "غير مذكور"}</dd>
            </div>
            <div>
              <dt>البريد الإلكتروني</dt>
              <dd dir="ltr">
                <a href={`mailto:${item.email}`}>{item.email}</a>
              </dd>
            </div>
            <div>
              <dt>تاريخ الاستلام</dt>
              <dd>{formatDate(item.created_at)}</dd>
            </div>
          </dl>
        </Card>
        <Card className={styles.detailCard ?? ""}>
          <h2>حالة الإجابة</h2>
          <dl className={styles.metadataList}>
            <div>
              <dt>نوع الظهور</dt>
              <dd>
                {item.visibility === "private"
                  ? "خاص بالبريد"
                  : item.visibility === "public"
                    ? item.is_listed
                      ? "عام وظاهر بالقائمة"
                      : "عام بالرابط فقط"
                    : "لم يحدد بعد"}
              </dd>
            </div>
            <div>
              <dt>تاريخ الرد</dt>
              <dd>{formatDate(item.answered_at)}</dd>
            </div>
            <div>
              <dt>إشعار البريد</dt>
              <dd>{formatDate(item.answer_notification_sent_at)}</dd>
            </div>
          </dl>
        </Card>
      </div>

      <Card className={styles.detailCard ?? ""}>
        <h2>نص السؤال</h2>
        <p className={styles.prose}>{item.question}</p>
      </Card>

      {item.status === "archived" ? (
        <Alert variant="info" title="السؤال مؤرشف">
          استعد السؤال أولًا إذا أردت إضافة الرد أو تعديله.
        </Alert>
      ) : !canRespond ? (
        <>
          <Alert variant="info" title="عرض للقراءة فقط">
            لا تملك صلاحية {editing ? "تعديل هذا الرد" : "الرد على هذا السؤال"}.
          </Alert>
          {item.answer && (
            <Card className={styles.detailCard ?? ""}>
              <h2>الجواب العلمي</h2>
              <p className={styles.prose}>{item.answer}</p>
            </Card>
          )}
        </>
      ) : (
        <form
          className={styles.answerForm}
          onSubmit={(event) => void submit(event)}
        >
          <Card className={styles.formCard ?? ""}>
            <div className={styles.sectionTitle}>
              <span>{editing ? "٠٢" : "٠١"}</span>
              <div>
                <h2>{editing ? "تعديل الرد" : "الرد على السؤال"}</h2>
                <p>
                  اختر طريقة النشر بوضوح؛ وسيصل السائل إشعار بالبريد عند الرد
                  الأول تلقائيًا.
                </p>
              </div>
            </div>

            <div
              className={styles.visibilityOptions}
              role="radiogroup"
              aria-label="طريقة نشر الإجابة"
            >
              <label
                className={
                  mode === "public_listed" ? styles.selectedOption : undefined
                }
              >
                <input
                  type="radio"
                  name="answer_mode"
                  checked={mode === "public_listed"}
                  onChange={() => setMode("public_listed")}
                />
                <span>
                  <strong>عام وظاهر في قائمة الفتاوى</strong>
                  <small>يظهر بين الفتاوى ويمكن فتحه من رابطه المباشر.</small>
                </span>
              </label>
              <label
                className={
                  mode === "public_link" ? styles.selectedOption : undefined
                }
              >
                <input
                  type="radio"
                  name="answer_mode"
                  checked={mode === "public_link"}
                  onChange={() => setMode("public_link")}
                />
                <span>
                  <strong>عام بالرابط فقط</strong>
                  <small>
                    لا يظهر في القائمة، لكن رابطه المباشر يعمل بصورة طبيعية.
                  </small>
                </span>
              </label>
              <label
                className={
                  mode === "private" ? styles.selectedOption : undefined
                }
              >
                <input
                  type="radio"
                  name="answer_mode"
                  checked={mode === "private"}
                  disabled={!capabilities.privateAnswer}
                  onChange={() => setMode("private")}
                />
                <span>
                  <strong>خاص بالبريد</strong>
                  <small>
                    {capabilities.privateAnswer
                      ? "يصل الجواب إلى السائل ولا تُنشَر له صفحة عامة."
                      : "هذا الاختيار يحتاج صلاحية عرض وإدارة الإجابات الخاصة."}
                  </small>
                </span>
              </label>
            </div>

            {mode === "private" && (
              <Alert variant="info" title="بيانات السؤال محفوظة">
                سيبقى عنوان المسألة وتصنيفها كما وردا، ويُرسل الجواب إلى السائل
                دون إنشاء صفحة عامة.
              </Alert>
            )}

            <div className={styles.formGrid}>
              {mode !== "private" && (
                <>
                  <label>
                    <span>عنوان المسألة *</span>
                    <input
                      className="ui-input"
                      maxLength={255}
                      value={title}
                      onChange={(event) => {
                        setTitle(event.target.value);
                        setErrors((current) => ({
                          ...current,
                          question_title: [],
                        }));
                      }}
                    />
                    {errors.question_title?.[0] && (
                      <em role="alert">{errors.question_title[0]}</em>
                    )}
                  </label>
                  <label>
                    <span>التصنيف العلمي *</span>
                    <select
                      className="ui-input"
                      value={categoryId}
                      onChange={(event) => {
                        setCategoryId(event.target.value);
                        setErrors((current) => ({
                          ...current,
                          category_id: [],
                        }));
                      }}
                    >
                      <option value="">اختر التصنيف العلمي</option>
                      {selectableCategories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                          {category.is_active ? "" : " — غير نشط"}
                        </option>
                      ))}
                    </select>
                    {errors.category_id?.[0] && (
                      <em role="alert">{errors.category_id[0]}</em>
                    )}
                  </label>
                </>
              )}
              <label className={styles.wide}>
                <span>الجواب العلمي *</span>
                <textarea
                  className="ui-textarea"
                  rows={14}
                  value={answer}
                  onChange={(event) => {
                    setAnswer(event.target.value);
                    setErrors((current) => ({ ...current, answer: [] }));
                  }}
                />
                {errors.answer?.[0] && <em role="alert">{errors.answer[0]}</em>}
              </label>
            </div>

            {editing ? (
              <label className={styles.notifyOption}>
                <input
                  type="checkbox"
                  checked={notifyUser}
                  onChange={(event) => setNotifyUser(event.target.checked)}
                />
                <span>
                  <strong>إرسال إشعار جديد للسائل بعد هذا التعديل</strong>
                  <small>
                    اتركه غير مفعّل عند التعديلات التحريرية البسيطة.
                  </small>
                </span>
              </label>
            ) : (
              <Alert variant="info" title="إشعار السائل تلقائي">
                بعد حفظ الرد الأول سيُرسل بريد إلى {item.email} يتضمن نتيجة الرد
                ورابط الفتوى عندما تكون عامة.
              </Alert>
            )}
          </Card>

          <div className={styles.stickyActions}>
            <Link
              href="/dashboard/scientific-fatwas/inbox"
              className="ui-button ui-button--secondary ui-focus"
            >
              العودة إلى الصندوق
            </Link>
            <Button type="submit" loading={pending} disabled={pending}>
              {editing ? "حفظ تعديل الرد" : "حفظ الرد وإشعار السائل"}
            </Button>
          </div>
        </form>
      )}

      {item.activity_logs.length > 0 && (
        <Card className={styles.detailCard ?? ""}>
          <h2>سجل الإجراءات</h2>
          <ol className={styles.activityList}>
            {item.activity_logs.map((log) => (
              <li key={log.id}>
                <strong>{activityLabels[log.action] ?? log.action}</strong>
                <span>{formatDate(log.created_at)}</span>
              </li>
            ))}
          </ol>
        </Card>
      )}

      <Dialog
        open={archiveDialog}
        onOpenChange={(open) => !pending && setArchiveDialog(open)}
        title="أرشفة السؤال"
        dismissible={!pending}
        footer={
          <div className={styles.dialogActions}>
            <Button
              variant="secondary"
              disabled={pending}
              onClick={() => setArchiveDialog(false)}
            >
              تراجع
            </Button>
            <Button
              variant="danger"
              loading={pending}
              onClick={() => void changeArchiveState()}
            >
              تأكيد الأرشفة
            </Button>
          </div>
        }
      >
        <div className={styles.dangerMessage}>
          <strong>{item.reference_number}</strong>
          <p>يمكن استعادة السؤال لاحقًا دون فقد السؤال أو الجواب أو السجل.</p>
        </div>
      </Dialog>
    </section>
  );
}
