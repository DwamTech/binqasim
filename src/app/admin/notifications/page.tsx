"use client";
import React, { useEffect, useState, useCallback } from "react";
import {
    FiBell,
    FiCheck,
    FiCheckCircle,
    FiTrash2,
    FiX,
    FiAlertCircle,
    FiInfo,
    FiAlertTriangle,
    FiRefreshCw,
    FiChevronLeft,
    FiChevronRight,
    FiInbox,
    FiFilter,
    FiMail,
    FiXCircle
} from "react-icons/fi";
import {
    NotificationService,
    Notification,
    NotificationCount,
    PaginatedNotifications
} from "../services/notificationService";

// ════════════════════════════════════════════════════════════════════════════
// PRIORITY CONFIG
// ════════════════════════════════════════════════════════════════════════════
const priorityConfig = {
    high: {
        bg: "bg-red-50",
        border: "border-red-200",
        icon: <FiAlertCircle className="text-red-500" />,
        dot: "bg-red-500",
        label: "عالي",
        color: "text-red-600"
    },
    medium: {
        bg: "bg-yellow-50",
        border: "border-yellow-200",
        icon: <FiAlertTriangle className="text-yellow-500" />,
        dot: "bg-yellow-500",
        label: "متوسط",
        color: "text-yellow-600"
    },
    low: {
        bg: "bg-blue-50",
        border: "border-blue-200",
        icon: <FiInfo className="text-blue-500" />,
        dot: "bg-blue-500",
        label: "منخفض",
        color: "text-blue-600"
    }
};

// ════════════════════════════════════════════════════════════════════════════
// CATEGORY LABELS
// ════════════════════════════════════════════════════════════════════════════
const categoryLabels: Record<string, string> = {
    support: "طلبات الدعم",
    system: "النظام",
    users: "المستخدمين",
    content: "المحتوى",
    engagement: "التفاعل",
    library: "المكتبة"
};

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
// RELATIVE TIME FORMATTER
// ════════════════════════════════════════════════════════════════════════════
const getRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "الآن";
    if (diffInSeconds < 3600) return `منذ ${Math.floor(diffInSeconds / 60)} دقيقة`;
    if (diffInSeconds < 86400) return `منذ ${Math.floor(diffInSeconds / 3600)} ساعة`;
    if (diffInSeconds < 604800) return `منذ ${Math.floor(diffInSeconds / 86400)} يوم`;
    return date.toLocaleDateString("ar-SA");
};

// ════════════════════════════════════════════════════════════════════════════
// MAIN NOTIFICATIONS PAGE
// ════════════════════════════════════════════════════════════════════════════
export default function NotificationsPage() {
    const [data, setData] = useState<PaginatedNotifications | null>(null);
    const [count, setCount] = useState<NotificationCount | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [actionLoading, setActionLoading] = useState<number | string | null>(null);
    const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    const showToast = (message: string, type: "success" | "error") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchData = useCallback(async (page: number) => {
        setLoading(true);
        try {
            const params: { page: number; is_read?: boolean } = { page };
            if (filter === "unread") params.is_read = false;
            if (filter === "read") params.is_read = true;

            const result = await NotificationService.getAll(params);
            setData(result);
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        } finally {
            setLoading(false);
        }
    }, [filter]);

    const fetchCount = useCallback(async () => {
        try {
            const result = await NotificationService.getCount();
            setCount(result);
        } catch (error) {
            console.error("Failed to fetch count:", error);
        }
    }, []);

    useEffect(() => {
        fetchData(currentPage);
        fetchCount();
    }, [fetchData, fetchCount, currentPage]);

    // Reset page when filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [filter]);

    const handleMarkAsRead = async (id: number) => {
        setActionLoading(id);
        try {
            await NotificationService.markAsRead(id);
            showToast("تم تحديد الإشعار كمقروء", "success");
            fetchData(currentPage);
            fetchCount();
        } catch (error: any) {
            showToast(error.message || "فشل في تحديد الإشعار", "error");
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (id: number) => {
        setActionLoading(id);
        try {
            await NotificationService.delete(id);
            showToast("تم حذف الإشعار بنجاح", "success");
            fetchData(currentPage);
            fetchCount();
        } catch (error: any) {
            showToast(error.message || "فشل في حذف الإشعار", "error");
        } finally {
            setActionLoading(null);
        }
    };

    const handleMarkAllAsRead = async () => {
        setActionLoading("all");
        try {
            await NotificationService.markAllAsRead();
            showToast("تم تحديد الكل كمقروء", "success");
            fetchData(currentPage);
            fetchCount();
        } catch (error: any) {
            showToast(error.message || "فشل في التحديث", "error");
        } finally {
            setActionLoading(null);
        }
    };

    const handleClearRead = async () => {
        setActionLoading("clear");
        try {
            await NotificationService.clearRead();
            showToast("تم حذف الإشعارات المقروءة", "success");
            fetchData(currentPage);
            fetchCount();
        } catch (error: any) {
            showToast(error.message || "فشل في الحذف", "error");
        } finally {
            setActionLoading(null);
        }
    };

    const notifications = data?.data || [];

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

            {/* ═══════════════════════════════════════════════════════════════
                HERO SECTION
            ═══════════════════════════════════════════════════════════════ */}
            <section className="settings-hero relative overflow-hidden rounded-3xl p-8">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-yellow-500/10"></div>
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse-slow"></div>

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm shadow-sm mb-4">
                            <FiBell className="text-primary" />
                            <span className="text-sm font-bold text-gray-700">مركز الإشعارات</span>
                        </div>
                        <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-2">
                            جميع الإشعارات
                        </h1>
                        <p className="text-gray-600 max-w-lg">
                            عرض وإدارة جميع الإشعارات الواردة للنظام.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleMarkAllAsRead}
                            disabled={actionLoading === "all" || (count?.unread || 0) === 0}
                            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/80 backdrop-blur-sm text-gray-700 font-semibold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {actionLoading === "all" ? <FiRefreshCw className="animate-spin" /> : <FiCheckCircle />}
                            قراءة الكل
                        </button>
                        <button
                            onClick={handleClearRead}
                            disabled={actionLoading === "clear" || (count?.read || 0) === 0}
                            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-red-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {actionLoading === "clear" ? <FiRefreshCw className="animate-spin" /> : <FiTrash2 />}
                            حذف المقروءة
                        </button>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                STATS
            ═══════════════════════════════════════════════════════════════ */}
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="إجمالي الإشعارات"
                    value={count?.total || 0}
                    icon={<FiBell className="text-xl text-primary" />}
                    color="bg-primary"
                />
                <StatCard
                    title="غير مقروءة"
                    value={count?.unread || 0}
                    icon={<FiMail className="text-xl text-red-500" />}
                    color="bg-red-500"
                />
                <StatCard
                    title="مقروءة"
                    value={count?.read || 0}
                    icon={<FiCheckCircle className="text-xl text-green-500" />}
                    color="bg-green-500"
                />
                <StatCard
                    title="عالية الأولوية"
                    value={count?.high_priority_unread || 0}
                    icon={<FiAlertCircle className="text-xl text-orange-500" />}
                    color="bg-orange-500"
                />
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                FILTER TABS
            ═══════════════════════════════════════════════════════════════ */}
            <section className="bg-white rounded-2xl p-2 shadow-sm inline-flex gap-2">
                <button
                    onClick={() => setFilter("all")}
                    className={`px-6 py-2.5 rounded-xl font-medium transition-all ${filter === "all"
                            ? "bg-primary text-white shadow-md"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                >
                    <FiFilter className="inline-block ml-2" />
                    الكل
                </button>
                <button
                    onClick={() => setFilter("unread")}
                    className={`px-6 py-2.5 rounded-xl font-medium transition-all ${filter === "unread"
                            ? "bg-red-500 text-white shadow-md"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                >
                    <FiMail className="inline-block ml-2" />
                    غير مقروءة
                </button>
                <button
                    onClick={() => setFilter("read")}
                    className={`px-6 py-2.5 rounded-xl font-medium transition-all ${filter === "read"
                            ? "bg-green-500 text-white shadow-md"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                >
                    <FiCheckCircle className="inline-block ml-2" />
                    مقروءة
                </button>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                NOTIFICATIONS LIST
            ═══════════════════════════════════════════════════════════════ */}
            <section>
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="relative">
                            <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary/20 border-t-primary"></div>
                            <FiBell className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary text-xl" />
                        </div>
                    </div>
                ) : notifications.length > 0 ? (
                    <>
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden divide-y divide-gray-100">
                            {notifications.map((notification) => {
                                const config = priorityConfig[notification.priority] || priorityConfig.low;
                                return (
                                    <div
                                        key={notification.id}
                                        className={`p-5 transition-all hover:bg-gray-50 ${!notification.is_read ? config.bg : ""
                                            }`}
                                    >
                                        <div className="flex items-start gap-4">
                                            {/* Priority Icon */}
                                            <div className={`flex-shrink-0 w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center`}>
                                                {config.icon}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div>
                                                        <h3 className={`font-semibold ${notification.is_read ? "text-gray-600" : "text-gray-800"
                                                            }`}>
                                                            {notification.title}
                                                        </h3>
                                                        <p className={`text-sm mt-1 ${notification.is_read ? "text-gray-400" : "text-gray-600"
                                                            }`}>
                                                            {notification.message}
                                                        </p>
                                                    </div>
                                                    <span className="text-xs text-gray-400 flex-shrink-0">
                                                        {getRelativeTime(notification.created_at)}
                                                    </span>
                                                </div>

                                                {/* Meta & Actions */}
                                                <div className="flex items-center justify-between mt-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-500">
                                                            {categoryLabels[notification.category] || notification.category}
                                                        </span>
                                                        <span className={`text-xs px-2 py-1 rounded-full ${config.bg} ${config.color}`}>
                                                            {config.label}
                                                        </span>
                                                        {!notification.is_read && (
                                                            <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-600">
                                                                جديد
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        {!notification.is_read && (
                                                            <button
                                                                onClick={() => handleMarkAsRead(notification.id)}
                                                                disabled={actionLoading === notification.id}
                                                                className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors disabled:opacity-50"
                                                                title="تحديد كمقروء"
                                                            >
                                                                {actionLoading === notification.id ? (
                                                                    <FiRefreshCw className="animate-spin" size={16} />
                                                                ) : (
                                                                    <FiCheck size={16} />
                                                                )}
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleDelete(notification.id)}
                                                            disabled={actionLoading === notification.id}
                                                            className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50"
                                                            title="حذف"
                                                        >
                                                            <FiTrash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Pagination */}
                        {data && data.last_page > 1 && (
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
                                                    ? "bg-primary text-white shadow-lg"
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
                        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                            <FiInbox className="text-4xl text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-600 mb-2">لا توجد إشعارات</h3>
                        <p className="text-gray-400">
                            {filter === "unread" ? "لا توجد إشعارات غير مقروءة" :
                                filter === "read" ? "لا توجد إشعارات مقروءة" :
                                    "لم يتم استلام أي إشعارات حتى الآن"}
                        </p>
                    </div>
                )}
            </section>
        </div>
    );
}
