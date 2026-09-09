"use client";

import { useState, useCallback } from "react";
import { FaUser, FaEnvelope, FaRegCommentDots, FaPhone, FaPaperclip, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import styles from "./FeedbackForm.module.css";
import { PublicFeedbackService } from "@/services/publicFeedbackService";

// ════════════════════════════════════════════════════════════════════════════
// VALIDATION FUNCTIONS
// ════════════════════════════════════════════════════════════════════════════

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^(?:\+?966|0)?5[0-9]{8}$/;

const validateForm = (form, includePhone = false) => {
  const errors = {};

  // Name validation
  if (!form.name || form.name.trim().length < 2) {
    errors.name = "الاسم مطلوب وبحد أدنى حرفين";
  }

  // Email validation
  if (!form.email || !EMAIL_REGEX.test(form.email)) {
    errors.email = "يرجى إدخال بريد إلكتروني صحيح";
  }

  // Message validation
  if (!form.message || form.message.trim().length < 10) {
    errors.message = "الرسالة مطلوبة وبحد أدنى 10 أحرف";
  }

  // Phone validation (optional but if provided must be valid)
  if (includePhone && form.phone && !PHONE_REGEX.test(form.phone.replace(/[\s-]/g, ""))) {
    errors.phone = "رقم الجوال غير صالح";
  }

  // Attachment validation
  if (form.attachment) {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];

    if (form.attachment.size > maxSize) {
      errors.attachment = "حجم الملف يجب ألا يتجاوز 5 ميجابايت";
    }
    if (!allowedTypes.includes(form.attachment.type)) {
      errors.attachment = "نوع الملف غير مدعوم (PDF, JPG, PNG فقط)";
    }
  }

  return errors;
};

// ════════════════════════════════════════════════════════════════════════════
// TOAST COMPONENT
// ════════════════════════════════════════════════════════════════════════════

function Toast({ message, type, onClose }) {
  return (
    <div className={`${styles.toast} ${styles[`toast${type}`]}`}>
      {type === "success" ? <FaCheckCircle /> : <FaTimesCircle />}
      <span>{message}</span>
      <button onClick={onClose} className={styles.toastClose}>×</button>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// FEEDBACK FORM COMPONENT
// ════════════════════════════════════════════════════════════════════════════

export default function FeedbackForm({
  title,
  description,
  submitLabel = "إرسال",
  type = "suggestion", // "suggestion" or "complaint"
  showPhone = true,
  showAttachment = true,
}) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
    phone: "",
    attachment: null,
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [attachmentName, setAttachmentName] = useState("");

  // Handle input change
  const onChange = useCallback((field) => (e) => {
    const value = e.target.value;
    setForm((f) => ({ ...f, [field]: value }));

    // Clear error on change if touched
    if (touched[field] && errors[field]) {
      setErrors((err) => ({ ...err, [field]: undefined }));
    }
  }, [touched, errors]);

  // Handle blur
  const onBlur = useCallback((field) => () => {
    setTouched((t) => ({ ...t, [field]: true }));

    // Validate single field
    const validation = validateForm(form, showPhone);
    if (validation[field]) {
      setErrors((err) => ({ ...err, [field]: validation[field] }));
    }
  }, [form, showPhone]);

  // Handle file change
  const onFileChange = useCallback((e) => {
    const file = e.target.files?.[0] || null;
    setForm((f) => ({ ...f, attachment: file }));
    setAttachmentName(file?.name || "");
    setTouched((t) => ({ ...t, attachment: true }));

    // Validate file
    if (file) {
      const maxSize = 5 * 1024 * 1024;
      const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];

      if (file.size > maxSize) {
        setErrors((err) => ({ ...err, attachment: "حجم الملف يجب ألا يتجاوز 5 ميجابايت" }));
      } else if (!allowedTypes.includes(file.type)) {
        setErrors((err) => ({ ...err, attachment: "نوع الملف غير مدعوم" }));
      } else {
        setErrors((err) => ({ ...err, attachment: undefined }));
      }
    }
  }, []);

  // Handle submit
  const onSubmit = async (e) => {
    e.preventDefault();

    // Mark all as touched
    setTouched({ name: true, email: true, message: true, phone: true, attachment: true });

    // Validate
    const validationErrors = validateForm(form, showPhone);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setToast({ message: "يرجى تصحيح الأخطاء أولاً", type: "error" });
      setTimeout(() => setToast(null), 4000);
      return;
    }

    setSubmitting(true);

    try {
      // Prepare data
      const data = {
        name: form.name,
        email: form.email,
        message: form.message,
        phone_number: form.phone || undefined,
        attachment: form.attachment || undefined,
      };

      // Call appropriate API based on type
      const response = type === "complaint"
        ? await PublicFeedbackService.submitComplaint(data)
        : await PublicFeedbackService.submitSuggestion(data);

      // Success
      setToast({ message: response.message, type: "success" });

      // Reset form
      setForm({ name: "", email: "", message: "", phone: "", attachment: null });
      setAttachmentName("");
      setTouched({});
      setErrors({});

    } catch (error) {
      // Handle validation errors from API
      if (error.validationErrors) {
        const apiErrors = {};
        for (const [key, messages] of Object.entries(error.validationErrors)) {
          // Map API field names to form field names
          const fieldMap = { phone_number: "phone" };
          const formKey = fieldMap[key] || key;
          apiErrors[formKey] = Array.isArray(messages) ? messages[0] : messages;
        }
        setErrors(apiErrors);
        setToast({ message: "يرجى تصحيح الأخطاء المذكورة", type: "error" });
      }
      // Handle rate limit
      else if (error.rateLimited) {
        setToast({ message: error.message || "يرجى الانتظار قليلاً قبل الإرسال مرة أخرى", type: "error" });
      }
      // Other errors
      else {
        setToast({ message: error.message || "حدث خطأ أثناء الإرسال", type: "error" });
      }
    } finally {
      setSubmitting(false);
      setTimeout(() => setToast(null), 5000);
    }
  };

  return (
    <section className={styles.section} dir="rtl">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className={styles.container}>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.desc}>{description}</p>

        <form className={styles.form} onSubmit={onSubmit} noValidate>
          {/* Name Field */}
          <div className={styles.field}>
            <label className={`${styles.label} ${styles.srOnly}`} htmlFor="name">الاسم</label>
            <div className={styles.control}>
              <input
                id="name"
                name="name"
                type="text"
                className={`${styles.input} ${touched.name && errors.name ? styles.inputError : ""}`}
                value={form.name}
                onChange={onChange("name")}
                onBlur={onBlur("name")}
                placeholder=" "
                autoComplete="name"
              />
              <span className={styles.flabel}>الاسم *</span>
              <FaUser className={styles.icon} aria-hidden />
            </div>
            {touched.name && errors.name && <span className={styles.error}>{errors.name}</span>}
          </div>

          {/* Email Field */}
          <div className={styles.field}>
            <label className={`${styles.label} ${styles.srOnly}`} htmlFor="email">البريد الإلكتروني</label>
            <div className={styles.control}>
              <input
                id="email"
                name="email"
                type="email"
                className={`${styles.input} ${touched.email && errors.email ? styles.inputError : ""}`}
                value={form.email}
                onChange={onChange("email")}
                onBlur={onBlur("email")}
                placeholder=" "
                autoComplete="email"
                dir="ltr"
              />
              <span className={styles.flabel}>البريد الإلكتروني *</span>
              <FaEnvelope className={styles.icon} aria-hidden />
            </div>
            {touched.email && errors.email && <span className={styles.error}>{errors.email}</span>}
          </div>

          {/* Phone Field (Optional) */}
          {showPhone && (
            <div className={styles.field}>
              <label className={`${styles.label} ${styles.srOnly}`} htmlFor="phone">رقم الجوال</label>
              <div className={styles.control}>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className={`${styles.input} ${touched.phone && errors.phone ? styles.inputError : ""}`}
                  value={form.phone}
                  onChange={onChange("phone")}
                  onBlur={onBlur("phone")}
                  placeholder=" "
                  autoComplete="tel"
                  dir="ltr"
                />
                <span className={styles.flabel}>رقم الجوال (اختياري)</span>
                <FaPhone className={styles.icon} aria-hidden />
              </div>
              {touched.phone && errors.phone && <span className={styles.error}>{errors.phone}</span>}
            </div>
          )}

          {/* Message Field */}
          <div className={`${styles.field} ${styles.fieldFull}`}>
            <label className={`${styles.label} ${styles.srOnly}`} htmlFor="message">الرسالة</label>
            <div className={styles.control}>
              <textarea
                id="message"
                name="message"
                className={`${styles.textarea} ${touched.message && errors.message ? styles.inputError : ""}`}
                value={form.message}
                onChange={onChange("message")}
                onBlur={onBlur("message")}
                placeholder=" "
                rows={5}
              />
              <span className={styles.flabel}>
                {type === "complaint" ? "نص الشكوى *" : "نص الاقتراح *"}
              </span>
              <FaRegCommentDots className={styles.icon} aria-hidden />
            </div>
            {touched.message && errors.message && <span className={styles.error}>{errors.message}</span>}
          </div>

          {/* Attachment Field (Optional) */}
          {showAttachment && (
            <div className={`${styles.field} ${styles.fieldFull}`}>
              <label className={styles.attachLabel}>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={onFileChange}
                  className={styles.fileInput}
                />
                <span className={`${styles.attachBtn} ${attachmentName ? styles.attachBtnActive : ""}`}>
                  <FaPaperclip />
                  <span>{attachmentName || "إرفاق ملف (اختياري)"}</span>
                  {attachmentName && <span className={styles.attachCheck}>✓</span>}
                </span>
              </label>
              <span className={styles.hint}>PDF, JPG, PNG - الحد الأقصى 5MB</span>
              {touched.attachment && errors.attachment && (
                <span className={styles.error}>{errors.attachment}</span>
              )}
            </div>
          )}

          {/* Submit Button */}
          <div className={`${styles.fieldFull} ${styles.actions}`}>
            <button
              type="submit"
              className={`${styles.submit} ${submitting ? styles.submitting : ""}`}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className={styles.spinner}></span>
                  جاري الإرسال...
                </>
              ) : (
                submitLabel
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
