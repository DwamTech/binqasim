"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
    FiHome,
    FiChevronDown,
    FiSettings,
    FiDatabase,
    FiX,
    FiMenu,
    FiLogOut,
    FiShield,
    FiUser,
    FiMail
} from "react-icons/fi";
import {
    FaBook,
    FaBuilding,
    FaHandHoldingHeart,
    FaUserShield,
} from "react-icons/fa";
import { MdArticle } from "react-icons/md";
import { usePendingCounts } from "@/contexts/PendingCountsContext";

// Recursive Type Definition
type NavItem = {
    title: string;
    icon?: React.ReactNode;
    href?: string;
    submenu?: NavItem[];
    adminOnly?: boolean;
};

const navItems: NavItem[] = [
    // ═══════════════════════════════════════════════════════════════════════
    // 1. الرئيسية
    // ═══════════════════════════════════════════════════════════════════════
    {
        title: "الرئيسية",
        icon: <FiHome size={20} />,
        href: "/admin",
    },

    // ═══════════════════════════════════════════════════════════════════════
    // 2. الحوكمة
    // ═══════════════════════════════════════════════════════════════════════
    {
        title: "الحوكمة",
        icon: <FiShield size={20} />,
        submenu: [
            { title: "عن الوقف", href: "/admin/governance/about-waqf" },
            {
                title: "اللوائح والسياسات",
                submenu: [
                    { title: "عرض اللوائح", href: "/admin/governance/regulations" },
                    { title: "إضافة لائحة", href: "/admin/governance/regulations/create" },
                ]
            },
            { title: "مصارف الريع", href: "/admin/governance/spending-channels" },
            {
                title: "التقارير المالية",
                submenu: [
                    { title: "عرض التقارير", href: "/admin/governance/financial-reports" },
                    { title: "إضافة تقرير", href: "/admin/governance/financial-reports/create" },
                ]
            },
            {
                title: "التقارير السنوية",
                submenu: [
                    { title: "عرض التقارير", href: "/admin/governance/annual-reports" },
                    { title: "إضافة تقرير", href: "/admin/governance/annual-reports/create" },
                ]
            },
        ],
    },

    // ═══════════════════════════════════════════════════════════════════════
    // 3. أخبار الوقف (منفصل في الهيدر الرئيسي)
    // ═══════════════════════════════════════════════════════════════════════
    {
        title: "أخبار الوقف",
        icon: <MdArticle size={20} />,
        submenu: [
            { title: "عرض الأخبار", href: "/admin/governance/waqf-news" },
            { title: "إضافة خبر", href: "/admin/governance/waqf-news/create" },
        ],
    },

    // ═══════════════════════════════════════════════════════════════════════
    // 4. تواصل معنا (صفحات جديدة - غير موجودة بعد)
    // ═══════════════════════════════════════════════════════════════════════
    {
        title: "تواصل معنا",
        icon: <FiMail size={20} />,
        submenu: [
            { title: "تقييم رضا المستفيدين", href: "/admin/contact/satisfaction-survey" },
            { title: "صندوق الاقتراحات", href: "/admin/contact/suggestions" },
            { title: "صندوق الشكاوي", href: "/admin/contact/complaints" },
        ],
    },

    // ═══════════════════════════════════════════════════════════════════════
    // 5. طلبات الدعم
    // ═══════════════════════════════════════════════════════════════════════
    {
        title: "طلبات الدعم",
        icon: <FaHandHoldingHeart size={20} />,
        submenu: [
            { title: "طلبات المؤسسات", href: "/admin/support-institutions" },
            { title: "طلبات الأفراد", href: "/admin/support-individuals" },
        ],
    },

    // ═══════════════════════════════════════════════════════════════════════
    // إعدادات النظام
    // ═══════════════════════════════════════════════════════════════════════
    {
        title: "إدارة حسابك",
        icon: <FiUser size={20} />,
        href: "/admin/profile",
    },
    {
        title: "إدارة الحسابات",
        icon: <FaUserShield size={20} />,
        href: "/admin/users",
        adminOnly: true,
    },
    {
        title: "النسخ الاحتياطي",
        icon: <FiDatabase size={20} />,
        href: "/admin/backup",
    },
    {
        title: "الاعدادات",
        icon: <FiSettings size={20} />,
        href: "/admin/settings",
    },
];

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const { counts } = usePendingCounts();
    const pathname = usePathname();
    const router = useRouter();

    // Get user role from localStorage
    const getUserRole = () => {
        if (typeof window !== 'undefined') {
            const user = localStorage.getItem('user');
            if (user) {
                try {
                    const parsedUser = JSON.parse(user);
                    return parsedUser.role || 'user';
                } catch {
                    return 'user';
                }
            }
        }
        return 'user';
    };

    const userRole = getUserRole();
    const isAdmin = userRole === 'admin';

    // Filter navItems based on user role
    const filteredNavItems = navItems.filter(item => {
        // Hide admin-only items from non-admin users
        if (item.adminOnly && !isAdmin) {
            return false;
        }
        return true;
    });

    // Logout Handler
    const handleLogout = () => {
        // Clear authentication data from localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // Redirect to login page
        router.push('/login');
    };

    const getBadgeCount = (href?: string) => {
        if (!counts) return 0;
        if (href === "/admin/support-individuals") return counts.individual.total_action_needed;
        if (href === "/admin/support-institutions") return counts.institutional.total_action_needed;
        return 0;
    };

    // Recursive Sidebar Item Component
    const SidebarItem = ({ item, depth = 0 }: { item: NavItem, depth?: number }) => {
        // Auto-expand if child active
        const hasSubmenu = item.submenu && item.submenu.length > 0;
        const isActiveLink = item.href ? pathname === item.href : false;

        // Ensure submenu opens if any child is active
        const isChildActive = hasSubmenu && item.submenu?.some(child =>
            child.href === pathname || (child.submenu?.some(grandChild => grandChild.href === pathname))
        );

        const [isExpanded, setIsExpanded] = useState(isChildActive || false);

        const toggleExpand = () => setIsExpanded(!isExpanded);

        const paddingLeft = depth > 0 ? `${depth * 12 + 12}px` : "16px"; // Dynamic indent
        const fontSize = depth > 0 ? "0.9rem" : "1rem"; // Slightly smaller for children

        if (hasSubmenu) {
            return (
                <div className="mb-1">
                    <button
                        onClick={toggleExpand}
                        style={{ paddingLeft: paddingLeft, paddingRight: paddingLeft }}
                        className={`flex w-full items-center justify-between rounded-lg py-3 text-sm font-medium transition-colors ${isExpanded || isChildActive
                            ? "text-primary bg-primary/5"
                            : "text-gray-600 hover:bg-gray-50 hover:text-primary"
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            {item.icon && <span>{item.icon}</span>}
                            <span style={{ fontSize }}>{item.title}</span>
                        </div>
                        <FiChevronDown
                            className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                        />
                    </button>

                    <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}>
                        <div className="mt-1 space-y-1 relative">
                            {/* Vertical Line for tree structure visual */}
                            {depth === 0 && <div className="absolute right-6 top-0 bottom-0 w-px bg-gray-100" />}

                            {item.submenu!.map((sub, idx) => (
                                <SidebarItem key={idx} item={sub} depth={depth + 1} />
                            ))}
                        </div>
                    </div>
                </div>
            );
        }

        // Single Link
        const badgeCount = getBadgeCount(item.href);
        return (
            <Link
                href={item.href || "#"}
                onClick={() => window.innerWidth < 1024 && onClose()}
                style={{ paddingRight: paddingLeft }}
                className={`flex items-center justify-between rounded-lg py-3 mb-1 text-sm font-medium transition-all ${isActiveLink
                    ? "bg-primary text-white shadow-md mx-2" // Active style
                    : "text-gray-600 hover:bg-gray-50 hover:text-primary mx-2" // Inactive style
                    }`}
            >
                <div className="flex items-center gap-3">
                    {item.icon && <span>{item.icon}</span>}
                    {/* If no icon and depth > 0, adds bullet point mostly for visual hierarchy */}
                    {!item.icon && depth > 0 && <span className="w-1.5 h-1.5 rounded-full bg-gray-300 ml-1 mr-1"></span>}
                    <span>{item.title}</span>
                </div>
                {badgeCount > 0 && (
                    <span className={`flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1.5 text-xs font-bold leading-none ${isActiveLink ? "bg-white text-primary" : "bg-red-500 text-white"
                        }`}>
                        {badgeCount}
                    </span>
                )}
            </Link>
        );
    };

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={`fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
                onClick={onClose}
            />

            {/* Sidebar Container */}
            <aside
                className={`fixed top-0 right-0 z-50 h-[100dvh] w-64 bg-white shadow-xl transition-transform duration-300 flex flex-col lg:sticky lg:top-0 lg:translate-x-0 ${isOpen ? "translate-x-0" : "translate-x-full"}`}
            >
                {/* Header / Logo */}
                <div className="flex h-20 items-center justify-between px-6 border-b border-gray-100 flex-shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="relative h-10 w-10 overflow-hidden rounded-full border border-gray-200">
                            <Image src="/Untitled-1-removebg-preview-350x350.png" alt="Logo" fill className="object-cover" />
                        </div>
                        <span className="text-lg font-bold text-gray-800">لوحة التحكم</span>
                    </div>
                    <button onClick={onClose} className="text-gray-500 lg:hidden">
                        <FiX size={24} />
                    </button>
                </div>

                {/* Scrollable Nav Area */}
                <nav className="flex-1 overflow-y-auto py-6 admin-scrollbar">
                    <div className="px-3">
                        {filteredNavItems.map((item, index) => (
                            <SidebarItem key={index} item={item} />
                        ))}
                    </div>
                </nav>

                {/* Logout Button Footer */}
                <div className="p-4 border-t border-gray-100 bg-white flex-shrink-0">
                    <button
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm font-bold text-red-600 transition-colors hover:bg-red-100 hover:shadow-sm"
                        onClick={handleLogout}
                    >
                        <FiLogOut size={20} />
                        <span>تسجيل الخروج</span>
                    </button>
                </div>
            </aside>
        </>
    );
}
