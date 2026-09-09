// ════════════════════════════════════════════════════════════════════════════
// SUPPORT SERVICE - API Integration for Support Request Forms
// ════════════════════════════════════════════════════════════════════════════

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// ═══════════════════════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * @typedef {Object} SupportSettings
 * @property {boolean} individual_support_enabled
 * @property {boolean} institutional_support_enabled
 */

/**
 * @typedef {Object} SubmitResponse
 * @property {string} message
 * @property {string} [request_number]
 * @property {string} [phone_number]
 */

/**
 * @typedef {Object} StatusResponse
 * @property {string} status
 * @property {string} message
 */

/**
 * @typedef {Object} ValidationError
 * @property {Object.<string, string[]>} errors
 */

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Handle API response and extract error messages
 * @param {Response} response
 * @returns {Promise<Object>}
 */
const handleApiResponse = async (response) => {
    const data = await response.json();

    if (!response.ok) {
        // Create error object with details
        const error = new Error(data.message || "حدث خطأ غير متوقع");
        error.status = response.status;
        error.data = data;

        // Handle validation errors (422)
        if (response.status === 422 && data.errors) {
            error.validationErrors = data.errors;
        }

        // Handle service disabled (403)
        if (response.status === 403) {
            error.serviceDisabled = true;
        }

        throw error;
    }

    return data;
};

/**
 * Create FormData from form object with proper field mapping
 * @param {Object} form - The form data
 * @param {Object} fieldMap - Mapping from form fields to API fields
 * @returns {FormData}
 */
const createFormData = (form, fieldMap) => {
    const formData = new FormData();

    for (const [formKey, apiKey] of Object.entries(fieldMap)) {
        const value = form[formKey];

        if (value === null || value === undefined || value === "") {
            continue; // Skip empty values
        }

        if (value instanceof File) {
            formData.append(apiKey, value);
        } else if (typeof value === "boolean") {
            formData.append(apiKey, value ? "1" : "0");
        } else {
            formData.append(apiKey, String(value));
        }
    }

    return formData;
};

// ═══════════════════════════════════════════════════════════════════════════
// INDIVIDUAL FORM FIELD MAPPING
// ═══════════════════════════════════════════════════════════════════════════

const INDIVIDUAL_FIELD_MAP = {
    name: "full_name",
    gender: "gender",
    nationality: "nationality",
    city: "city",
    housing: "housing_type",
    housingOther: "housing_type_other",
    birthDate: "birth_date",
    expiryDate: "identity_expiry_date",
    phone: "phone_number",
    whatsapp: "whatsapp_number",
    email: "email",
    activity: "scientific_activity",
    activityOther: "scientific_activity_other",
    workplace: "workplace",
    supportType: "support_scope",
    totalAmount: "amount_requested",
    supportKind: "support_type",
    supportKindOther: "support_type_other",
    income: "has_income", // Convert "yes"/"no" to 1/0
    incomeOther: "income_source",
    married: "marital_status", // Convert "yes"/"no" to "married"/"single"
    familyCount: "family_members_count",
    iban: "bank_account_iban",
    bank: "bank_name",
};

// ═══════════════════════════════════════════════════════════════════════════
// ORGANIZATION FORM FIELD MAPPING
// ═══════════════════════════════════════════════════════════════════════════

const ORGANIZATION_FIELD_MAP = {
    orgName: "institution_name",
    licenseNo: "license_number",
    licenseCert: "license_certificate_path",
    email: "email",
    supportLetter: "support_letter_path",
    phone: "phone_number",
    ceoName: "ceo_name",
    ceoPhone: "ceo_mobile",
    whatsapp: "whatsapp_number",
    city: "city",
    activity: "activity_type",
    activityOther: "activity_type_other",
    projectName: "project_name",
    projectKind: "project_type",
    projectKindOther: "project_type_other",
    projectFile: "project_file_path",
    projectManager: "project_manager_name",
    projectManagerPhone: "project_manager_mobile",
    beneficiaries: "beneficiaries",
    beneficiariesOther: "beneficiaries_other",
    totalCost: "project_cost",
    outputs: "project_outputs",
    opPlanFile: "operational_plan_path",
    supportType: "support_scope",
    totalAmount: "amount_requested",
    accountName: "account_name",
    iban: "bank_account_iban",
    bank: "bank_name",
    bankCert: "bank_certificate_path",
};

// ═══════════════════════════════════════════════════════════════════════════
// SUPPORT SERVICE
// ═══════════════════════════════════════════════════════════════════════════

export const SupportService = {
    /**
     * Check if support services are enabled
     * @returns {Promise<SupportSettings>}
     */
    getSettings: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/support/settings`, {
                method: "GET",
                headers: {
                    "Accept": "application/json",
                },
            });

            if (!response.ok) {
                // Return default values if endpoint fails
                return {
                    individual_support_enabled: true,
                    institutional_support_enabled: true,
                };
            }

            return response.json();
        } catch (error) {
            console.error("Failed to fetch support settings:", error);
            // Return default values on error
            return {
                individual_support_enabled: true,
                institutional_support_enabled: true,
            };
        }
    },

    /**
     * Submit individual support request
     * @param {Object} form - Form data from IndividualForm
     * @returns {Promise<SubmitResponse>}
     */
    submitIndividual: async (form) => {
        // Transform form data
        const transformedForm = {
            ...form,
            // Convert income yes/no to boolean
            income: form.income === "yes",
            // Convert married yes/no to marital_status
            married: form.married === "yes" ? "married" : "single",
            // Convert housing "other" value
            housing: form.housing === "other" ? "أخرى" : form.housing,
            // Convert activity "other" value
            activity: form.activity === "other" ? "أخرى" : form.activity,
            // Convert supportKind "other" value
            supportKind: form.supportKind === "other" ? "أخرى" : form.supportKind,
        };

        const formData = createFormData(transformedForm, INDIVIDUAL_FIELD_MAP);

        const response = await fetch(`${API_BASE_URL}/support/individual/store`, {
            method: "POST",
            headers: {
                "Accept": "application/json",
            },
            body: formData,
        });

        return handleApiResponse(response);
    },

    /**
     * Submit institutional support request
     * @param {Object} form - Form data from OrganizationForm
     * @param {string[]} goals - Array of project goals
     * @returns {Promise<SubmitResponse>}
     */
    submitInstitutional: async (form, goals) => {
        // Transform form data
        const transformedForm = {
            ...form,
            // Convert activity "other" value
            activity: form.activity === "other" ? "أخرى" : form.activity,
            // Convert projectKind "other" value
            projectKind: form.projectKind === "other" ? "أخرى" : form.projectKind,
            // Convert beneficiaries "other" value
            beneficiaries: form.beneficiaries === "other" ? "أخرى" : form.beneficiaries,
        };

        const formData = createFormData(transformedForm, ORGANIZATION_FIELD_MAP);

        // Add goals separately
        goals.forEach((goal, index) => {
            if (goal && goal.trim() !== "") {
                if (index < 4) {
                    formData.append(`goal_${index + 1}`, goal);
                } else {
                    // Combine remaining goals into other_goals
                    const existingOther = formData.get("other_goals") || "";
                    formData.set("other_goals", existingOther ? `${existingOther}, ${goal}` : goal);
                }
            }
        });

        const response = await fetch(`${API_BASE_URL}/support/institutional/store`, {
            method: "POST",
            headers: {
                "Accept": "application/json",
            },
            body: formData,
        });

        return handleApiResponse(response);
    },

    /**
     * Check individual request status
     * @param {string} requestNumber
     * @param {string} phoneNumber
     * @returns {Promise<StatusResponse>}
     */
    checkIndividualStatus: async (requestNumber, phoneNumber) => {
        const response = await fetch(`${API_BASE_URL}/support/individual/status`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            body: JSON.stringify({
                request_number: requestNumber,
                phone_number: phoneNumber,
            }),
        });

        return handleApiResponse(response);
    },

    /**
     * Check institutional request status
     * @param {string} requestNumber
     * @param {string} phoneNumber
     * @returns {Promise<StatusResponse>}
     */
    checkInstitutionalStatus: async (requestNumber, phoneNumber) => {
        const response = await fetch(`${API_BASE_URL}/support/institutional/status`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            body: JSON.stringify({
                request_number: requestNumber,
                phone_number: phoneNumber,
            }),
        });

        return handleApiResponse(response);
    },
};

// ═══════════════════════════════════════════════════════════════════════════
// ERROR HELPERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Map API validation errors to form field names
 * @param {Object} apiErrors - Errors from API
 * @param {Object} fieldMap - Field mapping (form -> api)
 * @returns {Object} - Errors mapped to form field names
 */
export const mapApiErrorsToForm = (apiErrors, fieldMap) => {
    const formErrors = {};

    // Create reverse map (api -> form)
    const reverseMap = {};
    for (const [formKey, apiKey] of Object.entries(fieldMap)) {
        reverseMap[apiKey] = formKey;
    }

    // Map errors
    for (const [apiKey, messages] of Object.entries(apiErrors)) {
        const formKey = reverseMap[apiKey] || apiKey;
        formErrors[formKey] = Array.isArray(messages) ? messages[0] : messages;
    }

    return formErrors;
};

/**
 * Map individual form API errors
 * @param {Object} apiErrors
 * @returns {Object}
 */
export const mapIndividualErrors = (apiErrors) => {
    return mapApiErrorsToForm(apiErrors, INDIVIDUAL_FIELD_MAP);
};

/**
 * Map organization form API errors
 * @param {Object} apiErrors
 * @returns {Object}
 */
export const mapOrganizationErrors = (apiErrors) => {
    return mapApiErrorsToForm(apiErrors, ORGANIZATION_FIELD_MAP);
};

export default SupportService;
