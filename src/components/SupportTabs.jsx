"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import styles from "./SupportTabs.module.css";
import CustomSelect from "./CustomSelect";
import {
  individualFormSchema,
  organizationFormSchema,
  validateField,
  validateForm,
  validateGoals,
} from "@/utils/formValidation";
import {
  SupportService,
  mapIndividualErrors,
  mapOrganizationErrors,
} from "@/services/supportService";

// ════════════════════════════════════════════════════════════════════════════
// TOAST NOTIFICATION COMPONENT
// ════════════════════════════════════════════════════════════════════════════
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`${styles.toast} ${styles[`toast${type}`]}`}>
      <span className={styles.toastIcon}>
        {type === "success" ? "✓" : type === "error" ? "✕" : "ℹ"}
      </span>
      <span className={styles.toastMessage}>{message}</span>
      <button className={styles.toastClose} onClick={onClose}>×</button>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SUCCESS MODAL COMPONENT
// ════════════════════════════════════════════════════════════════════════════
function SuccessModal({ isOpen, onClose, requestNumber, phoneNumber, message }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(requestNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = requestNumber;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.successModal} onClick={(e) => e.stopPropagation()}>
        {/* Success Animation */}
        <div className={styles.successIconWrapper}>
          <div className={styles.successIconCircle}>
            <svg className={styles.successCheckmark} viewBox="0 0 52 52">
              <circle className={styles.successCircle} cx="26" cy="26" r="25" fill="none" />
              <path className={styles.successCheck} fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h2 className={styles.successTitle}>
          🎉 تم إرسال طلبك بنجاح!
        </h2>

        {/* Message */}
        <p className={styles.successMessage}>
          {message || "تم استلام طلبك بنجاح وسيتم مراجعته قريباً"}
        </p>

        {/* Request Number Card */}
        <div className={styles.requestCard}>
          <span className={styles.requestLabel}>رقم الطلب</span>
          <div className={styles.requestNumberWrapper}>
            <span className={styles.requestNumber}>{requestNumber}</span>
            <button
              className={`${styles.copyBtn} ${copied ? styles.copyBtnCopied : ""}`}
              onClick={copyToClipboard}
              title="نسخ رقم الطلب"
            >
              {copied ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  تم النسخ
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  نسخ
                </>
              )}
            </button>
          </div>
        </div>

        {/* Phone Number Info */}
        {phoneNumber && (
          <p className={styles.phoneInfo}>
            📱 يمكنك الاستعلام عن حالة طلبك باستخدام رقم الطلب ورقم الجوال: <strong dir="ltr">{phoneNumber}</strong>
          </p>
        )}

        {/* Important Note */}
        <div className={styles.importantNote}>
          <span className={styles.noteIcon}>💡</span>
          <span>احتفظ برقم الطلب للمتابعة والاستعلام عن حالة طلبك</span>
        </div>

        {/* Close Button */}
        <button className={styles.closeModalBtn} onClick={onClose}>
          إغلاق
        </button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// FORM FIELD WRAPPER COMPONENT
// ════════════════════════════════════════════════════════════════════════════
function FormField({ label, required, error, touched, children, className = "" }) {
  const hasError = touched && error;

  return (
    <div className={`${styles.field} ${className} ${hasError ? styles.fieldError : ""}`}>
      <label className={styles.label}>
        {label}
        {required && <span className={styles.required}> *</span>}
      </label>
      {children}
      {hasError && (
        <span className={styles.error} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// FILE INPUT COMPONENT
// ════════════════════════════════════════════════════════════════════════════
function FileInput({ accept, onChange, value, error }) {
  const [fileName, setFileName] = useState("");

  const handleChange = (e) => {
    const file = e.target.files?.[0] || null;
    setFileName(file?.name || "");
    onChange(file);
  };

  return (
    <div className={styles.fileWrapper}>
      <input
        type="file"
        accept={accept}
        onChange={handleChange}
        className={styles.fileHidden}
        id={`file-${Math.random().toString(36).substr(2, 9)}`}
      />
      <label
        htmlFor={`file-${Math.random().toString(36).substr(2, 9)}`}
        className={`${styles.fileLabel} ${error ? styles.fileLabelError : ""} ${fileName ? styles.fileLabelSelected : ""}`}
      >
        <span className={styles.fileIcon}>📎</span>
        <span className={styles.fileText}>
          {fileName || "اختر ملف..."}
        </span>
        {fileName && <span className={styles.fileCheck}>✓</span>}
      </label>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// INDIVIDUAL FORM COMPONENT
// ════════════════════════════════════════════════════════════════════════════
function IndividualForm() {
  const formRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [successModal, setSuccessModal] = useState(null);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [form, setForm] = useState({
    name: "",
    gender: "",
    nationality: "",
    city: "",
    housing: "",
    housingOther: "",
    birthDate: "",
    expiryDate: "",
    phone: "",
    whatsapp: "",
    email: "",
    activity: "",
    activityOther: "",
    workplace: "",
    supportType: "",
    totalAmount: "",
    supportKind: "",
    supportKindOther: "",
    income: "",
    incomeOther: "",
    married: "",
    familyCount: "",
    iban: "",
    bank: "",
  });

  // Conditional field visibility
  const isHousingOther = form.housing === "other";
  const isActivityOther = form.activity === "other";
  const isIncomeYes = form.income === "yes";
  const isMarriedYes = form.married === "yes";
  const isSupportKindOther = form.supportKind === "other";

  // Handle input change
  const onInput = useCallback((key) => (ev) => {
    const value = ev.target.value;
    setForm((f) => ({ ...f, [key]: value }));

    // Real-time validation on touched fields
    if (touched[key]) {
      const validation = validateField(key, value, { ...form, [key]: value }, individualFormSchema);
      setErrors((e) => ({
        ...e,
        [key]: validation.isValid ? undefined : validation.message,
      }));
    }
  }, [form, touched]);

  // Handle select change
  const onSelect = useCallback((key) => (value) => {
    setForm((f) => {
      const newForm = { ...f, [key]: value };

      // Clear "other" field when switching away from "other"
      if (key === "housing" && value !== "other") newForm.housingOther = "";
      if (key === "activity" && value !== "other") newForm.activityOther = "";
      if (key === "supportKind" && value !== "other") newForm.supportKindOther = "";
      if (key === "income" && value !== "yes") newForm.incomeOther = "";
      if (key === "married" && value !== "yes") newForm.familyCount = "";

      return newForm;
    });
    setTouched((t) => ({ ...t, [key]: true }));

    // Validate
    const validation = validateField(key, value, { ...form, [key]: value }, individualFormSchema);
    setErrors((e) => ({
      ...e,
      [key]: validation.isValid ? undefined : validation.message,
    }));
  }, [form]);

  // Handle file change
  const onFile = useCallback((key) => (file) => {
    setForm((f) => ({ ...f, [key]: file }));
    setTouched((t) => ({ ...t, [key]: true }));

    const validation = validateField(key, file, { ...form, [key]: file }, individualFormSchema);
    setErrors((e) => ({
      ...e,
      [key]: validation.isValid ? undefined : validation.message,
    }));
  }, [form]);

  // Handle blur (mark as touched)
  const onBlur = useCallback((key) => () => {
    setTouched((t) => ({ ...t, [key]: true }));

    const validation = validateField(key, form[key], form, individualFormSchema);
    setErrors((e) => ({
      ...e,
      [key]: validation.isValid ? undefined : validation.message,
    }));
  }, [form]);

  // Scroll to first error
  const scrollToFirstError = useCallback((errors) => {
    const firstErrorKey = Object.keys(errors)[0];
    if (firstErrorKey && formRef.current) {
      const errorElement = formRef.current.querySelector(`[name="${firstErrorKey}"], [data-field="${firstErrorKey}"]`);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
        errorElement.focus?.();
      }
    }
  }, []);

  // Handle form submit
  const onSubmit = async (ev) => {
    ev.preventDefault();

    // Mark all fields as touched
    const allTouched = Object.keys(form).reduce((acc, key) => ({ ...acc, [key]: true }), {});
    setTouched(allTouched);

    // Validate entire form
    const { isValid, errors: validationErrors } = validateForm(form, individualFormSchema);
    setErrors(validationErrors);

    if (!isValid) {
      scrollToFirstError(validationErrors);
      setToast({ message: "يرجى تصحيح الأخطاء أولاً", type: "error" });
      return;
    }

    setIsSubmitting(true);

    try {
      // Submit to API
      const response = await SupportService.submitIndividual(form);

      // Show success modal
      setSuccessModal({
        requestNumber: response.request_number,
        phoneNumber: response.phone_number,
        message: response.message,
      });

      // Reset form
      setForm({
        name: "",
        gender: "",
        nationality: "",
        city: "",
        housing: "",
        housingOther: "",
        birthDate: "",
        expiryDate: "",
        phone: "",
        whatsapp: "",
        email: "",
        activity: "",
        activityOther: "",
        workplace: "",
        supportType: "",
        totalAmount: "",
        supportKind: "",
        supportKindOther: "",
        income: "",
        incomeOther: "",
        married: "",
        familyCount: "",
        iban: "",
        bank: "",
      });
      setTouched({});
      setErrors({});

    } catch (error) {
      // Handle validation errors from API
      if (error.validationErrors) {
        const mappedErrors = mapIndividualErrors(error.validationErrors);
        setErrors(mappedErrors);
        scrollToFirstError(mappedErrors);
        setToast({ message: "يرجى تصحيح الأخطاء المذكورة", type: "error" });
      }
      // Handle service disabled
      else if (error.serviceDisabled) {
        setToast({ message: error.message || "التقديم مغلق حالياً", type: "error" });
      }
      // Handle other errors
      else {
        setToast({ message: error.message || "حدث خطأ أثناء الإرسال", type: "error" });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {successModal && (
        <SuccessModal
          isOpen={true}
          onClose={() => setSuccessModal(null)}
          requestNumber={successModal.requestNumber}
          phoneNumber={successModal.phoneNumber}
          message={successModal.message}
        />
      )}

      <form
        ref={formRef}
        className={styles.form}
        onSubmit={onSubmit}
        dir="rtl"
        noValidate
        id="individual-panel"
        role="tabpanel"
        aria-labelledby="individual-tab"
      >
        {/* ═══════════════════════════════════════════════════════════════
            PERSONAL INFORMATION SECTION
        ═══════════════════════════════════════════════════════════════ */}
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>البيانات الشخصية</h3>
        </div>

        <FormField label="الاسم" required error={errors.name} touched={touched.name}>
          <input
            name="name"
            className={styles.input}
            value={form.name}
            onChange={onInput("name")}
            onBlur={onBlur("name")}
            placeholder="الاسم الكامل"
          />
        </FormField>

        <FormField label="الجنس" required error={errors.gender} touched={touched.gender}>
          <CustomSelect
            value={form.gender}
            onChange={onSelect("gender")}
            options={[
              { value: "", label: "اختر" },
              { value: "male", label: "ذكر" },
              { value: "female", label: "أنثى" },
            ]}
            placeholder="اختر"
          />
        </FormField>

        <FormField label="الجنسية" required error={errors.nationality} touched={touched.nationality}>
          <input
            name="nationality"
            className={styles.input}
            value={form.nationality}
            onChange={onInput("nationality")}
            onBlur={onBlur("nationality")}
            placeholder="مثال: سعودي"
          />
        </FormField>

        <FormField label="المدينة" required error={errors.city} touched={touched.city}>
          <input
            name="city"
            className={styles.input}
            value={form.city}
            onChange={onInput("city")}
            onBlur={onBlur("city")}
            placeholder="مثال: الرياض"
          />
        </FormField>

        <FormField label="نوع السكن" required error={errors.housing} touched={touched.housing}>
          <CustomSelect
            value={form.housing}
            onChange={onSelect("housing")}
            options={[
              { value: "", label: "اختر" },
              { value: "own", label: "ملك" },
              { value: "rent", label: "ايجار" },
              { value: "waqf", label: "وقف" },
              { value: "other", label: "غير ذلك اذكره" },
            ]}
            placeholder="اختر"
          />
        </FormField>

        {isHousingOther && (
          <FormField
            label="اذكر نوع السكن"
            required
            error={errors.housingOther}
            touched={touched.housingOther}
            className={styles.conditionalField}
          >
            <input
              name="housingOther"
              className={styles.input}
              value={form.housingOther}
              onChange={onInput("housingOther")}
              onBlur={onBlur("housingOther")}
              placeholder="اكتب نوع السكن"
            />
          </FormField>
        )}

        <FormField label="صورة الهوية" required error={errors.idImage} touched={touched.idImage}>
          <input
            data-field="idImage"
            type="file"
            accept="image/*"
            className={styles.file}
            onChange={(e) => onFile("idImage")(e.target.files?.[0] || null)}
          />
          <span className={styles.hint}>صورة فقط (JPG, PNG) - الحد الأقصى 5MB</span>
        </FormField>

        <FormField label="تاريخ الميلاد" required error={errors.birthDate} touched={touched.birthDate}>
          <input
            name="birthDate"
            type="date"
            className={styles.input}
            value={form.birthDate}
            onChange={onInput("birthDate")}
            onBlur={onBlur("birthDate")}
          />
        </FormField>

        <FormField label="تاريخ انتهاء الهوية" required error={errors.expiryDate} touched={touched.expiryDate}>
          <input
            name="expiryDate"
            type="date"
            className={styles.input}
            value={form.expiryDate}
            onChange={onInput("expiryDate")}
            onBlur={onBlur("expiryDate")}
          />
        </FormField>

        {/* ═══════════════════════════════════════════════════════════════
            CONTACT INFORMATION SECTION
        ═══════════════════════════════════════════════════════════════ */}
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>بيانات التواصل</h3>
        </div>

        <FormField label="رقم الاتصال" required error={errors.phone} touched={touched.phone}>
          <input
            name="phone"
            type="tel"
            className={styles.input}
            value={form.phone}
            onChange={onInput("phone")}
            onBlur={onBlur("phone")}
            placeholder="05xxxxxxxx"
            dir="ltr"
          />
        </FormField>

        <FormField label="رقم الواتساب" error={errors.whatsapp} touched={touched.whatsapp}>
          <input
            name="whatsapp"
            type="tel"
            className={styles.input}
            value={form.whatsapp}
            onChange={onInput("whatsapp")}
            onBlur={onBlur("whatsapp")}
            placeholder="966xxxxxxxxx"
            dir="ltr"
          />
          <span className={styles.hint}>اختياري - يبدأ برمز الدولة</span>
        </FormField>

        <FormField label="البريد الالكتروني" required error={errors.email} touched={touched.email}>
          <input
            name="email"
            type="email"
            className={styles.input}
            value={form.email}
            onChange={onInput("email")}
            onBlur={onBlur("email")}
            placeholder="example@mail.com"
            dir="ltr"
          />
        </FormField>

        {/* ═══════════════════════════════════════════════════════════════
            ACADEMIC INFORMATION SECTION
        ═══════════════════════════════════════════════════════════════ */}
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>البيانات العلمية</h3>
        </div>

        <FormField label="المؤهل الدراسي" required error={errors.educationImage} touched={touched.educationImage}>
          <input
            data-field="educationImage"
            type="file"
            accept="image/*,application/pdf"
            className={styles.file}
            onChange={(e) => onFile("educationImage")(e.target.files?.[0] || null)}
          />
          <span className={styles.hint}>صورة أو PDF - الحد الأقصى 5MB</span>
        </FormField>

        <FormField label="النشاط العلمي" required error={errors.activity} touched={touched.activity}>
          <CustomSelect
            value={form.activity}
            onChange={onSelect("activity")}
            options={[
              { value: "", label: "اختر" },
              { value: "aqeeda", label: "عقدي" },
              { value: "sunna", label: "سنة وحديث" },
              { value: "fiqh", label: "فقهي" },
              { value: "fikri", label: "فكري" },
              { value: "other", label: "غير ذلك اذكره" },
            ]}
            placeholder="اختر"
          />
        </FormField>

        {isActivityOther && (
          <FormField
            label="اذكر النشاط"
            required
            error={errors.activityOther}
            touched={touched.activityOther}
            className={styles.conditionalField}
          >
            <input
              name="activityOther"
              className={styles.input}
              value={form.activityOther}
              onChange={onInput("activityOther")}
              onBlur={onBlur("activityOther")}
              placeholder="اكتب النشاط العلمي"
            />
          </FormField>
        )}

        <FormField label="السيرة الذاتية" required error={errors.cvFile} touched={touched.cvFile}>
          <input
            data-field="cvFile"
            type="file"
            accept="application/pdf"
            className={styles.file}
            onChange={(e) => onFile("cvFile")(e.target.files?.[0] || null)}
          />
          <span className={styles.hint}>PDF فقط - الحد الأقصى 5MB</span>
        </FormField>

        <FormField label="مكان العمل" required error={errors.workplace} touched={touched.workplace}>
          <input
            name="workplace"
            className={styles.input}
            value={form.workplace}
            onChange={onInput("workplace")}
            onBlur={onBlur("workplace")}
            placeholder="اسم جهة العمل"
          />
        </FormField>

        {/* ═══════════════════════════════════════════════════════════════
            SUPPORT DETAILS SECTION
        ═══════════════════════════════════════════════════════════════ */}
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>بيانات الدعم المطلوب</h3>
        </div>

        <FormField label="الدعم المطلوب" required error={errors.supportType} touched={touched.supportType}>
          <CustomSelect
            value={form.supportType}
            onChange={onSelect("supportType")}
            options={[
              { value: "", label: "اختر" },
              { value: "full", label: "كلي" },
              { value: "partial", label: "جزئي" },
            ]}
            placeholder="اختر"
          />
        </FormField>

        <FormField label="إجمالي المبلغ المطلوب (ريال)" required error={errors.totalAmount} touched={touched.totalAmount}>
          <input
            name="totalAmount"
            type="number"
            min="1"
            className={styles.input}
            value={form.totalAmount}
            onChange={onInput("totalAmount")}
            onBlur={onBlur("totalAmount")}
            placeholder="0"
          />
        </FormField>

        <FormField label="نوع الدعم" required error={errors.supportKind} touched={touched.supportKind}>
          <CustomSelect
            value={form.supportKind}
            onChange={onSelect("supportKind")}
            options={[
              { value: "", label: "اختر" },
              { value: "bar", label: "على أوجه البر العامة" },
              { value: "poor", label: "الفقراء" },
              { value: "orphans", label: "الأيتام" },
              { value: "dawah", label: "الدعوة" },
              { value: "quran", label: "القرآن وتعليمه" },
              { value: "udhiyah", label: "الأضاحي" },
              { value: "education", label: "التعليم" },
              { value: "mosques", label: "المساجد" },
              { value: "other", label: "غير ذلك اذكره" },
            ]}
            placeholder="اختر"
          />
        </FormField>

        {isSupportKindOther && (
          <FormField
            label="اذكر نوع الدعم"
            required
            error={errors.supportKindOther}
            touched={touched.supportKindOther}
            className={styles.conditionalField}
          >
            <input
              name="supportKindOther"
              className={styles.input}
              value={form.supportKindOther}
              onChange={onInput("supportKindOther")}
              onBlur={onBlur("supportKindOther")}
              placeholder="اكتب نوع الدعم"
            />
          </FormField>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            FINANCIAL INFORMATION SECTION
        ═══════════════════════════════════════════════════════════════ */}
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>البيانات المالية والاجتماعية</h3>
        </div>

        <FormField label="هل يوجد دخل" required error={errors.income} touched={touched.income}>
          <CustomSelect
            value={form.income}
            onChange={onSelect("income")}
            options={[
              { value: "", label: "اختر" },
              { value: "no", label: "لا" },
              { value: "yes", label: "نعم اذكره" },
            ]}
            placeholder="اختر"
          />
        </FormField>

        {isIncomeYes && (
          <FormField
            label="اذكر نوع الدخل"
            required
            error={errors.incomeOther}
            touched={touched.incomeOther}
            className={styles.conditionalField}
          >
            <input
              name="incomeOther"
              className={styles.input}
              value={form.incomeOther}
              onChange={onInput("incomeOther")}
              onBlur={onBlur("incomeOther")}
              placeholder="مثال: راتب شهري"
            />
          </FormField>
        )}

        <FormField label="الحالة الاجتماعية" required error={errors.married} touched={touched.married}>
          <CustomSelect
            value={form.married}
            onChange={onSelect("married")}
            options={[
              { value: "", label: "اختر" },
              { value: "no", label: "أعزب" },
              { value: "yes", label: "متزوج" },
            ]}
            placeholder="اختر"
          />
        </FormField>

        {isMarriedYes && (
          <FormField
            label="عدد أفراد الأسرة"
            required
            error={errors.familyCount}
            touched={touched.familyCount}
            className={styles.conditionalField}
          >
            <input
              name="familyCount"
              type="number"
              min="1"
              className={styles.input}
              value={form.familyCount}
              onChange={onInput("familyCount")}
              onBlur={onBlur("familyCount")}
              placeholder="عدد الأفراد"
            />
          </FormField>
        )}

        <FormField label="توصيات وتزكيات" error={errors.recommendationsFile} touched={touched.recommendationsFile}>
          <input
            data-field="recommendationsFile"
            type="file"
            accept="application/pdf"
            className={styles.file}
            onChange={(e) => onFile("recommendationsFile")(e.target.files?.[0] || null)}
          />
          <span className={styles.hint}>اختياري - PDF فقط</span>
        </FormField>

        {/* ═══════════════════════════════════════════════════════════════
            BANK INFORMATION SECTION
        ═══════════════════════════════════════════════════════════════ */}
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>البيانات البنكية</h3>
        </div>

        <FormField label="رقم الحساب البنكي (IBAN)" required error={errors.iban} touched={touched.iban}>
          <input
            name="iban"
            className={styles.input}
            value={form.iban}
            onChange={onInput("iban")}
            onBlur={onBlur("iban")}
            placeholder="SA0000000000000000000000"
            dir="ltr"
          />
          <span className={styles.hint}>يبدأ بـ SA متبوعاً بـ 22 رقم/حرف</span>
        </FormField>

        <FormField label="اسم البنك" required error={errors.bank} touched={touched.bank}>
          <input
            name="bank"
            className={styles.input}
            value={form.bank}
            onChange={onInput("bank")}
            onBlur={onBlur("bank")}
            placeholder="مثال: البنك الأهلي"
          />
        </FormField>

        {/* ═══════════════════════════════════════════════════════════════
            SUBMIT BUTTON
        ═══════════════════════════════════════════════════════════════ */}
        <div className={`${styles.actions} ${styles.full}`}>
          <button
            className={`${styles.submit} ${isSubmitting ? styles.submitting : ""}`}
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className={styles.spinner}></span>
                جاري الإرسال...
              </>
            ) : (
              "إرسال الطلب"
            )}
          </button>
        </div>
      </form>
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ORGANIZATION FORM COMPONENT
// ════════════════════════════════════════════════════════════════════════════
function OrganizationForm() {
  const formRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [successModal, setSuccessModal] = useState(null);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [goals, setGoals] = useState([""]);
  const [form, setForm] = useState({
    orgName: "",
    licenseNo: "",
    licenseCert: null,
    email: "",
    supportLetter: null,
    phone: "",
    ceoName: "",
    ceoPhone: "",
    whatsapp: "",
    city: "",
    activity: "",
    activityOther: "",
    projectName: "",
    projectKind: "",
    projectKindOther: "",
    projectFile: null,
    projectManager: "",
    projectManagerPhone: "",
    beneficiaries: "",
    beneficiariesOther: "",
    totalCost: "",
    outputs: "",
    opPlanFile: null,
    supportType: "",
    totalAmount: "",
    accountName: "",
    iban: "",
    bank: "",
    bankCert: null,
  });

  // Conditional field visibility
  const isActivityOther = form.activity === "other";
  const isProjectKindOther = form.projectKind === "other";
  const isBeneficiariesOther = form.beneficiaries === "other";

  // Handle input change
  const onInput = useCallback((key) => (ev) => {
    const value = ev.target.value;
    setForm((f) => ({ ...f, [key]: value }));

    if (touched[key]) {
      const validation = validateField(key, value, { ...form, [key]: value }, organizationFormSchema);
      setErrors((e) => ({
        ...e,
        [key]: validation.isValid ? undefined : validation.message,
      }));
    }
  }, [form, touched]);

  // Handle select change
  const onSelect = useCallback((key) => (value) => {
    setForm((f) => {
      const newForm = { ...f, [key]: value };

      if (key === "activity" && value !== "other") newForm.activityOther = "";
      if (key === "projectKind" && value !== "other") newForm.projectKindOther = "";
      if (key === "beneficiaries" && value !== "other") newForm.beneficiariesOther = "";

      return newForm;
    });
    setTouched((t) => ({ ...t, [key]: true }));

    const validation = validateField(key, value, { ...form, [key]: value }, organizationFormSchema);
    setErrors((e) => ({
      ...e,
      [key]: validation.isValid ? undefined : validation.message,
    }));
  }, [form]);

  // Handle file change
  const onFile = useCallback((key) => (file) => {
    setForm((f) => ({ ...f, [key]: file }));
    setTouched((t) => ({ ...t, [key]: true }));

    const validation = validateField(key, file, { ...form, [key]: file }, organizationFormSchema);
    setErrors((e) => ({
      ...e,
      [key]: validation.isValid ? undefined : validation.message,
    }));
  }, [form]);

  // Handle blur
  const onBlur = useCallback((key) => () => {
    setTouched((t) => ({ ...t, [key]: true }));

    const validation = validateField(key, form[key], form, organizationFormSchema);
    setErrors((e) => ({
      ...e,
      [key]: validation.isValid ? undefined : validation.message,
    }));
  }, [form]);

  // Goals management
  const addGoal = () => setGoals((g) => (g.length < 6 ? [...g, ""] : g));
  const updateGoal = (i, v) => {
    setGoals((g) => g.map((x, idx) => (idx === i ? v : x)));
    setTouched((t) => ({ ...t, goals: true }));
  };

  // Scroll to first error
  const scrollToFirstError = useCallback((errors) => {
    const firstErrorKey = Object.keys(errors)[0];
    if (firstErrorKey && formRef.current) {
      const errorElement = formRef.current.querySelector(`[name="${firstErrorKey}"], [data-field="${firstErrorKey}"]`);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
        errorElement.focus?.();
      }
    }
  }, []);

  // Handle form submit
  const onSubmit = async (ev) => {
    ev.preventDefault();

    const allTouched = Object.keys(form).reduce((acc, key) => ({ ...acc, [key]: true }), {});
    allTouched.goals = true;
    setTouched(allTouched);

    // Validate form
    const { isValid, errors: validationErrors } = validateForm(form, organizationFormSchema);

    // Validate goals separately
    const goalsValidation = validateGoals(goals);
    if (!goalsValidation.isValid) {
      validationErrors.goals = goalsValidation.message;
    }

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      scrollToFirstError(validationErrors);
      setToast({ message: "يرجى تصحيح الأخطاء أولاً", type: "error" });
      return;
    }

    setIsSubmitting(true);

    try {
      // Submit to API
      const response = await SupportService.submitInstitutional(form, goals);

      // Show success modal
      setSuccessModal({
        requestNumber: response.request_number,
        phoneNumber: response.phone_number,
        message: response.message,
      });

      // Reset form
      setForm({
        orgName: "",
        licenseNo: "",
        licenseCert: null,
        email: "",
        supportLetter: null,
        phone: "",
        ceoName: "",
        ceoPhone: "",
        whatsapp: "",
        city: "",
        activity: "",
        activityOther: "",
        projectName: "",
        projectKind: "",
        projectKindOther: "",
        projectFile: null,
        projectManager: "",
        projectManagerPhone: "",
        beneficiaries: "",
        beneficiariesOther: "",
        totalCost: "",
        outputs: "",
        opPlanFile: null,
        supportType: "",
        totalAmount: "",
        accountName: "",
        iban: "",
        bank: "",
        bankCert: null,
      });
      setGoals([""]);
      setTouched({});
      setErrors({});

    } catch (error) {
      // Handle validation errors from API
      if (error.validationErrors) {
        const mappedErrors = mapOrganizationErrors(error.validationErrors);
        setErrors(mappedErrors);
        scrollToFirstError(mappedErrors);
        setToast({ message: "يرجى تصحيح الأخطاء المذكورة", type: "error" });
      }
      // Handle service disabled
      else if (error.serviceDisabled) {
        setToast({ message: error.message || "التقديم مغلق حالياً", type: "error" });
      }
      // Handle other errors
      else {
        setToast({ message: error.message || "حدث خطأ أثناء الإرسال", type: "error" });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {successModal && (
        <SuccessModal
          isOpen={true}
          onClose={() => setSuccessModal(null)}
          requestNumber={successModal.requestNumber}
          phoneNumber={successModal.phoneNumber}
          message={successModal.message}
        />
      )}

      <form
        ref={formRef}
        className={styles.form}
        onSubmit={onSubmit}
        dir="rtl"
        noValidate
        id="organization-panel"
        role="tabpanel"
        aria-labelledby="organization-tab"
      >
        {/* ═══════════════════════════════════════════════════════════════
            ORGANIZATION INFORMATION SECTION
        ═══════════════════════════════════════════════════════════════ */}
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>بيانات المؤسسة</h3>
        </div>

        <FormField label="اسم المؤسسة أو الجمعية" required error={errors.orgName} touched={touched.orgName}>
          <input
            name="orgName"
            className={styles.input}
            value={form.orgName}
            onChange={onInput("orgName")}
            onBlur={onBlur("orgName")}
            placeholder="الاسم الرسمي للمؤسسة"
          />
        </FormField>

        <FormField label="رقم الترخيص" required error={errors.licenseNo} touched={touched.licenseNo}>
          <input
            name="licenseNo"
            className={styles.input}
            value={form.licenseNo}
            onChange={onInput("licenseNo")}
            onBlur={onBlur("licenseNo")}
            placeholder="رقم الترخيص"
          />
        </FormField>

        <FormField label="شهادة الترخيص" required error={errors.licenseCert} touched={touched.licenseCert}>
          <input
            data-field="licenseCert"
            type="file"
            accept="application/pdf,image/*"
            className={styles.file}
            onChange={(e) => onFile("licenseCert")(e.target.files?.[0] || null)}
          />
          <span className={styles.hint}>PDF أو صورة - الحد الأقصى 5MB</span>
        </FormField>

        <FormField label="البريد الالكتروني" required error={errors.email} touched={touched.email}>
          <input
            name="email"
            type="email"
            className={styles.input}
            value={form.email}
            onChange={onInput("email")}
            onBlur={onBlur("email")}
            placeholder="info@organization.com"
            dir="ltr"
          />
        </FormField>

        <FormField label="خطاب الدعم" required error={errors.supportLetter} touched={touched.supportLetter}>
          <input
            data-field="supportLetter"
            type="file"
            accept="application/pdf"
            className={styles.file}
            onChange={(e) => onFile("supportLetter")(e.target.files?.[0] || null)}
          />
          <span className={styles.hint}>PDF فقط - الحد الأقصى 5MB</span>
        </FormField>

        <FormField label="الجوال" required error={errors.phone} touched={touched.phone}>
          <input
            name="phone"
            type="tel"
            className={styles.input}
            value={form.phone}
            onChange={onInput("phone")}
            onBlur={onBlur("phone")}
            placeholder="05xxxxxxxx"
            dir="ltr"
          />
        </FormField>

        <FormField label="اسم المدير التنفيذي" required error={errors.ceoName} touched={touched.ceoName}>
          <input
            name="ceoName"
            className={styles.input}
            value={form.ceoName}
            onChange={onInput("ceoName")}
            onBlur={onBlur("ceoName")}
            placeholder="الاسم الكامل"
          />
        </FormField>

        <FormField label="جوال المدير" required error={errors.ceoPhone} touched={touched.ceoPhone}>
          <input
            name="ceoPhone"
            type="tel"
            className={styles.input}
            value={form.ceoPhone}
            onChange={onInput("ceoPhone")}
            onBlur={onBlur("ceoPhone")}
            placeholder="05xxxxxxxx"
            dir="ltr"
          />
        </FormField>

        <FormField label="رقم الواتساب" error={errors.whatsapp} touched={touched.whatsapp}>
          <input
            name="whatsapp"
            type="tel"
            className={styles.input}
            value={form.whatsapp}
            onChange={onInput("whatsapp")}
            onBlur={onBlur("whatsapp")}
            placeholder="966xxxxxxxxx"
            dir="ltr"
          />
          <span className={styles.hint}>اختياري</span>
        </FormField>

        <FormField label="المدينة" required error={errors.city} touched={touched.city}>
          <input
            name="city"
            className={styles.input}
            value={form.city}
            onChange={onInput("city")}
            onBlur={onBlur("city")}
            placeholder="مثال: الرياض"
          />
        </FormField>

        <FormField label="نوع النشاط" required error={errors.activity} touched={touched.activity}>
          <CustomSelect
            value={form.activity}
            onChange={onSelect("activity")}
            options={[
              { value: "", label: "اختر" },
              { value: "scientific", label: "علمي" },
              { value: "dawah", label: "دعوي" },
              { value: "social", label: "اجتماعي" },
              { value: "other", label: "غير ذلك اذكره" },
            ]}
            placeholder="اختر"
          />
        </FormField>

        {isActivityOther && (
          <FormField
            label="اذكر نوع النشاط"
            required
            error={errors.activityOther}
            touched={touched.activityOther}
            className={styles.conditionalField}
          >
            <input
              name="activityOther"
              className={styles.input}
              value={form.activityOther}
              onChange={onInput("activityOther")}
              onBlur={onBlur("activityOther")}
              placeholder="اكتب نوع النشاط"
            />
          </FormField>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            PROJECT INFORMATION SECTION
        ═══════════════════════════════════════════════════════════════ */}
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>بيانات المشروع</h3>
        </div>

        <FormField label="اسم المشروع" required error={errors.projectName} touched={touched.projectName}>
          <input
            name="projectName"
            className={styles.input}
            value={form.projectName}
            onChange={onInput("projectName")}
            onBlur={onBlur("projectName")}
            placeholder="اسم المشروع"
          />
        </FormField>

        <FormField label="نوع المشروع" required error={errors.projectKind} touched={touched.projectKind}>
          <CustomSelect
            value={form.projectKind}
            onChange={onSelect("projectKind")}
            options={[
              { value: "", label: "اختر" },
              { value: "bar", label: "على أوجه البر العامة" },
              { value: "poor", label: "الفقراء" },
              { value: "orphans", label: "الأيتام" },
              { value: "dawah", label: "الدعوة" },
              { value: "quran", label: "القرآن وتعليمه" },
              { value: "udhiyah", label: "الأضاحي" },
              { value: "education", label: "التعليم" },
              { value: "mosques", label: "المساجد" },
              { value: "other", label: "غير ذلك اذكره" },
            ]}
            placeholder="اختر"
          />
        </FormField>

        {isProjectKindOther && (
          <FormField
            label="اذكر نوع المشروع"
            required
            error={errors.projectKindOther}
            touched={touched.projectKindOther}
            className={styles.conditionalField}
          >
            <input
              name="projectKindOther"
              className={styles.input}
              value={form.projectKindOther}
              onChange={onInput("projectKindOther")}
              onBlur={onBlur("projectKindOther")}
              placeholder="اكتب نوع المشروع"
            />
          </FormField>
        )}

        <FormField label="ملف المشروع" required error={errors.projectFile} touched={touched.projectFile}>
          <input
            data-field="projectFile"
            type="file"
            accept="application/pdf"
            className={styles.file}
            onChange={(e) => onFile("projectFile")(e.target.files?.[0] || null)}
          />
          <span className={styles.hint}>PDF فقط - الحد الأقصى 10MB</span>
        </FormField>

        <FormField label="مدير المشروع" required error={errors.projectManager} touched={touched.projectManager}>
          <input
            name="projectManager"
            className={styles.input}
            value={form.projectManager}
            onChange={onInput("projectManager")}
            onBlur={onBlur("projectManager")}
            placeholder="اسم مدير المشروع"
          />
        </FormField>

        <FormField label="جوال مدير المشروع" required error={errors.projectManagerPhone} touched={touched.projectManagerPhone}>
          <input
            name="projectManagerPhone"
            type="tel"
            className={styles.input}
            value={form.projectManagerPhone}
            onChange={onInput("projectManagerPhone")}
            onBlur={onBlur("projectManagerPhone")}
            placeholder="05xxxxxxxx"
            dir="ltr"
          />
        </FormField>

        <FormField
          label="أهداف المشروع"
          required
          error={errors.goals}
          touched={touched.goals}
          className={styles.full}
        >
          <div className={styles.goals}>
            {goals.map((g, i) => (
              <input
                key={i}
                className={styles.input}
                value={g}
                onChange={(e) => updateGoal(i, e.target.value)}
                placeholder={`الهدف ${i + 1}`}
              />
            ))}
            {goals.length < 6 && (
              <button type="button" className={styles.addGoal} onClick={addGoal}>
                + إضافة هدف آخر
              </button>
            )}
          </div>
          <span className={styles.hint}>هدف واحد على الأقل - حد أقصى 6 أهداف</span>
        </FormField>

        <FormField label="المستفيدون من المشروع" required error={errors.beneficiaries} touched={touched.beneficiaries}>
          <CustomSelect
            value={form.beneficiaries}
            onChange={onSelect("beneficiaries")}
            options={[
              { value: "", label: "اختر" },
              { value: "men", label: "رجال" },
              { value: "women", label: "نساء" },
              { value: "children", label: "اطفال" },
              { value: "all", label: "الجميع" },
              { value: "students", label: "طلبة علم" },
              { value: "pilgrims", label: "ضيوف الرحمن" },
              { value: "nonMuslims", label: "غير مسلمين" },
              { value: "other", label: "غير ذلك اذكره" },
            ]}
            placeholder="اختر"
          />
        </FormField>

        {isBeneficiariesOther && (
          <FormField
            label="اذكر نوع المستفيدين"
            required
            error={errors.beneficiariesOther}
            touched={touched.beneficiariesOther}
            className={`${styles.conditionalField} ${styles.full}`}
          >
            <input
              name="beneficiariesOther"
              className={styles.input}
              value={form.beneficiariesOther}
              onChange={onInput("beneficiariesOther")}
              onBlur={onBlur("beneficiariesOther")}
              placeholder="اكتب نوع المستفيدين"
            />
          </FormField>
        )}

        <FormField label="تكلفة المشروع (ريال)" required error={errors.totalCost} touched={touched.totalCost}>
          <input
            name="totalCost"
            type="number"
            min="1"
            className={styles.input}
            value={form.totalCost}
            onChange={onInput("totalCost")}
            onBlur={onBlur("totalCost")}
            placeholder="0"
          />
        </FormField>

        <FormField label="مخرجات المشروع" required error={errors.outputs} touched={touched.outputs} className={styles.full}>
          <textarea
            name="outputs"
            className={styles.textarea}
            value={form.outputs}
            onChange={onInput("outputs")}
            onBlur={onBlur("outputs")}
            placeholder="اكتب مخرجات المشروع المتوقعة..."
            rows={4}
          />
        </FormField>

        <FormField label="الخطة التشغيلية" required error={errors.opPlanFile} touched={touched.opPlanFile}>
          <input
            data-field="opPlanFile"
            type="file"
            accept="application/pdf"
            className={styles.file}
            onChange={(e) => onFile("opPlanFile")(e.target.files?.[0] || null)}
          />
          <span className={styles.hint}>PDF فقط - الحد الأقصى 10MB</span>
        </FormField>

        {/* ═══════════════════════════════════════════════════════════════
            SUPPORT DETAILS SECTION
        ═══════════════════════════════════════════════════════════════ */}
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>بيانات الدعم المطلوب</h3>
        </div>

        <FormField label="الدعم المطلوب" required error={errors.supportType} touched={touched.supportType}>
          <CustomSelect
            value={form.supportType}
            onChange={onSelect("supportType")}
            options={[
              { value: "", label: "اختر" },
              { value: "full", label: "كلي" },
              { value: "partial", label: "جزئي" },
            ]}
            placeholder="اختر"
          />
        </FormField>

        <FormField label="إجمالي المبلغ المطلوب (ريال)" required error={errors.totalAmount} touched={touched.totalAmount}>
          <input
            name="totalAmount"
            type="number"
            min="1"
            className={styles.input}
            value={form.totalAmount}
            onChange={onInput("totalAmount")}
            onBlur={onBlur("totalAmount")}
            placeholder="0"
          />
        </FormField>

        {/* ═══════════════════════════════════════════════════════════════
            BANK INFORMATION SECTION
        ═══════════════════════════════════════════════════════════════ */}
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>البيانات البنكية</h3>
        </div>

        <FormField label="اسم الحساب" required error={errors.accountName} touched={touched.accountName}>
          <input
            name="accountName"
            className={styles.input}
            value={form.accountName}
            onChange={onInput("accountName")}
            onBlur={onBlur("accountName")}
            placeholder="الاسم كما هو مسجل في البنك"
          />
        </FormField>

        <FormField label="رقم الحساب البنكي (IBAN)" required error={errors.iban} touched={touched.iban}>
          <input
            name="iban"
            className={styles.input}
            value={form.iban}
            onChange={onInput("iban")}
            onBlur={onBlur("iban")}
            placeholder="SA0000000000000000000000"
            dir="ltr"
          />
          <span className={styles.hint}>يبدأ بـ SA متبوعاً بـ 22 رقم/حرف</span>
        </FormField>

        <FormField label="اسم البنك" required error={errors.bank} touched={touched.bank}>
          <input
            name="bank"
            className={styles.input}
            value={form.bank}
            onChange={onInput("bank")}
            onBlur={onBlur("bank")}
            placeholder="مثال: البنك الأهلي"
          />
        </FormField>

        <FormField label="الشهادة البنكية" required error={errors.bankCert} touched={touched.bankCert}>
          <input
            data-field="bankCert"
            type="file"
            accept="application/pdf,image/*"
            className={styles.file}
            onChange={(e) => onFile("bankCert")(e.target.files?.[0] || null)}
          />
          <span className={styles.hint}>PDF أو صورة - الحد الأقصى 5MB</span>
        </FormField>

        {/* ═══════════════════════════════════════════════════════════════
            SUBMIT BUTTON
        ═══════════════════════════════════════════════════════════════ */}
        <div className={`${styles.actions} ${styles.full}`}>
          <button
            className={`${styles.submit} ${isSubmitting ? styles.submitting : ""}`}
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className={styles.spinner}></span>
                جاري الإرسال...
              </>
            ) : (
              "إرسال الطلب"
            )}
          </button>
        </div>
      </form>
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN SUPPORT TABS COMPONENT
// ════════════════════════════════════════════════════════════════════════════
export default function SupportTabs() {
  const [tab, setTab] = useState("individual");

  return (
    <section className={styles.section} dir="rtl">
      <div className={styles.container}>
        <div className={styles.tabs} role="tablist" aria-label="اختيار نوع الطلب">
          <button
            role="tab"
            aria-selected={tab === "individual"}
            aria-controls="individual-panel"
            id="individual-tab"
            className={`${styles.tabBtn} ${tab === "individual" ? styles.tabBtnActive : ""}`}
            onClick={() => setTab("individual")}
          >
            <span className={styles.tabIcon}>👤</span>
            طلب فرد
          </button>
          <button
            role="tab"
            aria-selected={tab === "organization"}
            aria-controls="organization-panel"
            id="organization-tab"
            className={`${styles.tabBtn} ${tab === "organization" ? styles.tabBtnActive : ""}`}
            onClick={() => setTab("organization")}
          >
            <span className={styles.tabIcon}>🏢</span>
            طلب مؤسسة
          </button>
        </div>
        {tab === "individual" ? <IndividualForm /> : <OrganizationForm />}
      </div>
    </section>
  );
}
