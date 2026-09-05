"use client";
import React, { useEffect, useState, useCallback } from "react";
import {
    FiSettings,
    FiSave,
    FiRefreshCw,
    FiCheckCircle,
    FiXCircle,
    FiPhone,
    FiMail,
    FiMapPin,
    FiFileText,
    FiEdit3,
    FiGlobe,
    FiSmartphone,
    FiBriefcase,
    FiShare2
} from "react-icons/fi";
import {
    FaYoutube,
    FaTwitter,
    FaFacebook,
    FaSnapchat,
    FaInstagram,
    FaTiktok,
    FaHeadset,
    FaUserTie,
    FaPhoneVolume
} from "react-icons/fa";
import {
    SiteContactService,
    SiteContactData,
    SocialMedia,
    PhoneNumbers,
    BusinessDetails
} from "./siteContactService";

// ════════════════════════════════════════════════════════════════════════════
// SECTION CARD COMPONENT
// ════════════════════════════════════════════════════════════════════════════
const SectionCard = ({
    title,
    icon,
    color,
    children,
    isEditing,
    onEdit,
    onSave,
    onCancel,
    saving,
    hasChanges
}: {
    title: string;
    icon: React.ReactNode;
    color: string;
    children: React.ReactNode;
    isEditing: boolean;
    onEdit: () => void;
    onSave: () => void;
    onCancel: () => void;
    saving: boolean;
    hasChanges: boolean;
}) => (
    <div className="settings-card bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
        {/* Header */}
        <div className={`p-5 ${color} bg-opacity-10 border-b border-gray-100`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl ${color} bg-opacity-20 flex items-center justify-center`}>
                        {React.cloneElement(icon as React.ReactElement<{ className?: string }>, {
                            className: `text-xl ${color.replace("bg-", "text-")}`
                        })}
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">{title}</h2>
                        <p className="text-xs text-gray-500">
                            {isEditing ? "وضع التعديل" : "انقر على تعديل للتحرير"}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {isEditing ? (
                        <>
                            <button
                                onClick={onCancel}
                                disabled={saving}
                                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={onSave}
                                disabled={saving || !hasChanges}
                                className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all ${hasChanges
                                        ? "bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/25"
                                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                                    }`}
                            >
                                {saving ? (
                                    <>
                                        <FiRefreshCw className="animate-spin" />
                                        جاري الحفظ...
                                    </>
                                ) : (
                                    <>
                                        <FiSave />
                                        حفظ
                                    </>
                                )}
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={onEdit}
                            className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
                        >
                            <FiEdit3 size={16} />
                            تعديل
                        </button>
                    )}
                </div>
            </div>
        </div>

        {/* Content */}
        <div className="p-6">
            {children}
        </div>
    </div>
);

// ════════════════════════════════════════════════════════════════════════════
// INPUT FIELD COMPONENT
// ════════════════════════════════════════════════════════════════════════════
const InputField = ({
    label,
    icon,
    value,
    onChange,
    disabled,
    type = "text",
    placeholder,
    dir = "ltr"
}: {
    label: string;
    icon: React.ReactNode;
    value: string;
    onChange: (value: string) => void;
    disabled: boolean;
    type?: string;
    placeholder?: string;
    dir?: "ltr" | "rtl";
}) => (
    <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            {icon}
            {label}
        </label>
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            placeholder={placeholder}
            dir={dir}
            className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${disabled
                    ? "bg-gray-50 border-gray-100 text-gray-600 cursor-not-allowed"
                    : "bg-white border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10"
                }`}
        />
    </div>
);

// ════════════════════════════════════════════════════════════════════════════
// SOCIAL MEDIA ICON MAPPING
// ════════════════════════════════════════════════════════════════════════════
const socialIcons: { [key: string]: { icon: React.ReactNode; label: string; color: string; placeholder: string } } = {
    youtube: {
        icon: <FaYoutube />,
        label: "يوتيوب",
        color: "text-red-600",
        placeholder: "https://youtube.com/channel/..."
    },
    twitter: {
        icon: <FaTwitter />,
        label: "تويتر / X",
        color: "text-sky-500",
        placeholder: "https://twitter.com/..."
    },
    facebook: {
        icon: <FaFacebook />,
        label: "فيسبوك",
        color: "text-blue-600",
        placeholder: "https://facebook.com/..."
    },
    snapchat: {
        icon: <FaSnapchat />,
        label: "سناب شات",
        color: "text-yellow-500",
        placeholder: "https://snapchat.com/..."
    },
    instagram: {
        icon: <FaInstagram />,
        label: "انستجرام",
        color: "text-pink-600",
        placeholder: "https://instagram.com/..."
    },
    tiktok: {
        icon: <FaTiktok />,
        label: "تيك توك",
        color: "text-gray-800",
        placeholder: "https://tiktok.com/..."
    }
};

// ════════════════════════════════════════════════════════════════════════════
// PHONE ICON MAPPING
// ════════════════════════════════════════════════════════════════════════════
const phoneIcons: { [key: string]: { icon: React.ReactNode; label: string; color: string } } = {
    support_phone: {
        icon: <FaHeadset />,
        label: "هاتف الدعم الفني",
        color: "text-green-600"
    },
    management_phone: {
        icon: <FaUserTie />,
        label: "هاتف الإدارة",
        color: "text-blue-600"
    },
    backup_phone: {
        icon: <FaPhoneVolume />,
        label: "هاتف احتياطي",
        color: "text-orange-500"
    }
};

// ════════════════════════════════════════════════════════════════════════════
// MAIN SETTINGS PAGE COMPONENT
// ════════════════════════════════════════════════════════════════════════════
export default function SettingsPage() {
    // State
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<SiteContactData | null>(null);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    // Edit states for each section
    const [editingSocial, setEditingSocial] = useState(false);
    const [editingPhones, setEditingPhones] = useState(false);
    const [editingBusiness, setEditingBusiness] = useState(false);

    // Saving states
    const [savingSocial, setSavingSocial] = useState(false);
    const [savingPhones, setSavingPhones] = useState(false);
    const [savingBusiness, setSavingBusiness] = useState(false);

    // Form data
    const [socialForm, setSocialForm] = useState<SocialMedia>({
        youtube: "",
        twitter: "",
        facebook: "",
        snapchat: "",
        instagram: "",
        tiktok: ""
    });

    const [phonesForm, setPhonesForm] = useState<PhoneNumbers>({
        support_phone: "",
        management_phone: "",
        backup_phone: ""
    });

    const [businessForm, setBusinessForm] = useState<BusinessDetails>({
        address: "",
        commercial_register: "",
        email: ""
    });

    // ═══════════════════════════════════════════════════════════════════════
    // DATA FETCHING
    // ═══════════════════════════════════════════════════════════════════════
    const fetchData = useCallback(async () => {
        try {
            const result = await SiteContactService.getAll();
            setData(result);
            // Initialize form states
            setSocialForm(result.social || {
                youtube: "",
                twitter: "",
                facebook: "",
                snapchat: "",
                instagram: "",
                tiktok: ""
            });
            setPhonesForm(result.phones || {
                support_phone: "",
                management_phone: "",
                backup_phone: ""
            });
            setBusinessForm(result.business_details || {
                address: "",
                commercial_register: "",
                email: ""
            });
        } catch (error) {
            console.error("Failed to fetch site contact data:", error);
            showToast("فشل في تحميل البيانات", "error");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // ═══════════════════════════════════════════════════════════════════════
    // TOAST HANDLER
    // ═══════════════════════════════════════════════════════════════════════
    const showToast = (message: string, type: "success" | "error") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    // ═══════════════════════════════════════════════════════════════════════
    // CHECK IF FORMS HAVE CHANGES
    // ═══════════════════════════════════════════════════════════════════════
    const hasSocialChanges = data ? JSON.stringify(socialForm) !== JSON.stringify(data.social) : false;
    const hasPhonesChanges = data ? JSON.stringify(phonesForm) !== JSON.stringify(data.phones) : false;
    const hasBusinessChanges = data ? JSON.stringify(businessForm) !== JSON.stringify(data.business_details) : false;

    // ═══════════════════════════════════════════════════════════════════════
    // SAVE HANDLERS
    // ═══════════════════════════════════════════════════════════════════════
    const handleSaveSocial = async () => {
        setSavingSocial(true);
        try {
            await SiteContactService.updateSocial(socialForm);
            showToast("تم حفظ روابط السوشيال ميديا بنجاح", "success");
            setEditingSocial(false);
            // Update local data
            if (data) {
                setData({ ...data, social: socialForm });
            }
        } catch (error: any) {
            showToast(error.message || "فشل في حفظ البيانات", "error");
        } finally {
            setSavingSocial(false);
        }
    };

    const handleSavePhones = async () => {
        setSavingPhones(true);
        try {
            await SiteContactService.updatePhones(phonesForm);
            showToast("تم حفظ أرقام الهواتف بنجاح", "success");
            setEditingPhones(false);
            if (data) {
                setData({ ...data, phones: phonesForm });
            }
        } catch (error: any) {
            showToast(error.message || "فشل في حفظ البيانات", "error");
        } finally {
            setSavingPhones(false);
        }
    };

    const handleSaveBusiness = async () => {
        setSavingBusiness(true);
        try {
            await SiteContactService.updateBusiness(businessForm);
            showToast("تم حفظ بيانات العمل بنجاح", "success");
            setEditingBusiness(false);
            if (data) {
                setData({ ...data, business_details: businessForm });
            }
        } catch (error: any) {
            showToast(error.message || "فشل في حفظ البيانات", "error");
        } finally {
            setSavingBusiness(false);
        }
    };

    // ═══════════════════════════════════════════════════════════════════════
    // CANCEL HANDLERS
    // ═══════════════════════════════════════════════════════════════════════
    const handleCancelSocial = () => {
        if (data) setSocialForm(data.social);
        setEditingSocial(false);
    };

    const handleCancelPhones = () => {
        if (data) setPhonesForm(data.phones);
        setEditingPhones(false);
    };

    const handleCancelBusiness = () => {
        if (data) setBusinessForm(data.business_details);
        setEditingBusiness(false);
    };

    // ═══════════════════════════════════════════════════════════════════════
    // LOADING STATE
    // ═══════════════════════════════════════════════════════════════════════
    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="relative">
                    <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary/20 border-t-primary"></div>
                    <FiSettings className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary text-xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-8">
            {/* ═══════════════════════════════════════════════════════════════
                TOAST NOTIFICATION
            ═══════════════════════════════════════════════════════════════ */}
            {toast && (
                <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-slideDown ${toast.type === "success" ? "bg-green-500" : "bg-red-500"
                    } text-white`}>
                    {toast.type === "success" ? <FiCheckCircle size={20} /> : <FiXCircle size={20} />}
                    <span className="font-medium">{toast.message}</span>
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                HERO SECTION
            ═══════════════════════════════════════════════════════════════ */}
            <section className="settings-hero relative overflow-hidden rounded-3xl p-8">
                {/* Background Effects */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10"></div>
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse-slow"></div>
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-secondary/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "1s" }}></div>

                {/* Grid Pattern */}
                <div className="absolute inset-0 opacity-30" style={{
                    backgroundImage: `
                        linear-gradient(rgba(56, 95, 88, 0.1) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(56, 95, 88, 0.1) 1px, transparent 1px)
                    `,
                    backgroundSize: "40px 40px"
                }}></div>

                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm shadow-sm mb-4">
                        <FiSettings className="text-primary" />
                        <span className="text-sm font-bold text-gray-700">لوحة الإعدادات</span>
                    </div>
                    <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-2">
                        إعدادات معلومات الشركة
                    </h1>
                    <p className="text-gray-600 max-w-lg">
                        إدارة معلومات التواصل وحسابات السوشيال ميديا وبيانات العمل الخاصة بالموقع.
                    </p>

                    {/* Quick Stats */}
                    <div className="flex flex-wrap gap-4 mt-6">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/70 backdrop-blur-sm">
                            <FiShare2 className="text-primary" />
                            <span className="text-sm font-medium text-gray-700">6 روابط سوشيال</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/70 backdrop-blur-sm">
                            <FiSmartphone className="text-secondary" />
                            <span className="text-sm font-medium text-gray-700">3 أرقام هواتف</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/70 backdrop-blur-sm">
                            <FiBriefcase className="text-primary" />
                            <span className="text-sm font-medium text-gray-700">بيانات العمل</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                SOCIAL MEDIA SECTION
            ═══════════════════════════════════════════════════════════════ */}
            <SectionCard
                title="روابط السوشيال ميديا"
                icon={<FiGlobe />}
                color="bg-primary"
                isEditing={editingSocial}
                onEdit={() => setEditingSocial(true)}
                onSave={handleSaveSocial}
                onCancel={handleCancelSocial}
                saving={savingSocial}
                hasChanges={hasSocialChanges}
            >
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {Object.entries(socialIcons).map(([key, config]) => (
                        <div key={key} className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                <span className={config.color}>{config.icon}</span>
                                {config.label}
                            </label>
                            <div className="relative">
                                <input
                                    type="url"
                                    value={socialForm[key as keyof SocialMedia] || ""}
                                    onChange={(e) => setSocialForm(prev => ({
                                        ...prev,
                                        [key]: e.target.value
                                    }))}
                                    disabled={!editingSocial}
                                    placeholder={config.placeholder}
                                    dir="ltr"
                                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all text-left ${!editingSocial
                                            ? "bg-gray-50 border-gray-100 text-gray-600 cursor-not-allowed"
                                            : "bg-white border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10"
                                        }`}
                                />
                                {socialForm[key as keyof SocialMedia] && !editingSocial && (
                                    <a
                                        href={socialForm[key as keyof SocialMedia]}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-primary hover:text-primary/80"
                                    >
                                        <FiGlobe size={18} />
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </SectionCard>

            {/* ═══════════════════════════════════════════════════════════════
                PHONE NUMBERS SECTION
            ═══════════════════════════════════════════════════════════════ */}
            <SectionCard
                title="أرقام الهواتف"
                icon={<FiPhone />}
                color="bg-secondary"
                isEditing={editingPhones}
                onEdit={() => setEditingPhones(true)}
                onSave={handleSavePhones}
                onCancel={handleCancelPhones}
                saving={savingPhones}
                hasChanges={hasPhonesChanges}
            >
                <div className="grid gap-6 md:grid-cols-3">
                    {Object.entries(phoneIcons).map(([key, config]) => (
                        <div key={key} className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                <span className={config.color}>{config.icon}</span>
                                {config.label}
                            </label>
                            <div className="relative">
                                <input
                                    type="tel"
                                    value={phonesForm[key as keyof PhoneNumbers] || ""}
                                    onChange={(e) => setPhonesForm(prev => ({
                                        ...prev,
                                        [key]: e.target.value
                                    }))}
                                    disabled={!editingPhones}
                                    placeholder="01xxxxxxxxx"
                                    dir="ltr"
                                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all text-left ${!editingPhones
                                            ? "bg-gray-50 border-gray-100 text-gray-600 cursor-not-allowed"
                                            : "bg-white border-gray-200 focus:border-secondary focus:ring-4 focus:ring-secondary/10"
                                        }`}
                                />
                                {phonesForm[key as keyof PhoneNumbers] && !editingPhones && (
                                    <a
                                        href={`tel:${phonesForm[key as keyof PhoneNumbers]}`}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary hover:text-secondary/80"
                                    >
                                        <FiPhone size={18} />
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Phone Preview Cards */}
                {!editingPhones && (phonesForm.support_phone || phonesForm.management_phone || phonesForm.backup_phone) && (
                    <div className="mt-6 pt-6 border-t border-gray-100">
                        <h3 className="text-sm font-medium text-gray-500 mb-4">معاينة سريعة</h3>
                        <div className="flex flex-wrap gap-3">
                            {phonesForm.support_phone && (
                                <a
                                    href={`tel:${phonesForm.support_phone}`}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
                                >
                                    <FaHeadset />
                                    <span className="font-medium" dir="ltr">{phonesForm.support_phone}</span>
                                </a>
                            )}
                            {phonesForm.management_phone && (
                                <a
                                    href={`tel:${phonesForm.management_phone}`}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                                >
                                    <FaUserTie />
                                    <span className="font-medium" dir="ltr">{phonesForm.management_phone}</span>
                                </a>
                            )}
                            {phonesForm.backup_phone && (
                                <a
                                    href={`tel:${phonesForm.backup_phone}`}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 text-orange-700 hover:bg-orange-100 transition-colors"
                                >
                                    <FaPhoneVolume />
                                    <span className="font-medium" dir="ltr">{phonesForm.backup_phone}</span>
                                </a>
                            )}
                        </div>
                    </div>
                )}
            </SectionCard>

            {/* ═══════════════════════════════════════════════════════════════
                BUSINESS DETAILS SECTION
            ═══════════════════════════════════════════════════════════════ */}
            <SectionCard
                title="بيانات العمل"
                icon={<FiBriefcase />}
                color="bg-primary"
                isEditing={editingBusiness}
                onEdit={() => setEditingBusiness(true)}
                onSave={handleSaveBusiness}
                onCancel={handleCancelBusiness}
                saving={savingBusiness}
                hasChanges={hasBusinessChanges}
            >
                <div className="grid gap-6 md:grid-cols-3">
                    {/* Address */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            <FiMapPin className="text-red-500" />
                            العنوان
                        </label>
                        <input
                            type="text"
                            value={businessForm.address || ""}
                            onChange={(e) => setBusinessForm(prev => ({
                                ...prev,
                                address: e.target.value
                            }))}
                            disabled={!editingBusiness}
                            placeholder="مثال: القاهرة - مصر"
                            className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${!editingBusiness
                                    ? "bg-gray-50 border-gray-100 text-gray-600 cursor-not-allowed"
                                    : "bg-white border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10"
                                }`}
                        />
                    </div>

                    {/* Commercial Register */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            <FiFileText className="text-purple-500" />
                            السجل التجاري
                        </label>
                        <input
                            type="text"
                            value={businessForm.commercial_register || ""}
                            onChange={(e) => setBusinessForm(prev => ({
                                ...prev,
                                commercial_register: e.target.value
                            }))}
                            disabled={!editingBusiness}
                            placeholder="رقم السجل التجاري"
                            dir="ltr"
                            className={`w-full px-4 py-3 rounded-xl border-2 transition-all text-left ${!editingBusiness
                                    ? "bg-gray-50 border-gray-100 text-gray-600 cursor-not-allowed"
                                    : "bg-white border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10"
                                }`}
                        />
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            <FiMail className="text-blue-500" />
                            البريد الإلكتروني
                        </label>
                        <div className="relative">
                            <input
                                type="email"
                                value={businessForm.email || ""}
                                onChange={(e) => setBusinessForm(prev => ({
                                    ...prev,
                                    email: e.target.value
                                }))}
                                disabled={!editingBusiness}
                                placeholder="info@example.com"
                                dir="ltr"
                                className={`w-full px-4 py-3 rounded-xl border-2 transition-all text-left ${!editingBusiness
                                        ? "bg-gray-50 border-gray-100 text-gray-600 cursor-not-allowed"
                                        : "bg-white border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10"
                                    }`}
                            />
                            {businessForm.email && !editingBusiness && (
                                <a
                                    href={`mailto:${businessForm.email}`}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-600"
                                >
                                    <FiMail size={18} />
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* Business Info Preview */}
                {!editingBusiness && (businessForm.address || businessForm.commercial_register || businessForm.email) && (
                    <div className="mt-6 pt-6 border-t border-gray-100">
                        <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl p-6">
                            <h3 className="text-sm font-medium text-gray-500 mb-4">ملخص البيانات</h3>
                            <div className="grid gap-4 md:grid-cols-3">
                                {businessForm.address && (
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                                            <FiMapPin className="text-red-500" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">العنوان</p>
                                            <p className="font-medium text-gray-800">{businessForm.address}</p>
                                        </div>
                                    </div>
                                )}
                                {businessForm.commercial_register && (
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                                            <FiFileText className="text-purple-500" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">السجل التجاري</p>
                                            <p className="font-medium text-gray-800" dir="ltr">{businessForm.commercial_register}</p>
                                        </div>
                                    </div>
                                )}
                                {businessForm.email && (
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                                            <FiMail className="text-blue-500" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">البريد الإلكتروني</p>
                                            <a href={`mailto:${businessForm.email}`} className="font-medium text-blue-600 hover:underline" dir="ltr">
                                                {businessForm.email}
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </SectionCard>
        </div>
    );
}
