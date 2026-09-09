"use client";
import React, { useEffect, useState, useCallback } from "react";
import {
    FiAlertOctagon,
    FiUser,
    FiMail,
    FiPhone,
    FiCalendar,
    FiPaperclip,
    FiTrash2,
    FiRefreshCw,
    FiChevronLeft,
    FiChevronRight,
    FiCheckCircle,
    FiXCircle,
    FiEye,
    FiX,
    FiDownload,
    FiInbox,
    FiMessageSquare,
    FiAlertTriangle
} from "react-icons/fi";
import { FeedbackService, FeedbackItem, PaginatedFeedback } from "../../services/feedbackService";

// ════════════════════════════════════════════════════════════════════════════
// STAT CARD
// ════════════════════════════════════════════════════════════════════════════
const StatCard = ({
    title,
    value,
    icon,
    color
}: {
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
}) => (
    <div className={`rounded-2xl p-6 ${color} bg-opacity-10 transition-all hover:bg-opacity-20`}>
        <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${color} bg-opacity-20 flex items-center justify-center`}>
                {icon}
            </div>
            <div>
                <p className="text-sm text-gray-600">{title}</p>
                <p className="text-2xl font-bold text-gray-800">{value}</p>
            </div>
        </div>
    </div>
);

// ════════════════════════════════════════════════════════════════════════════
// COMPLAINT CARD
// ════════════════════════════════════════════════════════════════════════════
const ComplaintCard = ({
    item,
    onView,
    onDelete,
    deleting
}: {
    item: FeedbackItem;
    onView: () => void;
    onDelete: () => void;
    deleting: boolean;
}) => (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-red-100 hover:shadow-md hover:border-red-200 transition-all">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                    <FiAlertTriangle className="text-red-500" />
                </div>
                <div>
                    <h3 className="font-medium text-gray-800">{item.name}</h3>
                    <p className="text-xs text-gray-500">{item.email}</p>
                </div>
            </div>
            <span className="text-xs text-gray-400">
                {new Date(item.created_at).toLocaleDateString("ar-SA", {
                    year: "numeric",
                    month: "short",
                    day: "numeric"
                })}
            </span>
        </div>

        {/* Message */}
        <p className="text-gray-600 text-sm line-clamp-3 mb-4">
            {item.message}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center gap-3 text-xs text-gray-500">
                {item.phone_number && (
                    <span className="flex items-center gap-1">
                        <FiPhone size={12} />
                        {item.phone_number}
                    </span>
                )}
                {item.attachment_path && (
                    <span className="flex items-center gap-1 text-red-500">
                        <FiPaperclip size={12} />
                        مرفق
                    </span>
                )}
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={onView}
                    className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                    title="عرض"
                >
                    <FiEye size={16} />
                </button>
                <button
                    onClick={onDelete}
                    disabled={deleting}
                    className="p-2 rounded-lg bg-gray-100 text-gray-500 hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50"
                    title="حذف"
                >
                    {deleting ? <FiRefreshCw className="animate-spin" size={16} /> : <FiTrash2 size={16} />}
                </button>
            </div>
        </div>
    </div>
);

// ════════════════════════════════════════════════════════════════════════════
// VIEW MODAL
// ════════════════════════════════════════════════════════════════════════════
const ViewModal = ({
    item,
    onClose
}: {
    item: FeedbackItem;
    onClose: () => void;
}) => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:8000";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 shadow-2xl animate-scaleIn max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                            <FiAlertOctagon className="text-red-500 text-xl" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">تفاصيل الشكوى</h2>
                            <p className="text-sm text-gray-500">#{item.id}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
                    >
                        <FiX size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="space-y-6">
                    {/* Sender Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50">
                            <FiUser className="text-gray-500" />
                            <div>
                                <p className="text-xs text-gray-500">الاسم</p>
                                <p className="font-medium text-gray-800">{item.name}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50">
                            <FiMail className="text-gray-500" />
                            <div>
                                <p className="text-xs text-gray-500">البريد الإلكتروني</p>
                                <p className="font-medium text-gray-800" dir="ltr">{item.email}</p>
                            </div>
                        </div>
                        {item.phone_number && (
                            <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50">
                                <FiPhone className="text-gray-500" />
                                <div>
                                    <p className="text-xs text-gray-500">الهاتف</p>
                                    <p className="font-medium text-gray-800" dir="ltr">{item.phone_number}</p>
                                </div>
                            </div>
                        )}
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50">
                            <FiCalendar className="text-gray-500" />
                            <div>
                                <p className="text-xs text-gray-500">تاريخ الإرسال</p>
                                <p className="font-medium text-gray-800">
                                    {new Date(item.created_at).toLocaleDateString("ar-SA", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit"
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Message */}
                    <div>
                        <h3 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                            <FiMessageSquare className="text-red-500" />
                            نص الشكوى
                        </h3>
                        <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-gray-700 whitespace-pre-wrap">
                            {item.message}
                        </div>
                    </div>

                    {/* Attachment */}
                    {item.attachment_path && (
                        <div>
                            <h3 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                                <FiPaperclip className="text-red-500" />
                                المرفق
                            </h3>
                            <a
                                href={`${API_URL}/storage/${item.attachment_path}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border-2 border-dashed border-red-200 hover:border-red-400 transition-colors"
                            >
                                <FiDownload className="text-red-500" />
                                <span className="text-red-600 font-medium">تحميل المرفق</span>
                            </a>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                    <button
                        onClick={onClose}
                        className="w-full py-3 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
                    >
                        إغلاق
                    </button>
                </div>
            </div>
        </div>
    );
};

// ════════════════════════════════════════════════════════════════════════════
// MAIN COMPLAINTS PAGE
// ════════════════════════════════════════════════════════════════════════════
export default function ComplaintsPage() {
    const [data, setData] = useState<PaginatedFeedback | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [viewItem, setViewItem] = useState<FeedbackItem | null>(null);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    const fetchData = useCallback(async (page: number) => {
        setLoading(true);
        try {
            const result = await FeedbackService.getComplaints(page);
            setData(result);
        } catch (error) {
            console.error("Failed to fetch complaints:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData(currentPage);
    }, [fetchData, currentPage]);

    const showToast = (message: string, type: "success" | "error") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleDelete = async (id: number) => {
        setDeletingId(id);
        try {
            await FeedbackService.delete(id);
            showToast("تم حذف الشكوى بنجاح", "success");
            fetchData(currentPage);
        } catch (error: any) {
            showToast(error.message || "فشل في حذف الشكوى", "error");
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="space-y-8 pb-8">
            {/* Toast */}
            {toast && (
                <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-slideDown ${toast.type === "success" ? "bg-green-500" : "bg-red-500"
                    } text-white`}>
                    {toast.type === "success" ? <FiCheckCircle size={20} /> : <FiXCircle size={20} />}
                    <span className="font-medium">{toast.message}</span>
                </div>
            )}

            {/* View Modal */}
            {viewItem && (
                <ViewModal item={viewItem} onClose={() => setViewItem(null)} />
            )}

            {/* ═══════════════════════════════════════════════════════════════
                HERO SECTION
            ═══════════════════════════════════════════════════════════════ */}
            <section className="settings-hero relative overflow-hidden rounded-3xl p-8">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-transparent to-orange-500/10"></div>
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-red-400/20 rounded-full blur-3xl animate-pulse-slow"></div>

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm shadow-sm mb-4">
                            <FiAlertOctagon className="text-red-500" />
                            <span className="text-sm font-bold text-gray-700">صندوق الشكاوي</span>
                        </div>
                        <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-2">
                            شكاوى المستفيدين
                        </h1>
                        <p className="text-gray-600 max-w-lg">
                            عرض وإدارة شكاوى المستخدمين والعمل على حلها بأسرع وقت.
                        </p>
                    </div>

                    <button
                        onClick={() => fetchData(currentPage)}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/80 backdrop-blur-sm text-gray-700 font-semibold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
                    >
                        <FiRefreshCw />
                        تحديث
                    </button>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                STATS
            ═══════════════════════════════════════════════════════════════ */}
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="إجمالي الشكاوي"
                    value={data?.total || 0}
                    icon={<FiAlertOctagon className="text-xl text-red-500" />}
                    color="bg-red-500"
                />
                <StatCard
                    title="هذه الصفحة"
                    value={data?.data.length || 0}
                    icon={<FiMessageSquare className="text-xl text-orange-500" />}
                    color="bg-orange-500"
                />
                <StatCard
                    title="الصفحة الحالية"
                    value={data?.current_page || 1}
                    icon={<FiChevronRight className="text-xl text-blue-500" />}
                    color="bg-blue-500"
                />
                <StatCard
                    title="إجمالي الصفحات"
                    value={data?.last_page || 1}
                    icon={<FiChevronLeft className="text-xl text-gray-500" />}
                    color="bg-gray-500"
                />
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                COMPLAINTS LIST
            ═══════════════════════════════════════════════════════════════ */}
            <section>
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="relative">
                            <div className="h-16 w-16 animate-spin rounded-full border-4 border-red-200 border-t-red-500"></div>
                            <FiAlertOctagon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-red-500 text-xl" />
                        </div>
                    </div>
                ) : data && data.data.length > 0 ? (
                    <>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {data.data.map(item => (
                                <ComplaintCard
                                    key={item.id}
                                    item={item}
                                    onView={() => setViewItem(item)}
                                    onDelete={() => handleDelete(item.id)}
                                    deleting={deletingId === item.id}
                                />
                            ))}
                        </div>

                        {/* Pagination */}
                        {data.last_page > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-8">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="p-3 rounded-xl bg-white shadow-sm border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <FiChevronRight />
                                </button>

                                {Array.from({ length: Math.min(5, data.last_page) }, (_, i) => {
                                    let pageNum = i + 1;
                                    if (data.last_page > 5 && currentPage > 3) {
                                        pageNum = currentPage - 2 + i;
                                        if (pageNum > data.last_page) pageNum = data.last_page - 4 + i;
                                    }
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setCurrentPage(pageNum)}
                                            className={`w-12 h-12 rounded-xl font-medium transition-colors ${currentPage === pageNum
                                                    ? "bg-red-500 text-white shadow-lg"
                                                    : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}

                                <button
                                    onClick={() => setCurrentPage(p => Math.min(data.last_page, p + 1))}
                                    disabled={currentPage === data.last_page}
                                    className="p-3 rounded-xl bg-white shadow-sm border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <FiChevronLeft />
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="bg-white rounded-2xl p-12 shadow-lg text-center">
                        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                            <FiCheckCircle className="text-4xl text-green-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-600 mb-2">لا توجد شكاوي</h3>
                        <p className="text-gray-400">ممتاز! لم يتم استلام أي شكاوى حتى الآن</p>
                    </div>
                )}
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                INFO CARD
            ═══════════════════════════════════════════════════════════════ */}
            <section className="bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl p-8 text-white shadow-lg">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <FiAlertTriangle />
                    إرشادات التعامل مع الشكاوى
                </h2>
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                        <h3 className="font-semibold mb-2">الاستجابة السريعة</h3>
                        <p className="text-sm text-white/80">
                            حاول الرد على الشكاوى في أقرب وقت ممكن
                        </p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                        <h3 className="font-semibold mb-2">التواصل المباشر</h3>
                        <p className="text-sm text-white/80">
                            استخدم بيانات الاتصال للتواصل مع صاحب الشكوى
                        </p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                        <h3 className="font-semibold mb-2">التوثيق</h3>
                        <p className="text-sm text-white/80">
                            احتفظ بسجل الإجراءات المتخذة لكل شكوى
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
