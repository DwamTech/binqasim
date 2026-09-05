// ════════════════════════════════════════════════════════════════════════════
// FORM VALIDATION UTILITIES
// ════════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════
// VALIDATION PATTERNS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Saudi Phone Number Pattern
 * Formats: 05xxxxxxxx, +9665xxxxxxxx, 9665xxxxxxxx
 */
export const SA_PHONE_REGEX = /^(?:\+?966|0)?5[0-9]{8}$/;

/**
 * International Phone Pattern (with country code)
 * Accepts: +20xxxxxxxxxx, 0xxxxxxxxx, 966xxxxxxxxx
 */
export const INTL_PHONE_REGEX = /^(?:\+?[0-9]{1,4})?[0-9]{8,14}$/;

/**
 * Email Pattern
 */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Saudi IBAN Pattern
 * Format: SA followed by 22 alphanumeric characters
 */
export const SA_IBAN_REGEX = /^SA[0-9]{2}[A-Z0-9]{18}$/i;

/**
 * Arabic Text Pattern (allows spaces, numbers)
 */
export const ARABIC_TEXT_REGEX = /^[\u0600-\u06FF\s\d]+$/;

// ═══════════════════════════════════════════════════════════════════════════
// FILE VALIDATORS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Validate file size
 * @param {File} file - The file to validate
 * @param {number} maxSizeMB - Maximum size in MB
 * @returns {boolean}
 */
export const isFileSizeValid = (file, maxSizeMB = 5) => {
    if (!file) return true;
    const maxBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxBytes;
};

/**
 * Validate file type
 * @param {File} file - The file to validate
 * @param {string[]} allowedTypes - Array of allowed MIME types
 * @returns {boolean}
 */
export const isFileTypeValid = (file, allowedTypes) => {
    if (!file) return true;
    return allowedTypes.some(type => {
        if (type.endsWith('/*')) {
            const baseType = type.replace('/*', '');
            return file.type.startsWith(baseType);
        }
        return file.type === type;
    });
};

/**
 * Get file extension from filename
 * @param {string} filename
 * @returns {string}
 */
export const getFileExtension = (filename) => {
    return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2).toLowerCase();
};

// ═══════════════════════════════════════════════════════════════════════════
// DATE VALIDATORS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Check if date is in the past
 * @param {string} dateString
 * @returns {boolean}
 */
export const isPastDate = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
};

/**
 * Check if date is in the future
 * @param {string} dateString
 * @returns {boolean}
 */
export const isFutureDate = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date > today;
};

/**
 * Calculate age from birth date
 * @param {string} dateString
 * @returns {number}
 */
export const calculateAge = (dateString) => {
    if (!dateString) return 0;
    const birthDate = new Date(dateString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};

// ═══════════════════════════════════════════════════════════════════════════
// FIELD VALIDATORS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Create a validation result object
 * @param {boolean} isValid
 * @param {string} message
 * @returns {{ isValid: boolean, message: string }}
 */
const result = (isValid, message = "") => ({ isValid, message });

/**
 * Validate required field
 */
export const validateRequired = (value, fieldName = "هذا الحقل") => {
    if (value === undefined || value === null) {
        return result(false, `${fieldName} مطلوب`);
    }
    if (typeof value === "string" && value.trim() === "") {
        return result(false, `${fieldName} مطلوب`);
    }
    return result(true);
};

/**
 * Validate minimum length
 */
export const validateMinLength = (value, minLength, fieldName = "هذا الحقل") => {
    if (!value || value.length < minLength) {
        return result(false, `${fieldName} يجب أن يحتوي على الأقل ${minLength} أحرف`);
    }
    return result(true);
};

/**
 * Validate maximum length
 */
export const validateMaxLength = (value, maxLength, fieldName = "هذا الحقل") => {
    if (value && value.length > maxLength) {
        return result(false, `${fieldName} يجب ألا يتجاوز ${maxLength} حرف`);
    }
    return result(true);
};

/**
 * Validate email format
 */
export const validateEmail = (value) => {
    if (!value) return result(true);
    if (!EMAIL_REGEX.test(value)) {
        return result(false, "البريد الإلكتروني غير صالح");
    }
    return result(true);
};

/**
 * Validate Saudi phone number
 */
export const validateSAPhone = (value) => {
    if (!value) return result(true);
    // Remove spaces and dashes
    const cleaned = value.replace(/[\s-]/g, "");
    if (!SA_PHONE_REGEX.test(cleaned)) {
        return result(false, "رقم الجوال غير صالح (مثال: 05xxxxxxxx)");
    }
    return result(true);
};

/**
 * Validate international phone
 */
export const validateIntlPhone = (value) => {
    if (!value) return result(true);
    const cleaned = value.replace(/[\s-]/g, "");
    if (!INTL_PHONE_REGEX.test(cleaned)) {
        return result(false, "رقم الهاتف غير صالح");
    }
    return result(true);
};

/**
 * Validate Saudi IBAN
 */
export const validateSAIBAN = (value) => {
    if (!value) return result(true);
    const cleaned = value.replace(/\s/g, "").toUpperCase();
    if (!SA_IBAN_REGEX.test(cleaned)) {
        return result(false, "رقم الآيبان غير صالح (يجب أن يبدأ بـ SA)");
    }
    return result(true);
};

/**
 * Validate number is positive
 */
export const validatePositiveNumber = (value, fieldName = "المبلغ") => {
    if (!value) return result(true);
    const num = parseFloat(value);
    if (isNaN(num) || num <= 0) {
        return result(false, `${fieldName} يجب أن يكون رقماً موجباً`);
    }
    return result(true);
};

/**
 * Validate birth date (must be in past, age >= minAge)
 */
export const validateBirthDate = (value, minAge = 18) => {
    if (!value) return result(true);
    if (!isPastDate(value)) {
        return result(false, "تاريخ الميلاد يجب أن يكون في الماضي");
    }
    const age = calculateAge(value);
    if (age < minAge) {
        return result(false, `يجب أن يكون عمرك ${minAge} سنة على الأقل`);
    }
    return result(true);
};

/**
 * Validate expiry date (must be in future)
 */
export const validateExpiryDate = (value) => {
    if (!value) return result(true);
    if (!isFutureDate(value)) {
        return result(false, "تاريخ الانتهاء يجب أن يكون في المستقبل");
    }
    return result(true);
};

/**
 * Validate file
 */
export const validateFile = (file, options = {}) => {
    const { required = false, maxSizeMB = 5, allowedTypes = [] } = options;

    if (!file) {
        if (required) {
            return result(false, "الملف مطلوب");
        }
        return result(true);
    }

    if (!isFileSizeValid(file, maxSizeMB)) {
        return result(false, `حجم الملف يجب ألا يتجاوز ${maxSizeMB} ميجابايت`);
    }

    if (allowedTypes.length > 0 && !isFileTypeValid(file, allowedTypes)) {
        return result(false, "نوع الملف غير مدعوم");
    }

    return result(true);
};

// ═══════════════════════════════════════════════════════════════════════════
// FORM VALIDATION SCHEMAS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Individual Form Validation Schema
 */
export const individualFormSchema = {
    name: (value) => {
        const req = validateRequired(value, "الاسم");
        if (!req.isValid) return req;
        return validateMinLength(value, 3, "الاسم");
    },
    gender: (value) => validateRequired(value, "الجنس"),
    nationality: (value) => validateRequired(value, "الجنسية"),
    city: (value) => validateRequired(value, "المدينة"),
    housing: (value) => validateRequired(value, "نوع السكن"),
    housingOther: (value, form) => {
        if (form.housing !== "other") return result(true);
        const req = validateRequired(value, "نوع السكن");
        if (!req.isValid) return req;
        return validateMinLength(value, 2, "نوع السكن");
    },
    idImage: (value) => validateFile(value, {
        required: true,
        maxSizeMB: 5,
        allowedTypes: ["image/*"]
    }),
    birthDate: (value) => {
        const req = validateRequired(value, "تاريخ الميلاد");
        if (!req.isValid) return req;
        return validateBirthDate(value, 18);
    },
    expiryDate: (value) => {
        const req = validateRequired(value, "تاريخ الانتهاء");
        if (!req.isValid) return req;
        return validateExpiryDate(value);
    },
    phone: (value) => {
        const req = validateRequired(value, "رقم الاتصال");
        if (!req.isValid) return req;
        return validateSAPhone(value);
    },
    whatsapp: (value) => {
        if (!value) return result(true);
        return validateIntlPhone(value);
    },
    email: (value) => {
        const req = validateRequired(value, "البريد الإلكتروني");
        if (!req.isValid) return req;
        return validateEmail(value);
    },
    educationImage: (value) => validateFile(value, {
        required: true,
        maxSizeMB: 5,
        allowedTypes: ["image/*", "application/pdf"]
    }),
    activity: (value) => validateRequired(value, "النشاط العلمي"),
    activityOther: (value, form) => {
        if (form.activity !== "other") return result(true);
        const req = validateRequired(value, "النشاط");
        if (!req.isValid) return req;
        return validateMinLength(value, 2, "النشاط");
    },
    cvFile: (value) => validateFile(value, {
        required: true,
        maxSizeMB: 5,
        allowedTypes: ["application/pdf"]
    }),
    workplace: (value) => validateRequired(value, "مكان العمل"),
    supportType: (value) => validateRequired(value, "الدعم المطلوب"),
    totalAmount: (value) => {
        const req = validateRequired(value, "المبلغ المطلوب");
        if (!req.isValid) return req;
        return validatePositiveNumber(value, "المبلغ المطلوب");
    },
    supportKind: (value) => validateRequired(value, "نوع الدعم"),
    supportKindOther: (value, form) => {
        if (form.supportKind !== "other") return result(true);
        const req = validateRequired(value, "نوع الدعم");
        if (!req.isValid) return req;
        return validateMinLength(value, 2, "نوع الدعم");
    },
    income: (value) => validateRequired(value, "هل يوجد دخل"),
    incomeOther: (value, form) => {
        if (form.income !== "yes") return result(true);
        const req = validateRequired(value, "نوع الدخل");
        if (!req.isValid) return req;
        return validateMinLength(value, 2, "نوع الدخل");
    },
    married: (value) => validateRequired(value, "الحالة الاجتماعية"),
    familyCount: (value, form) => {
        if (form.married !== "yes") return result(true);
        const req = validateRequired(value, "عدد أفراد الأسرة");
        if (!req.isValid) return req;
        return validatePositiveNumber(value, "عدد أفراد الأسرة");
    },
    recommendationsFile: (value) => validateFile(value, {
        required: false,
        maxSizeMB: 5,
        allowedTypes: ["application/pdf"]
    }),
    iban: (value) => {
        const req = validateRequired(value, "رقم الآيبان");
        if (!req.isValid) return req;
        return validateSAIBAN(value);
    },
    bank: (value) => validateRequired(value, "اسم البنك"),
};

/**
 * Organization Form Validation Schema
 */
export const organizationFormSchema = {
    orgName: (value) => {
        const req = validateRequired(value, "اسم المؤسسة");
        if (!req.isValid) return req;
        return validateMinLength(value, 5, "اسم المؤسسة");
    },
    licenseNo: (value) => validateRequired(value, "رقم الترخيص"),
    licenseCert: (value) => validateFile(value, {
        required: true,
        maxSizeMB: 5,
        allowedTypes: ["application/pdf", "image/*"]
    }),
    email: (value) => {
        const req = validateRequired(value, "البريد الإلكتروني");
        if (!req.isValid) return req;
        return validateEmail(value);
    },
    supportLetter: (value) => validateFile(value, {
        required: true,
        maxSizeMB: 5,
        allowedTypes: ["application/pdf"]
    }),
    phone: (value) => {
        const req = validateRequired(value, "رقم الجوال");
        if (!req.isValid) return req;
        return validateSAPhone(value);
    },
    ceoName: (value) => {
        const req = validateRequired(value, "اسم المدير التنفيذي");
        if (!req.isValid) return req;
        return validateMinLength(value, 3, "اسم المدير التنفيذي");
    },
    ceoPhone: (value) => {
        const req = validateRequired(value, "جوال المدير");
        if (!req.isValid) return req;
        return validateSAPhone(value);
    },
    whatsapp: (value) => {
        if (!value) return result(true);
        return validateIntlPhone(value);
    },
    city: (value) => validateRequired(value, "المدينة"),
    activity: (value) => validateRequired(value, "نوع النشاط"),
    activityOther: (value, form) => {
        if (form.activity !== "other") return result(true);
        const req = validateRequired(value, "نوع النشاط");
        if (!req.isValid) return req;
        return validateMinLength(value, 2, "نوع النشاط");
    },
    projectName: (value) => {
        const req = validateRequired(value, "اسم المشروع");
        if (!req.isValid) return req;
        return validateMinLength(value, 3, "اسم المشروع");
    },
    projectKind: (value) => validateRequired(value, "نوع المشروع"),
    projectKindOther: (value, form) => {
        if (form.projectKind !== "other") return result(true);
        const req = validateRequired(value, "نوع المشروع");
        if (!req.isValid) return req;
        return validateMinLength(value, 2, "نوع المشروع");
    },
    projectFile: (value) => validateFile(value, {
        required: true,
        maxSizeMB: 10,
        allowedTypes: ["application/pdf"]
    }),
    projectManager: (value) => {
        const req = validateRequired(value, "مدير المشروع");
        if (!req.isValid) return req;
        return validateMinLength(value, 3, "مدير المشروع");
    },
    projectManagerPhone: (value) => {
        const req = validateRequired(value, "جوال مدير المشروع");
        if (!req.isValid) return req;
        return validateSAPhone(value);
    },
    beneficiaries: (value) => validateRequired(value, "المستفيدون"),
    beneficiariesOther: (value, form) => {
        if (form.beneficiaries !== "other") return result(true);
        const req = validateRequired(value, "نوع المستفيدين");
        if (!req.isValid) return req;
        return validateMinLength(value, 2, "نوع المستفيدين");
    },
    totalCost: (value) => {
        const req = validateRequired(value, "تكلفة المشروع");
        if (!req.isValid) return req;
        return validatePositiveNumber(value, "تكلفة المشروع");
    },
    outputs: (value) => {
        const req = validateRequired(value, "مخرجات المشروع");
        if (!req.isValid) return req;
        return validateMinLength(value, 10, "مخرجات المشروع");
    },
    opPlanFile: (value) => validateFile(value, {
        required: true,
        maxSizeMB: 10,
        allowedTypes: ["application/pdf"]
    }),
    supportType: (value) => validateRequired(value, "الدعم المطلوب"),
    totalAmount: (value) => {
        const req = validateRequired(value, "المبلغ المطلوب");
        if (!req.isValid) return req;
        return validatePositiveNumber(value, "المبلغ المطلوب");
    },
    accountName: (value) => {
        const req = validateRequired(value, "اسم الحساب");
        if (!req.isValid) return req;
        return validateMinLength(value, 3, "اسم الحساب");
    },
    iban: (value) => {
        const req = validateRequired(value, "رقم الآيبان");
        if (!req.isValid) return req;
        return validateSAIBAN(value);
    },
    bank: (value) => validateRequired(value, "اسم البنك"),
    bankCert: (value) => validateFile(value, {
        required: true,
        maxSizeMB: 5,
        allowedTypes: ["application/pdf", "image/*"]
    }),
};

// ═══════════════════════════════════════════════════════════════════════════
// FORM VALIDATION HELPER
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Validate a single field
 * @param {string} fieldName - The name of the field
 * @param {any} value - The value to validate
 * @param {object} form - The entire form object (for conditional validations)
 * @param {object} schema - The validation schema
 * @returns {{ isValid: boolean, message: string }}
 */
export const validateField = (fieldName, value, form, schema) => {
    const validator = schema[fieldName];
    if (!validator) return result(true);
    return validator(value, form);
};

/**
 * Validate entire form
 * @param {object} form - The form data
 * @param {object} schema - The validation schema
 * @returns {{ isValid: boolean, errors: object }}
 */
export const validateForm = (form, schema) => {
    const errors = {};
    let isValid = true;

    for (const fieldName of Object.keys(schema)) {
        const validation = validateField(fieldName, form[fieldName], form, schema);
        if (!validation.isValid) {
            errors[fieldName] = validation.message;
            isValid = false;
        }
    }

    return { isValid, errors };
};

/**
 * Validate goals array (special case for organization form)
 * @param {string[]} goals
 * @returns {{ isValid: boolean, message: string }}
 */
export const validateGoals = (goals) => {
    if (!goals || goals.length === 0) {
        return result(false, "يجب إدخال هدف واحد على الأقل");
    }
    const hasValidGoal = goals.some(g => g && g.trim() !== "");
    if (!hasValidGoal) {
        return result(false, "يجب إدخال هدف واحد على الأقل");
    }
    return result(true);
};
