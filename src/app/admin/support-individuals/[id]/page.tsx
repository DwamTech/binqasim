"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { SupportService, SupportRequest, RequestStatus } from "@/app/admin/services/supportService";
import StatusBadge from "@/components/admin/StatusBadge";
import {
    FiArrowRight, FiUser, FiPhone, FiMail, FiCalendar,
    FiFileText, FiDownload, FiCheckCircle, FiXCircle,
    FiClock, FiAlertCircle, FiSend
} from "react-icons/fi";
import { useToast } from "@/components/admin/ToastProvider";
import ExportActions from "@/components/admin/ExportActions";

export default function IndividualRequestDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const requestId = params.id as string;
    const toast = useToast();

    const [request, setRequest] = useState<SupportRequest | null>(null);
    const [loading, setLoading] = useState(true);

    // Action Modals
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showDocumentsModal, setShowDocumentsModal] = useState(false);

    const [actionLoading, setActionLoading] = useState(false);
    const [adminMessage, setAdminMessage] = useState("");
    const [rejectionReason, setRejectionReason] = useState("");

    useEffect(() => {
        fetchRequestDetails();
    }, [requestId]);

    const fetchRequestDetails = async () => {
        setLoading(true);
        try {
            const data = await SupportService.individual.getById(requestId);
            setRequest(data);
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || "فشل تحميل تفاصيل الطلب");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (status: RequestStatus, message?: string, reason?: string) => {
        setActionLoading(true);
        try {
            await SupportService.individual.updateStatus(parseInt(requestId), {
                status,
                admin_response_message: message,
                rejection_reason: reason
            });

            toast.success("تم تحديث حالة الطلب بنجاح");
            fetchRequestDetails();
            setShowApproveModal(false);
            setShowRejectModal(false);
            setShowDocumentsModal(false);
            setAdminMessage("");
            setRejectionReason("");
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || "فشل تحديث الحالة");
        } finally {
            setActionLoading(false);
        }
    };

    const getFileUrl = (path?: string) => {
        if (!path) return null;
        const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
        const baseUrl = apiBase.replace('/api', '');
        return `${baseUrl}/storage/${path}`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">جاري التحميل...</p>
                </div>
            </div>
        );
    }

    if (!request) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-600">الطلب غير موجود</p>
            </div>
        );
    }

    const exportFields = {
        request_number: "رقم الطلب",
        full_name: "الاسم الكامل",
        id_number: "رقم الهوية",
        phone_number: "رقم الهاتف",
        email: "البريد الإلكتروني",
        address: "العنوان",
        marital_status: "الحالة الاجتماعية",
        housing_status: "حالة السكن",
        job_title: "المسمى الوظيفي",
        monthly_income: "الدخل الشهري",
        family_members: "عدد أفراد الأسرة",
        support_type: "نوع الدعم",
        status: "حالة الطلب",
        created_at: "تاريخ الطلب",
        description: "وصف الحالة"
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Print Header - Visible only in Print Mode */}
            <div className="print-header hidden print:flex flex-row justify-between items-center border-b pb-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold">تفاصيل طلب دعم أفراد</h1>
                    <p className="text-gray-600 mt-1">رقم الطلب: {request.request_number}</p>
                </div>
                <div className="text-left">
                    <h2 className="text-xl font-bold text-primary">وقف الصالح</h2>
                    <p className="text-sm text-gray-500">{new Date().toLocaleDateString('ar-EG')}</p>
                </div>
            </div>

            {/* Header */}
            <section className="animated-hero relative overflow-hidden rounded-2xl p-6 md:p-8 no-print">
                <div className="absolute inset-0 pointer-events-none hero-grid"></div>
                <span className="hero-blob hero-blob-1"></span>
                <span className="hero-blob hero-blob-2"></span>
                <span className="hero-dot hero-dot-1"></span>
                <span className="hero-dot hero-dot-2"></span>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.back()}
                            className="p-2 bg-white/70 hover:bg-white rounded-full transition-colors text-gray-600 backdrop-blur-md shadow-sm"
                            title="رجوع"
                        >
                            <FiArrowRight size={20} />
                        </button>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">
                                    تفاصيل الطلب #{request.request_number}
                                </h1>
                                <StatusBadge status={request.status} />
                            </div>
                            <p className="text-gray-700 text-sm mt-1">
                                تاريخ التقديم: {new Date(request.created_at).toLocaleDateString('ar-EG')}
                            </p>
                        </div>
                    </div>

                    <div className="flex-shrink-0">
                        <ExportActions
                            data={request}
                            fieldMapping={exportFields}
                            title={`تفاصيل طلب دعم أفراد - ${request.request_number}`}
                            fileName={`Individual_Request_${request.request_number}`}
                        />
                    </div>
                </div>
            </section>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Personal Information */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 transition hover:shadow-md">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-3">👤 المعلومات الشخصية</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                                    <FiUser className="text-blue-600" size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">الاسم الكامل</p>
                                    <p className="text-sm font-medium text-gray-900">{request.full_name}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-pink-50 flex items-center justify-center">
                                    <span className="text-pink-600">👤</span>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">الجنس</p>
                                    <p className="text-sm font-medium text-gray-900">
                                        {request.gender === 'male' ? 'ذكر' : request.gender === 'female' ? 'أنثى' : request.gender || '-'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                                    <span className="text-indigo-600">🌍</span>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">الجنسية</p>
                                    <p className="text-sm font-medium text-gray-900">{request.nationality || '-'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-cyan-50 flex items-center justify-center">
                                    <span className="text-cyan-600">🏙️</span>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">المدينة</p>
                                    <p className="text-sm font-medium text-gray-900">{request.city || '-'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                                    <span className="text-amber-600">🏠</span>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">نوع السكن</p>
                                    <p className="text-sm font-medium text-gray-900">
                                        {request.housing_type_other || request.housing_type || '-'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center">
                                    <FiCalendar className="text-rose-600" size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">تاريخ الميلاد</p>
                                    <p className="text-sm font-medium text-gray-900">
                                        {request.birth_date ? new Date(request.birth_date).toLocaleDateString('ar-EG') : '-'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                                    <span className="text-red-600">📅</span>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">تاريخ انتهاء الهوية</p>
                                    <p className="text-sm font-medium text-gray-900">
                                        {request.identity_expiry_date ? new Date(request.identity_expiry_date).toLocaleDateString('ar-EG') : '-'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                                    <span className="text-purple-600">💍</span>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">الحالة الاجتماعية</p>
                                    <p className="text-sm font-medium text-gray-900">
                                        {request.marital_status === 'single' ? 'أعزب' : request.marital_status === 'married' ? 'متزوج' : request.marital_status || '-'}
                                    </p>
                                </div>
                            </div>

                            {request.family_members_count && (
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center">
                                        <span className="text-teal-600">👨‍👩‍👧‍👦</span>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">عدد أفراد الأسرة</p>
                                        <p className="text-sm font-medium text-gray-900">{request.family_members_count}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 transition hover:shadow-md">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-3">📞 معلومات التواصل</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                                    <FiPhone className="text-green-600" size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">رقم الهاتف</p>
                                    <p className="text-sm font-medium text-gray-900 font-mono">{request.phone_number}</p>
                                </div>
                            </div>

                            {request.whatsapp_number && (
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                                        <span className="text-emerald-600">📱</span>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">رقم الواتساب</p>
                                        <p className="text-sm font-medium text-gray-900 font-mono">{request.whatsapp_number}</p>
                                    </div>
                                </div>
                            )}

                            {request.email && (
                                <div className="flex items-center gap-3 md:col-span-2">
                                    <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                                        <FiMail className="text-purple-600" size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">البريد الإلكتروني</p>
                                        <p className="text-sm font-medium text-gray-900">{request.email}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Qualifications & Work */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 transition hover:shadow-md">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-3">🎓 المؤهلات والعمل</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                                    <span className="text-blue-600">📚</span>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">النشاط العلمي</p>
                                    <p className="text-sm font-medium text-gray-900">
                                        {request.scientific_activity_other || request.scientific_activity || '-'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                                    <span className="text-orange-600">💼</span>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">مكان العمل</p>
                                    <p className="text-sm font-medium text-gray-900">{request.workplace || '-'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-lime-50 flex items-center justify-center">
                                    <span className="text-lime-600">💰</span>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">هل يوجد دخل؟</p>
                                    <p className="text-sm font-medium text-gray-900">
                                        {request.has_income ? 'نعم' : 'لا'}
                                    </p>
                                </div>
                            </div>

                            {request.income_source && (
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-yellow-50 flex items-center justify-center">
                                        <span className="text-yellow-600">📊</span>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">مصدر الدخل</p>
                                        <p className="text-sm font-medium text-gray-900">{request.income_source}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Support Details */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 transition hover:shadow-md">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-3">🎯 تفاصيل الدعم</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center">
                                    <span className="text-violet-600">📋</span>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">نطاق الدعم</p>
                                    <p className="text-sm font-medium text-gray-900">
                                        {request.support_scope === 'full' ? 'دعم كامل' : request.support_scope === 'partial' ? 'دعم جزئي' : request.support_scope || '-'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-fuchsia-50 flex items-center justify-center">
                                    <span className="text-fuchsia-600">📌</span>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">نوع الدعم</p>
                                    <p className="text-sm font-medium text-gray-900">
                                        {request.support_type_other || request.support_type || '-'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 md:col-span-2">
                                <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                                    <span className="text-emerald-600">💵</span>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">المبلغ المطلوب</p>
                                    <p className="text-lg font-bold text-emerald-600">
                                        {request.amount_requested ? `${parseFloat(request.amount_requested).toLocaleString('ar-SA')} ريال` : '-'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bank Information */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 transition hover:shadow-md">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-3">🏦 المعلومات البنكية</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-sky-50 flex items-center justify-center">
                                    <span className="text-sky-600">🏦</span>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">اسم البنك</p>
                                    <p className="text-sm font-medium text-gray-900">{request.bank_name || '-'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center">
                                    <span className="text-slate-600">💳</span>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">رقم الآيبان</p>
                                    <p className="text-sm font-medium text-gray-900 font-mono break-all">{request.bank_account_iban || '-'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Documents */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 transition hover:shadow-md">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-3">📂 المرفقات والوثائق</h2>
                        <div className="space-y-3">
                            {request.identity_image_path && (
                                <a
                                    href={getFileUrl(request.identity_image_path) || '#'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <FiFileText className="text-gray-600" size={20} />
                                        <span className="text-sm font-medium text-gray-900">صورة الهوية</span>
                                    </div>
                                    <FiDownload className="text-gray-400 group-hover:text-primary" size={20} />
                                </a>
                            )}

                            {request.academic_qualification_path && (
                                <a
                                    href={getFileUrl(request.academic_qualification_path) || '#'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <FiFileText className="text-gray-600" size={20} />
                                        <span className="text-sm font-medium text-gray-900">المؤهل الأكاديمي</span>
                                    </div>
                                    <FiDownload className="text-gray-400 group-hover:text-primary" size={20} />
                                </a>
                            )}

                            {request.cv_path && (
                                <a
                                    href={getFileUrl(request.cv_path) || '#'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <FiFileText className="text-gray-600" size={20} />
                                        <span className="text-sm font-medium text-gray-900">السيرة الذاتية</span>
                                    </div>
                                    <FiDownload className="text-gray-400 group-hover:text-primary" size={20} />
                                </a>
                            )}

                            {request.recommendation_path && (
                                <a
                                    href={getFileUrl(request.recommendation_path) || '#'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <FiFileText className="text-gray-600" size={20} />
                                        <span className="text-sm font-medium text-gray-900">التوصيات</span>
                                    </div>
                                    <FiDownload className="text-gray-400 group-hover:text-primary" size={20} />
                                </a>
                            )}

                            {request.closure_receipt_path && (
                                <a
                                    href={getFileUrl(request.closure_receipt_path) || '#'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <FiFileText className="text-green-600" size={20} />
                                        <span className="text-sm font-medium text-green-900">إيصال الإغلاق</span>
                                    </div>
                                    <FiDownload className="text-green-400 group-hover:text-green-600" size={20} />
                                </a>
                            )}

                            {request.project_report_path && (
                                <a
                                    href={getFileUrl(request.project_report_path) || '#'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <FiFileText className="text-blue-600" size={20} />
                                        <span className="text-sm font-medium text-blue-900">تقرير المشروع</span>
                                    </div>
                                    <FiDownload className="text-blue-400 group-hover:text-blue-600" size={20} />
                                </a>
                            )}

                            {!request.identity_image_path && !request.academic_qualification_path && !request.cv_path && !request.recommendation_path && !request.closure_receipt_path && !request.project_report_path && (
                                <p className="text-gray-500 text-sm text-center py-4">لا توجد مرفقات</p>
                            )}
                        </div>
                    </div>

                    {/* Submission Info */}
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border border-gray-200 p-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
                                <FiCalendar className="text-gray-600" size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">تاريخ التقديم</p>
                                <p className="text-sm font-medium text-gray-900">
                                    {new Date(request.created_at).toLocaleDateString('ar-EG', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Admin Messages */}
                    {request.admin_response_message && (
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                            <div className="flex items-start gap-3">
                                <FiSend className="text-blue-600 mt-1" size={20} />
                                <div>
                                    <h3 className="font-semibold text-blue-900 mb-2">رسالة الإدارة</h3>
                                    <p className="text-blue-800 text-sm leading-relaxed">{request.admin_response_message}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {request.rejection_reason && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                            <div className="flex items-start gap-3">
                                <FiAlertCircle className="text-red-600 mt-1" size={20} />
                                <div>
                                    <h3 className="font-semibold text-red-900 mb-2">سبب الرفض</h3>
                                    <p className="text-red-800 text-sm leading-relaxed">{request.rejection_reason}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Uploaded Documents */}
                    {(request.closure_receipt_path || request.project_report_path) && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 transition hover:shadow-md">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">المرفقات المقدمة</h2>
                            <div className="space-y-3">
                                {request.closure_receipt_path && (
                                    <a
                                        href={getFileUrl(request.closure_receipt_path) || '#'}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <FiFileText className="text-gray-600" size={20} />
                                            <span className="text-sm font-medium text-gray-900">سند القبض</span>
                                        </div>
                                        <FiDownload className="text-gray-400 group-hover:text-primary" size={20} />
                                    </a>
                                )}

                                {request.project_report_path && (
                                    <a
                                        href={getFileUrl(request.project_report_path) || '#'}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <FiFileText className="text-gray-600" size={20} />
                                            <span className="text-sm font-medium text-gray-900">تقرير المشروع</span>
                                        </div>
                                        <FiDownload className="text-gray-400 group-hover:text-primary" size={20} />
                                    </a>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Actions Sidebar */}
                <div className="space-y-4">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-3 transition hover:shadow-md">
                        <h3 className="font-semibold text-gray-800 mb-4">الإجراءات</h3>

                        {request.status === 'pending' && (
                            <>
                                <button
                                    onClick={() => setShowDocumentsModal(true)}
                                    className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    <FiClock size={18} />
                                    طلب مستندات
                                </button>
                                <button
                                    onClick={() => setShowApproveModal(true)}
                                    className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    <FiCheckCircle size={18} />
                                    الموافقة والإكمال
                                </button>
                                <button
                                    onClick={() => setShowRejectModal(true)}
                                    className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    <FiXCircle size={18} />
                                    رفض الطلب
                                </button>
                                <button
                                    onClick={() => handleUpdateStatus('archived')}
                                    disabled={actionLoading}
                                    className="w-full px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    <FiClock size={18} />
                                    {actionLoading ? "جاري الأرشفة..." : "أرشفة الطلب"}
                                </button>
                            </>
                        )}

                        {request.status === 'waiting_for_documents' && (
                            <>
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-3">
                                    <p className="text-sm text-blue-800">
                                        في انتظار رفع العميل للمستندات المطلوبة
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowApproveModal(true)}
                                    className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    <FiCheckCircle size={18} />
                                    الموافقة والإكمال
                                </button>
                                <button
                                    onClick={() => setShowRejectModal(true)}
                                    className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    <FiXCircle size={18} />
                                    رفض الطلب
                                </button>
                                <button
                                    onClick={() => handleUpdateStatus('archived')}
                                    disabled={actionLoading}
                                    className="w-full px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    <FiClock size={18} />
                                    {actionLoading ? "جاري الأرشفة..." : "أرشفة الطلب"}
                                </button>
                            </>
                        )}

                        {request.status === 'documents_review' && (
                            <>
                                <button
                                    onClick={() => setShowApproveModal(true)}
                                    className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    <FiCheckCircle size={18} />
                                    الموافقة والإكمال
                                </button>
                                <button
                                    onClick={() => setShowRejectModal(true)}
                                    className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    <FiXCircle size={18} />
                                    رفض الطلب
                                </button>
                                <button
                                    onClick={() => handleUpdateStatus('archived')}
                                    disabled={actionLoading}
                                    className="w-full px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    <FiClock size={18} />
                                    {actionLoading ? "جاري الأرشفة..." : "أرشفة الطلب"}
                                </button>
                            </>
                        )}

                        {(request.status === 'completed' || request.status === 'rejected') && (
                            <>
                                <div className={`${request.status === 'completed' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                                    } border rounded-lg p-4 mb-3`}>
                                    <p className={`text-sm ${request.status === 'completed' ? 'text-green-800' : 'text-red-800'}`}>
                                        {request.status === 'completed' ? 'تم إكمال الطلب بنجاح' : 'تم رفض الطلب'}
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleUpdateStatus('archived')}
                                    disabled={actionLoading}
                                    className="w-full px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    <FiClock size={18} />
                                    {actionLoading ? "جاري الأرشفة..." : "أرشفة الطلب"}
                                </button>
                            </>
                        )}

                        {request.status === 'archived' && (
                            <>
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-3">
                                    <p className="text-sm text-gray-800">
                                        هذا الطلب مؤرشف
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleUpdateStatus('pending')}
                                    disabled={actionLoading}
                                    className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    <FiClock size={18} />
                                    {actionLoading ? "جاري الاستعادة..." : "استعادة للمراجعة"}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Request Documents Modal */}
            {showDocumentsModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">طلب المستندات</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            اكتب رسالة توضيحية للعميل توضح المستندات المطلوبة
                        </p>
                        <textarea
                            value={adminMessage}
                            onChange={(e) => setAdminMessage(e.target.value)}
                            placeholder="مثال: يرجى رفع سند القبض وتقرير المشروع..."
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none mb-4"
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDocumentsModal(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={() => handleUpdateStatus('waiting_for_documents', undefined, adminMessage)}
                                disabled={!adminMessage.trim() || actionLoading}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                {actionLoading ? "جاري الإرسال..." : "إرسال"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Approve Modal */}
            {showApproveModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4 mx-auto">
                            <FiCheckCircle className="text-green-600" size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">الموافقة على الطلب</h3>
                        <p className="text-sm text-gray-600 mb-4 text-center">
                            هل أنت متأكد من الموافقة وإكمال هذا الطلب؟
                        </p>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                رسالة اختيارية للعميل
                            </label>
                            <textarea
                                value={adminMessage}
                                onChange={(e) => setAdminMessage(e.target.value)}
                                placeholder="مثال: تم تحويل المبلغ بنجاح، شكراً لكم..."
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none text-sm"
                            />
                            <p className="text-xs text-gray-500 mt-1">يمكنك ترك هذا الحقل فارغاً</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowApproveModal(false);
                                    setAdminMessage("");
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={() => handleUpdateStatus('completed', adminMessage || undefined)}
                                disabled={actionLoading}
                                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                            >
                                {actionLoading ? "جاري الموافقة..." : "تأكيد الموافقة"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4 mx-auto">
                            <FiXCircle className="text-red-600" size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">رفض الطلب</h3>
                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="اكتب سبب الرفض..."
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none mb-4"
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowRejectModal(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={() => handleUpdateStatus('rejected', undefined, rejectionReason)}
                                disabled={!rejectionReason.trim() || actionLoading}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                            >
                                {actionLoading ? "جاري الرفض..." : "تأكيد الرفض"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
