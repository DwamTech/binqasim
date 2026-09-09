"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
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
    FiExternalLink,
    FiInbox
} from "react-icons/fi";
import {
    NotificationService,
    Notification,
    NotificationCount
} from "../../app/admin/services/notificationService";

// ════════════════════════════════════════════════════════════════════════════
// PRIORITY CONFIG
// ════════════════════════════════════════════════════════════════════════════
const priorityConfig = {
    high: {
        bg: "bg-red-50",
        border: "border-red-200",
        icon: <FiAlertCircle className="text-red-500" />,
        dot: "bg-red-500"
    },
    medium: {
        bg: "bg-yellow-50",
        border: "border-yellow-200",
        icon: <FiAlertTriangle className="text-yellow-500" />,
        dot: "bg-yellow-500"
    },
    low: {
        bg: "bg-blue-50",
        border: "border-blue-200",
        icon: <FiInfo className="text-blue-500" />,
        dot: "bg-blue-500"
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
// NOTIFICATION DROPDOWN COMPONENT
// ════════════════════════════════════════════════════════════════════════════
export default function NotificationDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [count, setCount] = useState<NotificationCount | null>(null);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState<number | string | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // ═══════════════════════════════════════════════════════════════════════
    // FETCH DATA
    // ═══════════════════════════════════════════════════════════════════════
    const fetchCount = useCallback(async () => {
        try {
            const data = await NotificationService.getCount();
            setCount(data);
        } catch (error) {
            console.error("Failed to fetch notification count:", error);
        }
    }, []);

    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        try {
            const data = await NotificationService.getLatest(10);
            // Ensure we always set an array
            setNotifications(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
            setNotifications([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial fetch and polling
    useEffect(() => {
        fetchCount();
        const interval = setInterval(fetchCount, 30000); // Poll every 30 seconds
        return () => clearInterval(interval);
    }, [fetchCount]);

    // Fetch notifications when dropdown opens
    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen, fetchNotifications]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // ═══════════════════════════════════════════════════════════════════════
    // ACTION HANDLERS
    // ═══════════════════════════════════════════════════════════════════════
    const handleMarkAsRead = async (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setActionLoading(id);
        try {
            await NotificationService.markAsRead(id);
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, is_read: true } : n)
            );
            fetchCount();
        } catch (error) {
            console.error("Failed to mark as read:", error);
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setActionLoading(id);
        try {
            await NotificationService.delete(id);
            setNotifications(prev => prev.filter(n => n.id !== id));
            fetchCount();
        } catch (error) {
            console.error("Failed to delete notification:", error);
        } finally {
            setActionLoading(null);
        }
    };

    const handleMarkAllAsRead = async () => {
        setActionLoading("all");
        try {
            await NotificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            fetchCount();
        } catch (error) {
            console.error("Failed to mark all as read:", error);
        } finally {
            setActionLoading(null);
        }
    };

    const handleClearRead = async () => {
        setActionLoading("clear");
        try {
            await NotificationService.clearRead();
            setNotifications(prev => prev.filter(n => !n.is_read));
            fetchCount();
        } catch (error) {
            console.error("Failed to clear read notifications:", error);
        } finally {
            setActionLoading(null);
        }
    };

    const handleNotificationClick = async (notification: Notification) => {
        // Mark as read if unread
        if (!notification.is_read) {
            try {
                await NotificationService.markAsRead(notification.id);
                setNotifications(prev =>
                    prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n)
                );
                fetchCount();
            } catch (error) {
                console.error("Failed to mark as read:", error);
            }
        }

        // Navigate if there's a link in data
        if (notification.data?.link) {
            router.push(notification.data.link);
            setIsOpen(false);
        }
    };

    const unreadCount = count?.unread || 0;

    return (
        <div ref={dropdownRef} className="relative">
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative rounded-full p-2.5 text-gray-600 transition-all hover:bg-gray-100 hover:text-primary"
            >
                <FiBell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[20px] h-5 px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold animate-pulse">
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute left-0 top-full mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-scaleIn origin-top-left">
                    {/* Header */}
                    <div className="px-4 py-3 bg-gradient-to-l from-primary/5 to-transparent border-b border-gray-100">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <FiBell className="text-primary" />
                                <h3 className="font-bold text-gray-800">الإشعارات</h3>
                                {unreadCount > 0 && (
                                    <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-xs font-semibold">
                                        {unreadCount} جديد
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"
                            >
                                <FiX size={18} />
                            </button>
                        </div>

                        {/* Quick Stats */}
                        {count && count.high_priority_unread > 0 && (
                            <div className="mt-2 flex items-center gap-2 px-2 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs">
                                <FiAlertCircle />
                                <span>{count.high_priority_unread} إشعار عالي الأولوية</span>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                        <button
                            onClick={handleMarkAllAsRead}
                            disabled={actionLoading === "all" || unreadCount === 0}
                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-gray-200 text-gray-600 hover:bg-primary hover:text-white hover:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {actionLoading === "all" ? (
                                <FiRefreshCw className="animate-spin" size={14} />
                            ) : (
                                <FiCheckCircle size={14} />
                            )}
                            قراءة الكل
                        </button>
                        <button
                            onClick={handleClearRead}
                            disabled={actionLoading === "clear" || (count?.read || 0) === 0}
                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-gray-200 text-gray-600 hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {actionLoading === "clear" ? (
                                <FiRefreshCw className="animate-spin" size={14} />
                            ) : (
                                <FiTrash2 size={14} />
                            )}
                            حذف المقروءة
                        </button>
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-[400px] overflow-y-auto admin-scrollbar">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <FiRefreshCw className="animate-spin text-2xl text-primary" />
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="py-12 text-center">
                                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                                    <FiInbox className="text-3xl text-gray-400" />
                                </div>
                                <p className="text-gray-500 font-medium">لا توجد إشعارات</p>
                                <p className="text-gray-400 text-sm mt-1">ستظهر الإشعارات الجديدة هنا</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {notifications.map((notification) => {
                                    const config = priorityConfig[notification.priority] || priorityConfig.low;
                                    return (
                                        <div
                                            key={notification.id}
                                            onClick={() => handleNotificationClick(notification)}
                                            className={`relative px-4 py-3 cursor-pointer transition-all hover:bg-gray-50 ${!notification.is_read ? config.bg : ""
                                                }`}
                                        >
                                            {/* Unread Indicator */}
                                            {!notification.is_read && (
                                                <span className={`absolute right-2 top-4 w-2 h-2 rounded-full ${config.dot}`} />
                                            )}

                                            <div className="flex gap-3 pr-3">
                                                {/* Priority Icon */}
                                                <div className="flex-shrink-0 mt-0.5">
                                                    {config.icon}
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <h4 className={`text-sm font-medium ${notification.is_read ? "text-gray-600" : "text-gray-800"
                                                            }`}>
                                                            {notification.title}
                                                        </h4>
                                                        <span className="text-xs text-gray-400 flex-shrink-0">
                                                            {getRelativeTime(notification.created_at)}
                                                        </span>
                                                    </div>

                                                    <p className={`text-xs mt-1 line-clamp-2 ${notification.is_read ? "text-gray-400" : "text-gray-600"
                                                        }`}>
                                                        {notification.message}
                                                    </p>

                                                    <div className="flex items-center justify-between mt-2">
                                                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                                                            {categoryLabels[notification.category] || notification.category}
                                                        </span>

                                                        {/* Action Buttons */}
                                                        <div className="flex items-center gap-1">
                                                            {!notification.is_read && (
                                                                <button
                                                                    onClick={(e) => handleMarkAsRead(notification.id, e)}
                                                                    disabled={actionLoading === notification.id}
                                                                    className="p-1.5 rounded-lg hover:bg-primary/10 text-gray-400 hover:text-primary transition-colors"
                                                                    title="تحديد كمقروء"
                                                                >
                                                                    {actionLoading === notification.id ? (
                                                                        <FiRefreshCw className="animate-spin" size={14} />
                                                                    ) : (
                                                                        <FiCheck size={14} />
                                                                    )}
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={(e) => handleDelete(notification.id, e)}
                                                                disabled={actionLoading === notification.id}
                                                                className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                                                                title="حذف"
                                                            >
                                                                <FiTrash2 size={14} />
                                                            </button>
                                                            {notification.data?.link && (
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        router.push(notification.data?.link);
                                                                        setIsOpen(false);
                                                                    }}
                                                                    className="p-1.5 rounded-lg hover:bg-primary/10 text-gray-400 hover:text-primary transition-colors"
                                                                    title="عرض"
                                                                >
                                                                    <FiExternalLink size={14} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
                            <button
                                onClick={() => {
                                    router.push("/admin/notifications");
                                    setIsOpen(false);
                                }}
                                className="w-full py-2 rounded-xl bg-primary/10 text-primary font-medium text-sm hover:bg-primary hover:text-white transition-colors"
                            >
                                عرض كل الإشعارات
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
