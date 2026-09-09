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

export default function InstitutionalRequestDetailsPage() {
    // ... hooks ...
    const router = useRouter();
    const params = useParams();
    const requestId = params.id as string;
    const toast = useToast();

    // ... state ...
    const [request, setRequest] = useState<SupportRequest | null>(null);
    const [loading, setLoading] = useState(true);

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
            const data = await SupportService.institutional.getById(requestId);
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
            await SupportService.institutional.updateStatus(parseInt(requestId), {
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
        id: "ID",
        request_number: "رقم الطلب",
        institution_name: "اسم المؤسسة",
        license_number: "رقم الترخيص",
        email: "البريد الإلكتروني",
        phone_number: "رقم الهاتف",
        ceo_name: "اسم المدير التنفيذي",
        ceo_mobile: "جوال المدير التنفيذي",
        whatsapp_number: "رقم الواتساب",
        city: "المدينة",
        activity_type: "نوع النشاط",
        activity_type_other: "نوع نشاط آخر",
        project_name: "اسم المشروع",
        project_type: "نوع المشروع",
        project_type_other: "نوع مشروع آخر",
        project_manager_name: "اسم مدير المشروع",
        project_manager_mobile: "جوال مدير المشروع",
        goal_1: "الهدف الأول",
        goal_2: "الهدف الثاني",
        goal_3: "الهدف الثالث",
        goal_4: "الهدف الرابع",
        other_goals: "أهداف أخرى",
        beneficiaries: "المستفيدين",
        beneficiaries_other: "مستفيدين آخرين",
        project_cost: "تكلفة المشروع",
        project_outputs: "مخرجات المشروع",
        support_scope: "نطاق الدعم",
        amount_requested: "المبلغ المطلوب",
        account_name: "اسم الحساب البنكي",
        bank_name: "اسم البنك",
        bank_account_iban: "IBAN",
        status: "حالة الطلب",
        rejection_reason: "سبب الرفض",
        admin_response_message: "رد الإدارة",
        created_at: "تاريخ التقديم",
        updated_at: "تاريخ التحديث"
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Print Header - Visible only in Print Mode */}
            <div className="print-header hidden print:flex flex-row justify-between items-center border-b pb-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold">تفاصيل طلب دعم مؤسسة</h1>
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
                            title={`تفاصيل طلب دعم مؤسسة - ${request.request_number}`}
                            fileName={`Institutional_Request_${request.request_number}`}
                        />
                    </div>
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Institution Information */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 transition hover:shadow-md">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">معلومات المؤسسة</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                                    <FiUser className="text-blue-600" size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">اسم المؤسسة</p>
                                    <p className="text-sm font-medium text-gray-900">{request.institution_name}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                                    <FiPhone className="text-green-600" size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">رقم الهاتف</p>
                                    <p className="text-sm font-medium text-gray-900 font-mono">{request.phone_number}</p>
                                </div>
                            </div>

                            {request.email && (
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                                        <FiMail className="text-purple-600" size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">البريد الإلكتروني</p>
                                        <p className="text-sm font-medium text-gray-900">{request.email}</p>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                                    <FiCalendar className="text-orange-600" size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">تاريخ التقديم</p>
                                    <p className="text-sm font-medium text-gray-900">
                                        {new Date(request.created_at).toLocaleDateString('ar-EG', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Admin Messages */}
                    {request.admin_response_message && (
                        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
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
                        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
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
                    {(request.closure_receipt_path || request.project_report_path || request.support_letter_response_path) && (
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

                                {request.support_letter_response_path && (
                                    <a
                                        href={getFileUrl(request.support_letter_response_path) || '#'}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <FiFileText className="text-gray-600" size={20} />
                                            <span className="text-sm font-medium text-gray-900">خطاب الدعم</span>
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
                                        في انتظار رفع المؤسسة للمستندات المطلوبة
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

            {/* Modals - Same as Individual */}
            {showDocumentsModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">طلب المستندات</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            اكتب رسالة توضيحية للمؤسسة توضح المستندات المطلوبة
                        </p>
                        <textarea
                            value={adminMessage}
                            onChange={(e) => setAdminMessage(e.target.value)}
                            placeholder="مثال: يرجى رفع سند القبض، تقرير المشروع، وخطاب الدعم..."
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
                                رسالة اختيارية للمؤسسة
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
