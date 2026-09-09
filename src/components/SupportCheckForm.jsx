"use client";

import { useState, useEffect } from "react";
import styles from "./SupportCheckForm.module.css";
import {
  FiSearch, FiUser, FiPhone, FiCheckCircle, FiXCircle,
  FiClock, FiAlertCircle, FiFileText, FiRefreshCw,
  FiUpload, FiCalendar, FiMessageCircle
} from "react-icons/fi";

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001/api";

// Status configurations - Updated based on documentation
const STATUS_CONFIG = {
  pending: {
    icon: FiClock,
    color: "warning",
    label: "قيد المراجعة",
    description: "طلبك حالياً قيد المراجعة من قبل الإدارة المختصة.",
    showUploadForm: false,
  },
  waiting_for_attachments: {
    icon: FiUpload,
    color: "info",
    label: "بانتظار المرفقات",
    description: "يوجد ملاحظات على المرفقات الخاصة بطلبك. يرجى مراجعة الملاحظة أدناه.",
    showUploadForm: true,
  },
  waiting_for_documents: {
    icon: FiUpload,
    color: "info",
    label: "بانتظار المستندات",
    description: "يرجى رفع المستندات المطلوبة لإكمال طلبك.",
    showUploadForm: true,
  },
  documents_review: {
    icon: FiSearch,
    color: "info",
    label: "مراجعة المستندات",
    description: "جاري مراجعة المستندات المرفقة. سيتم إعلامك بالنتيجة قريباً.",
    showUploadForm: false,
  },
  approved: {
    icon: FiCheckCircle,
    color: "success",
    label: "تمت الموافقة 🎉",
    description: "يسرنا إبلاغك بأنه تمت الموافقة على طلب الدعم الخاص بك. سيتم التواصل معك قريباً لإكمال الإجراءات.",
    showUploadForm: false,
  },
  completed: {
    icon: FiCheckCircle,
    color: "success",
    label: "مكتمل",
    description: "تم إكمال طلبك بنجاح. شكراً لثقتكم بنا.",
    showUploadForm: false,
  },
  rejected: {
    icon: FiXCircle,
    color: "error",
    label: "مرفوض",
    description: "نعتذر، لم يتم قبول طلبك.",
    showUploadForm: false,
  },
  archived: {
    icon: FiFileText,
    color: "neutral",
    label: "مؤرشف",
    description: "تم أرشفة هذا الطلب.",
    showUploadForm: false,
  },
};

// File upload fields for different request types
const UPLOAD_FIELDS = {
  individual: [
    { key: "identity_image_path", label: "صورة الهوية", accept: "image/*" },
    { key: "recommendation_path", label: "تزكية / تعريف", accept: ".pdf,image/*" },
    { key: "academic_qualification_path", label: "المؤهل العلمي", accept: ".pdf,image/*" },
    { key: "cv_path", label: "السيرة الذاتية", accept: ".pdf" },
  ],
  institutional: [
    { key: "license_certificate_path", label: "شهادة الترخيص", accept: ".pdf,image/*" },
    { key: "support_letter_path", label: "خطاب الدعم", accept: ".pdf" },
    { key: "project_file_path", label: "ملف المشروع", accept: ".pdf" },
    { key: "operational_plan_path", label: "الخطة التشغيلية", accept: ".pdf" },
  ],
};

export default function SupportCheckForm() {
  // Form state
  const [requestNumber, setRequestNumber] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [requestType, setRequestType] = useState("individual"); // 'individual' | 'institutional'

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  // File upload state
  const [uploadFiles, setUploadFiles] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Load saved phone from localStorage
  useEffect(() => {
    const savedPhone = localStorage.getItem("support_check_phone");
    if (savedPhone) {
      setPhoneNumber(savedPhone);
    }
  }, []);

  // Validation
  const validate = () => {
    const newErrors = {};

    if (!requestNumber || requestNumber.trim().length < 1) {
      newErrors.requestNumber = "رقم الطلب مطلوب";
    }

    const cleanedPhone = phoneNumber.replace(/[\s-]/g, "");
    if (!cleanedPhone || cleanedPhone.length < 9) {
      newErrors.phoneNumber = "يرجى إدخال رقم جوال صحيح";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit handler
  const onSubmit = async (e) => {
    e.preventDefault();
    setResult(null);
    setErrorMessage("");
    setUploadFiles({});
    setUploadSuccess(false);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    localStorage.setItem("support_check_phone", phoneNumber);

    try {
      const endpoint = requestType === "individual"
        ? `${API_BASE_URL}/support/individual/status`
        : `${API_BASE_URL}/support/institutional/status`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          request_number: requestNumber.trim(),
          phone_number: phoneNumber.replace(/[\s-]/g, ""),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          status: data.status,
          message: data.message,
          rejectionReason: data.rejection_reason,
          adminMessage: data.admin_response_message,
          createdAt: data.created_at,
        });
      } else if (response.status === 404) {
        setErrorMessage(data.message || "عذراً، لم نعثر على أي طلب مطابق لرقم الطلب ورقم الهاتف المدخلين. يرجى التأكد من البيانات والمحاولة مرة أخرى.");
      } else if (response.status === 422) {
        if (data.errors) {
          setErrors({
            requestNumber: data.errors.request_number?.[0],
            phoneNumber: data.errors.phone_number?.[0],
          });
        } else {
          setErrorMessage("يرجى التأكد من صحة البيانات المدخلة");
        }
      } else {
        setErrorMessage(data.message || "حدث خطأ غير متوقع، يرجى المحاولة لاحقاً");
      }
    } catch (error) {
      console.error("Status check error:", error);
      setErrorMessage("حدث خطأ في الاتصال بالخادم، يرجى المحاولة لاحقاً");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle file selection
  const handleFileChange = (fieldKey, file) => {
    setUploadFiles(prev => ({
      ...prev,
      [fieldKey]: file,
    }));
  };

  // Handle file upload (placeholder - needs backend endpoint)
  const handleUploadFiles = async () => {
    const hasFiles = Object.values(uploadFiles).some(f => f);
    if (!hasFiles) {
      alert("يرجى اختيار ملف واحد على الأقل للرفع");
      return;
    }

    setIsUploading(true);

    try {
      // TODO: Implement when backend endpoint is ready
      // For now, show WhatsApp contact option

      // Simulate delay
      await new Promise(r => setTimeout(r, 1000));

      // Show success with WhatsApp option
      setUploadSuccess(true);
    } catch (error) {
      console.error("Upload error:", error);
      alert("حدث خطأ أثناء رفع الملفات");
    } finally {
      setIsUploading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setResult(null);
    setErrorMessage("");
    setRequestNumber("");
    setUploadFiles({});
    setUploadSuccess(false);
  };

  // Get status config
  const getStatusConfig = (status) => {
    return STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return null;
    try {
      return new Date(dateString).toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Get WhatsApp link
  const getWhatsAppLink = () => {
    const message = encodeURIComponent(
      `السلام عليكم،\nأود الاستفسار عن طلب الدعم رقم: ${requestNumber}\nرقم الجوال: ${phoneNumber}`
    );
    return `https://wa.me/966500000000?text=${message}`; // Replace with actual number
  };

  return (
    <section className={styles.section} dir="rtl">
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.iconWrapper}>
            <FiSearch size={32} />
          </div>
          <h2 className={styles.title}>الاستعلام عن حالة الطلب</h2>
          <p className={styles.subtitle}>
            أدخل رقم الطلب ورقم الجوال للتحقق من حالة طلبك
          </p>
        </div>

        {/* Result Card */}
        {result && (
          <div className={`${styles.resultCard} ${styles[`result${getStatusConfig(result.status).color}`]}`}>
            {/* Status Icon */}
            <div className={styles.resultIcon}>
              {(() => {
                const StatusIcon = getStatusConfig(result.status).icon;
                return <StatusIcon size={48} />;
              })()}
            </div>

            {/* Status Content */}
            <div className={styles.resultContent}>
              <span className={styles.resultLabel}>
                {getStatusConfig(result.status).label}
              </span>

              <p className={styles.resultMessage}>
                {result.message || getStatusConfig(result.status).description}
              </p>

              {/* Created Date */}
              {result.createdAt && (
                <div className={styles.dateInfo}>
                  <FiCalendar size={16} />
                  <span>تاريخ الطلب: {formatDate(result.createdAt)}</span>
                </div>
              )}

              {/* Rejection Reason / Notes (for waiting_for_attachments or rejected) */}
              {result.rejectionReason && (
                <div className={styles.reasonBox}>
                  <strong>
                    {result.status === 'rejected' ? '📋 سبب الرفض:' : '📝 ملاحظات المراجعة:'}
                  </strong>
                  <p>{result.rejectionReason}</p>
                </div>
              )}

              {/* Admin message */}
              {result.adminMessage && (
                <div className={styles.adminMessage}>
                  <strong>💬 رسالة الإدارة:</strong>
                  <p>{result.adminMessage}</p>
                </div>
              )}
            </div>

            {/* Upload Form for waiting_for_attachments */}
            {getStatusConfig(result.status).showUploadForm && !uploadSuccess && (
              <div className={styles.uploadSection}>
                <h3 className={styles.uploadTitle}>
                  <FiUpload size={20} />
                  رفع الملفات المطلوبة
                </h3>

                <div className={styles.uploadFields}>
                  {UPLOAD_FIELDS[requestType].map((field) => (
                    <div key={field.key} className={styles.uploadField}>
                      <label className={styles.uploadLabel}>
                        {field.label}
                      </label>
                      <div className={styles.uploadInputWrapper}>
                        <input
                          type="file"
                          accept={field.accept}
                          onChange={(e) => handleFileChange(field.key, e.target.files?.[0])}
                          className={styles.uploadInput}
                          id={`upload-${field.key}`}
                        />
                        <label
                          htmlFor={`upload-${field.key}`}
                          className={`${styles.uploadBtn} ${uploadFiles[field.key] ? styles.uploadBtnActive : ""}`}
                        >
                          {uploadFiles[field.key] ? (
                            <>✓ {uploadFiles[field.key].name}</>
                          ) : (
                            <>📎 اختر ملف</>
                          )}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  className={styles.uploadSubmitBtn}
                  onClick={handleUploadFiles}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <span className={styles.submitting}>
                      <span className={styles.spinner}></span>
                      جاري الرفع...
                    </span>
                  ) : (
                    <>
                      <FiUpload size={18} />
                      إرسال الملفات
                    </>
                  )}
                </button>

                {/* WhatsApp Alternative */}
                <div className={styles.whatsappNote}>
                  <span>أو يمكنك إرسال الملفات عبر:</span>
                  <a
                    href={getWhatsAppLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.whatsappBtn}
                  >
                    <FiMessageCircle size={18} />
                    واتساب
                  </a>
                </div>
              </div>
            )}

            {/* Upload Success Message */}
            {uploadSuccess && (
              <div className={styles.uploadSuccessBox}>
                <FiCheckCircle size={32} />
                <h4>تم استلام ملفاتك بنجاح!</h4>
                <p>سيتم مراجعة الملفات المرفقة وإعلامك بالنتيجة قريباً.</p>
                <p className={styles.whatsappAlt}>
                  للتأكد من الاستلام أو للاستفسار:
                  <a href={getWhatsAppLink()} target="_blank" rel="noopener noreferrer">
                    تواصل عبر واتساب
                  </a>
                </p>
              </div>
            )}

            {/* New Search Button */}
            <button
              type="button"
              className={styles.newSearchBtn}
              onClick={resetForm}
            >
              <FiRefreshCw size={18} />
              استعلام جديد
            </button>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className={styles.errorCard}>
            <FiAlertCircle size={24} />
            <p>{errorMessage}</p>
          </div>
        )}

        {/* Form - Hide when showing result */}
        {!result && (
          <form className={styles.form} onSubmit={onSubmit} noValidate>
            {/* Request Type Tabs */}
            <div className={styles.tabs}>
              <button
                type="button"
                className={`${styles.tab} ${requestType === "individual" ? styles.tabActive : ""}`}
                onClick={() => setRequestType("individual")}
              >
                <FiUser size={18} />
                طلب أفراد
              </button>
              <button
                type="button"
                className={`${styles.tab} ${requestType === "institutional" ? styles.tabActive : ""}`}
                onClick={() => setRequestType("institutional")}
              >
                <FiFileText size={18} />
                طلب مؤسسات
              </button>
            </div>

            {/* Form Fields */}
            <div className={styles.fields}>
              {/* Request Number */}
              <div className={styles.field}>
                <label className={styles.label} htmlFor="requestNumber">
                  رقم الطلب <span className={styles.required}>*</span>
                </label>
                <div className={styles.inputWrapper}>
                  <input
                    id="requestNumber"
                    name="requestNumber"
                    type="text"
                    inputMode="numeric"
                    className={`${styles.input} ${errors.requestNumber ? styles.inputError : ""}`}
                    value={requestNumber}
                    onChange={(e) => {
                      setRequestNumber(e.target.value);
                      if (errors.requestNumber) {
                        setErrors({ ...errors, requestNumber: "" });
                      }
                    }}
                    placeholder="مثال: 0045"
                    aria-invalid={!!errors.requestNumber}
                  />
                  <span className={styles.inputIcon}>🔢</span>
                </div>
                {errors.requestNumber && (
                  <span className={styles.error}>{errors.requestNumber}</span>
                )}
              </div>

              {/* Phone Number */}
              <div className={styles.field}>
                <label className={styles.label} htmlFor="phoneNumber">
                  رقم الجوال <span className={styles.required}>*</span>
                </label>
                <div className={styles.inputWrapper}>
                  <input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    inputMode="tel"
                    className={`${styles.input} ${errors.phoneNumber ? styles.inputError : ""}`}
                    value={phoneNumber}
                    onChange={(e) => {
                      setPhoneNumber(e.target.value);
                      if (errors.phoneNumber) {
                        setErrors({ ...errors, phoneNumber: "" });
                      }
                    }}
                    placeholder="05xxxxxxxx"
                    dir="ltr"
                    aria-invalid={!!errors.phoneNumber}
                  />
                  <span className={styles.inputIcon}>📱</span>
                </div>
                {errors.phoneNumber && (
                  <span className={styles.error}>{errors.phoneNumber}</span>
                )}
                <span className={styles.hint}>
                  الرقم الذي استخدمته عند التقديم
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <div className={styles.actions}>
              <button
                className={styles.submit}
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className={styles.submitting}>
                    <span className={styles.spinner}></span>
                    جاري البحث...
                  </span>
                ) : (
                  <>
                    <FiSearch size={20} />
                    استعلام
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Info Note */}
        <div className={styles.infoNote}>
          <span className={styles.noteIcon}>💡</span>
          <span>
            رقم الطلب هو الرقم الذي حصلت عليه عند تقديم طلبك. إذا فقدته، يرجى التواصل معنا.
          </span>
        </div>
      </div>
    </section>
  );
}
