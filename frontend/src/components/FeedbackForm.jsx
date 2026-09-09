"use client";

import { useState, useCallback } from "react";
import { FaUser, FaEnvelope, FaRegCommentDots, FaPhone, FaPaperclip, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import styles from "./FeedbackForm.module.css";
import { PublicFeedbackService } from "@/services/publicFeedbackService";
import { useLanguage } from "../contexts/LanguageContext";

const translations = {
  ar: { name: "الاسم", email: "البريد الإلكتروني", phone: "رقم الجوال (اختياري)", message: "الرسالة", complaint: "نص الشكوى *", suggestion: "نص الاقتراح *", attachment: "إرفاق ملف (اختياري)", fileHint: "PDF, JPG, PNG - الحد الأقصى 5MB", sending: "جاري الإرسال...", send: "إرسال", nameError: "الاسم مطلوب وبحد أدنى حرفين", emailError: "يرجى إدخال بريد إلكتروني صحيح", messageError: "الرسالة مطلوبة وبحد أدنى 10 أحرف", phoneError: "رقم الجوال غير صالح", sizeError: "حجم الملف يجب ألا يتجاوز 5 ميجابايت", typeError: "نوع الملف غير مدعوم (PDF, JPG, PNG فقط)", correct: "يرجى تصحيح الأخطاء أولاً", listed: "يرجى تصحيح الأخطاء المذكورة", wait: "يرجى الانتظار قليلاً قبل الإرسال مرة أخرى", failed: "حدث خطأ أثناء الإرسال" },
  en: { name: "Name", email: "Email address", phone: "Mobile number (optional)", message: "Message", complaint: "Complaint *", suggestion: "Suggestion *", attachment: "Attach file (optional)", fileHint: "PDF, JPG, PNG — maximum 5MB", sending: "Sending...", send: "Send", nameError: "Name is required and must contain at least two characters", emailError: "Enter a valid email address", messageError: "Message is required and must contain at least 10 characters", phoneError: "Enter a valid mobile number", sizeError: "File size must not exceed 5MB", typeError: "Unsupported file type (PDF, JPG, PNG only)", correct: "Please correct the errors first", listed: "Please correct the listed errors", wait: "Please wait before submitting again", failed: "An error occurred while submitting" },
  fa: { name: "نام", email: "ایمیل", phone: "شماره همراه (اختیاری)", message: "پیام", complaint: "متن شکایت *", suggestion: "متن پیشنهاد *", attachment: "پیوست فایل (اختیاری)", fileHint: "PDF، JPG، PNG — حداکثر ۵ مگابایت", sending: "در حال ارسال...", send: "ارسال", nameError: "نام الزامی است و باید دست‌کم دو نویسه باشد", emailError: "ایمیل معتبر وارد کنید", messageError: "پیام الزامی است و باید دست‌کم ۱۰ نویسه باشد", phoneError: "شماره همراه معتبر وارد کنید", sizeError: "حجم فایل نباید بیشتر از ۵ مگابایت باشد", typeError: "نوع فایل پشتیبانی نمی‌شود؛ فقط PDF، JPG و PNG", correct: "ابتدا خطاها را اصلاح کنید", listed: "خطاهای مشخص‌شده را اصلاح کنید", wait: "لطفاً پیش از ارسال دوباره کمی صبر کنید", failed: "هنگام ارسال خطایی رخ داد" },
};

// ════════════════════════════════════════════════════════════════════════════
// VALIDATION FUNCTIONS
// ════════════════════════════════════════════════════════════════════════════

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^(?:\+?966|0)?5[0-9]{8}$/;

const validateForm = (form, includePhone = false, text = translations.ar) => {
  const errors = {};

  // Name validation
  if (!form.name || form.name.trim().length < 2) {
    errors.name = text.nameError;
  }

  // Email validation
  if (!form.email || !EMAIL_REGEX.test(form.email)) {
    errors.email = text.emailError;
  }

  // Message validation
  if (!form.message || form.message.trim().length < 10) {
    errors.message = text.messageError;
  }

  // Phone validation (optional but if provided must be valid)
  if (includePhone && form.phone && !PHONE_REGEX.test(form.phone.replace(/[\s-]/g, ""))) {
    errors.phone = text.phoneError;
  }

  // Attachment validation
  if (form.attachment) {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];

    if (form.attachment.size > maxSize) {
      errors.attachment = text.sizeError;
    }
    if (!allowedTypes.includes(form.attachment.type)) {
      errors.attachment = text.typeError;
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
  const { language } = useLanguage();
  const text = translations[language];
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
    const validation = validateForm(form, showPhone, text);
    if (validation[field]) {
      setErrors((err) => ({ ...err, [field]: validation[field] }));
    }
  }, [form, showPhone, text]);

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
        setErrors((err) => ({ ...err, attachment: text.sizeError }));
      } else if (!allowedTypes.includes(file.type)) {
        setErrors((err) => ({ ...err, attachment: text.typeError }));
      } else {
        setErrors((err) => ({ ...err, attachment: undefined }));
      }
    }
  }, [text]);

  // Handle submit
  const onSubmit = async (e) => {
    e.preventDefault();

    // Mark all as touched
    setTouched({ name: true, email: true, message: true, phone: true, attachment: true });

    // Validate
    const validationErrors = validateForm(form, showPhone, text);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setToast({ message: text.correct, type: "error" });
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
        setToast({ message: text.listed, type: "error" });
      }
      // Handle rate limit
      else if (error.rateLimited) {
        setToast({ message: error.message || text.wait, type: "error" });
      }
      // Other errors
      else {
        setToast({ message: error.message || text.failed, type: "error" });
      }
    } finally {
      setSubmitting(false);
      setTimeout(() => setToast(null), 5000);
    }
  };

  return (
    <section className={styles.section}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className={styles.container}>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.desc}>{description}</p>

        <form className={styles.form} onSubmit={onSubmit} noValidate>
          {/* Name Field */}
          <div className={styles.field}>
            <label className={`${styles.label} ${styles.srOnly}`} htmlFor="name">{text.name}</label>
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
              <span className={styles.flabel}>{text.name} *</span>
              <FaUser className={styles.icon} aria-hidden />
            </div>
            {touched.name && errors.name && <span className={styles.error}>{errors.name}</span>}
          </div>

          {/* Email Field */}
          <div className={styles.field}>
            <label className={`${styles.label} ${styles.srOnly}`} htmlFor="email">{text.email}</label>
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
              <span className={styles.flabel}>{text.email} *</span>
              <FaEnvelope className={styles.icon} aria-hidden />
            </div>
            {touched.email && errors.email && <span className={styles.error}>{errors.email}</span>}
          </div>

          {/* Phone Field (Optional) */}
          {showPhone && (
            <div className={styles.field}>
              <label className={`${styles.label} ${styles.srOnly}`} htmlFor="phone">{text.phone}</label>
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
                <span className={styles.flabel}>{text.phone}</span>
                <FaPhone className={styles.icon} aria-hidden />
              </div>
              {touched.phone && errors.phone && <span className={styles.error}>{errors.phone}</span>}
            </div>
          )}

          {/* Message Field */}
          <div className={`${styles.field} ${styles.fieldFull}`}>
            <label className={`${styles.label} ${styles.srOnly}`} htmlFor="message">{text.message}</label>
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
                {type === "complaint" ? text.complaint : text.suggestion}
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
                  <span>{attachmentName || text.attachment}</span>
                  {attachmentName && <span className={styles.attachCheck}>✓</span>}
                </span>
              </label>
              <span className={styles.hint}>{text.fileHint}</span>
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
                  {text.sending}
                </>
              ) : (
                submitLabel || text.send
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
