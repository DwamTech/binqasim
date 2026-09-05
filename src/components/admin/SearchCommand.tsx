"use client";
import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    FiSearch,
    FiHome,
    FiDatabase,
    FiSettings,
    FiUser,
    FiShield,
    FiX,
    FiArrowRight,
    FiCommand,
    FiMail,
    FiBell
} from "react-icons/fi";
import {
    FaHandHoldingHeart,
    FaUserShield,
} from "react-icons/fa";
import { MdArticle } from "react-icons/md";

// ════════════════════════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ════════════════════════════════════════════════════════════════════════════
interface SearchItem {
    title: string;
    href: string;
    icon: React.ReactNode;
    category: string;
    keywords: string[];
}

// ════════════════════════════════════════════════════════════════════════════
// SEARCH DATA - All navigable pages (ordered like main website header)
// ════════════════════════════════════════════════════════════════════════════
const searchItems: SearchItem[] = [
    // ═══════════════════════════════════════════════════════════════════════
    // 1. الرئيسية
    // ═══════════════════════════════════════════════════════════════════════
    {
        title: "الرئيسية",
        href: "/admin",
        icon: <FiHome />,
        category: "عام",
        keywords: ["رئيسية", "الصفحة الرئيسية", "داشبورد", "لوحة التحكم", "home", "dashboard"]
    },

    // ═══════════════════════════════════════════════════════════════════════
    // 2. الحوكمة
    // ═══════════════════════════════════════════════════════════════════════
    {
        title: "عن الوقف",
        href: "/admin/governance/about-waqf",
        icon: <FiShield />,
        category: "الحوكمة",
        keywords: ["وقف", "عن", "about", "waqf"]
    },
    {
        title: "عرض اللوائح والسياسات",
        href: "/admin/governance/regulations",
        icon: <FiShield />,
        category: "الحوكمة",
        keywords: ["لوائح", "سياسات", "عرض", "regulations", "policies", "list"]
    },
    {
        title: "إضافة لائحة جديدة",
        href: "/admin/governance/regulations/create",
        icon: <FiShield />,
        category: "الحوكمة",
        keywords: ["لائحة", "إضافة", "أضافة", "جديدة", "إنشاء", "انشاء", "create", "add"]
    },
    {
        title: "مصارف الريع",
        href: "/admin/governance/spending-channels",
        icon: <FiShield />,
        category: "الحوكمة",
        keywords: ["مصارف", "ريع", "spending", "channels"]
    },
    {
        title: "عرض التقارير المالية",
        href: "/admin/governance/financial-reports",
        icon: <FiShield />,
        category: "الحوكمة",
        keywords: ["تقارير", "مالية", "عرض", "financial", "reports"]
    },
    {
        title: "إضافة تقرير مالي",
        href: "/admin/governance/financial-reports/create",
        icon: <FiShield />,
        category: "الحوكمة",
        keywords: ["تقرير", "مالي", "إضافة", "أضافة", "إنشاء", "انشاء", "create", "add"]
    },
    {
        title: "عرض التقارير السنوية",
        href: "/admin/governance/annual-reports",
        icon: <FiShield />,
        category: "الحوكمة",
        keywords: ["تقارير", "سنوية", "عرض", "annual", "reports"]
    },
    {
        title: "إضافة تقرير سنوي",
        href: "/admin/governance/annual-reports/create",
        icon: <FiShield />,
        category: "الحوكمة",
        keywords: ["تقرير", "سنوي", "إضافة", "أضافة", "إنشاء", "انشاء", "create", "add"]
    },

    // ═══════════════════════════════════════════════════════════════════════
    // 3. أخبار الوقف
    // ═══════════════════════════════════════════════════════════════════════
    {
        title: "عرض أخبار الوقف",
        href: "/admin/governance/waqf-news",
        icon: <MdArticle />,
        category: "أخبار الوقف",
        keywords: ["أخبار", "اخبار", "وقف", "عرض", "news", "list"]
    },
    {
        title: "إضافة خبر جديد",
        href: "/admin/governance/waqf-news/create",
        icon: <MdArticle />,
        category: "أخبار الوقف",
        keywords: ["خبر", "إضافة", "أضافة", "جديد", "إنشاء", "انشاء", "create", "add", "news"]
    },

    // ═══════════════════════════════════════════════════════════════════════
    // 4. تواصل معنا
    // ═══════════════════════════════════════════════════════════════════════
    {
        title: "تقييم رضا المستفيدين",
        href: "/admin/contact/satisfaction-survey",
        icon: <FiMail />,
        category: "تواصل معنا",
        keywords: ["تقييم", "رضا", "مستفيدين", "استبيان", "survey", "satisfaction", "نجوم", "stars"]
    },
    {
        title: "صندوق الاقتراحات",
        href: "/admin/contact/suggestions",
        icon: <FiMail />,
        category: "تواصل معنا",
        keywords: ["اقتراحات", "صندوق", "suggestions", "ideas", "فكرة", "مقترح"]
    },
    {
        title: "صندوق الشكاوي",
        href: "/admin/contact/complaints",
        icon: <FiMail />,
        category: "تواصل معنا",
        keywords: ["شكاوي", "شكاوى", "صندوق", "complaints", "شكوى", "مشكلة"]
    },

    // ═══════════════════════════════════════════════════════════════════════
    // 5. طلبات الدعم
    // ═══════════════════════════════════════════════════════════════════════
    {
        title: "طلبات دعم المؤسسات",
        href: "/admin/support-institutions",
        icon: <FaHandHoldingHeart />,
        category: "طلبات الدعم",
        keywords: ["مؤسسات", "دعم", "طلبات", "شركات", "institutions", "support"]
    },
    {
        title: "طلبات دعم الأفراد",
        href: "/admin/support-individuals",
        icon: <FaHandHoldingHeart />,
        category: "طلبات الدعم",
        keywords: ["أفراد", "افراد", "دعم", "طلبات", "individuals", "support"]
    },

    // ═══════════════════════════════════════════════════════════════════════
    // إعدادات النظام
    // ═══════════════════════════════════════════════════════════════════════
    {
        title: "إدارة حسابك",
        href: "/admin/profile",
        icon: <FiUser />,
        category: "الحساب",
        keywords: ["حساب", "بروفايل", "ملفي", "profile", "account"]
    },
    {
        title: "إدارة الحسابات",
        href: "/admin/users",
        icon: <FaUserShield />,
        category: "الحساب",
        keywords: ["حسابات", "مستخدمين", "إدارة", "users", "accounts", "manage"]
    },
    {
        title: "مركز الإشعارات",
        href: "/admin/notifications",
        icon: <FiBell />,
        category: "النظام",
        keywords: ["إشعارات", "اشعارات", "تنبيهات", "notifications", "alerts", "bell"]
    },
    {
        title: "النسخ الاحتياطي",
        href: "/admin/backup",
        icon: <FiDatabase />,
        category: "النظام",
        keywords: ["نسخ", "احتياطي", "باك اب", "backup", "database"]
    },
    {
        title: "إعدادات النظام",
        href: "/admin/settings",
        icon: <FiSettings />,
        category: "النظام",
        keywords: ["إعدادات", "اعدادات", "ضبط", "settings", "configuration"]
    },
];

// ════════════════════════════════════════════════════════════════════════════
// ARABIC TEXT NORMALIZATION
// Normalizes Arabic characters for smarter search
// ════════════════════════════════════════════════════════════════════════════
const normalizeArabic = (text: string): string => {
    return text
        // Normalize Alef variations (أ إ آ ا)
        .replace(/[أإآا]/g, 'ا')
        // Normalize Taa Marbuta (ة) to Haa (ه)
        .replace(/ة/g, 'ه')
        // Normalize Waw with Hamza (ؤ) to Waw (و)
        .replace(/ؤ/g, 'و')
        // Normalize Yaa with Hamza (ئ) to Yaa (ي)
        .replace(/ئ/g, 'ي')
        // Normalize final Yaa (ى) to Yaa (ي)
        .replace(/ى/g, 'ي')
        // Remove Tashkeel (diacritics)
        .replace(/[\u064B-\u065F]/g, '')
        // Convert to lowercase for English
        .toLowerCase()
        // Remove extra spaces
        .trim();
};

// ════════════════════════════════════════════════════════════════════════════
// SEARCH COMMAND COMPONENT
// ════════════════════════════════════════════════════════════════════════════
interface SearchCommandProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SearchCommand({ isOpen, onClose }: SearchCommandProps) {
    const [query, setQuery] = useState("");
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // ═══════════════════════════════════════════════════════════════════════
    // FILTERED RESULTS
    // ═══════════════════════════════════════════════════════════════════════
    const filteredItems = useMemo(() => {
        if (!query.trim()) {
            return searchItems.slice(0, 8); // Show first 8 items when empty
        }

        const normalizedQuery = normalizeArabic(query);
        const queryWords = normalizedQuery.split(/\s+/).filter(w => w.length > 0);

        return searchItems
            .map(item => {
                // Calculate match score
                let score = 0;
                const normalizedTitle = normalizeArabic(item.title);
                const normalizedKeywords = item.keywords.map(k => normalizeArabic(k));

                // Check title match
                if (normalizedTitle.includes(normalizedQuery)) {
                    score += 100;
                }
                if (normalizedTitle.startsWith(normalizedQuery)) {
                    score += 50;
                }

                // Check each query word
                queryWords.forEach(word => {
                    if (normalizedTitle.includes(word)) {
                        score += 30;
                    }
                    normalizedKeywords.forEach(keyword => {
                        if (keyword.includes(word)) {
                            score += 20;
                        }
                        if (keyword === word) {
                            score += 40;
                        }
                    });
                });

                return { item, score };
            })
            .filter(({ score }) => score > 0)
            .sort((a, b) => b.score - a.score)
            .map(({ item }) => item)
            .slice(0, 10);
    }, [query]);

    // ═══════════════════════════════════════════════════════════════════════
    // HANDLE NAVIGATION
    // ═══════════════════════════════════════════════════════════════════════
    const handleSelect = useCallback((item: SearchItem) => {
        router.push(item.href);
        onClose();
        setQuery("");
        setSelectedIndex(0);
    }, [router, onClose]);

    // ═══════════════════════════════════════════════════════════════════════
    // KEYBOARD NAVIGATION
    // ═══════════════════════════════════════════════════════════════════════
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;

            switch (e.key) {
                case "ArrowDown":
                    e.preventDefault();
                    setSelectedIndex(prev =>
                        prev < filteredItems.length - 1 ? prev + 1 : 0
                    );
                    break;
                case "ArrowUp":
                    e.preventDefault();
                    setSelectedIndex(prev =>
                        prev > 0 ? prev - 1 : filteredItems.length - 1
                    );
                    break;
                case "Enter":
                    e.preventDefault();
                    if (filteredItems[selectedIndex]) {
                        handleSelect(filteredItems[selectedIndex]);
                    }
                    break;
                case "Escape":
                    e.preventDefault();
                    onClose();
                    break;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, filteredItems, selectedIndex, handleSelect, onClose]);

    // Focus input when opened
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    // Reset selection when query changes
    useEffect(() => {
        setSelectedIndex(0);
    }, [query]);

    // Scroll selected item into view
    useEffect(() => {
        if (listRef.current && filteredItems.length > 0) {
            const selectedElement = listRef.current.children[selectedIndex] as HTMLElement;
            if (selectedElement) {
                selectedElement.scrollIntoView({ block: "nearest" });
            }
        }
    }, [selectedIndex, filteredItems.length]);

    if (!isOpen) return null;

    // Group items by category
    const groupedItems = filteredItems.reduce((acc, item) => {
        if (!acc[item.category]) {
            acc[item.category] = [];
        }
        acc[item.category].push(item);
        return acc;
    }, {} as Record<string, SearchItem[]>);

    let globalIndex = 0;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-fadeIn"
                onClick={onClose}
            />

            {/* Search Modal */}
            <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
                <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-scaleIn">
                    {/* Search Input */}
                    <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100">
                        <FiSearch className="text-gray-400 text-xl flex-shrink-0" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="ابحث في لوحة التحكم... (مثال: إضافة مقال)"
                            className="flex-1 text-lg outline-none placeholder:text-gray-400"
                            dir="rtl"
                        />
                        {query && (
                            <button
                                onClick={() => setQuery("")}
                                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"
                            >
                                <FiX size={18} />
                            </button>
                        )}
                        <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 text-gray-500 text-xs">
                            <span>ESC</span>
                        </div>
                    </div>

                    {/* Results */}
                    <div
                        ref={listRef}
                        className="max-h-[400px] overflow-y-auto py-2 admin-scrollbar"
                    >
                        {filteredItems.length === 0 ? (
                            <div className="px-4 py-8 text-center">
                                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                                    <FiSearch className="text-3xl text-gray-400" />
                                </div>
                                <p className="text-gray-500 font-medium">لا توجد نتائج لـ "{query}"</p>
                                <p className="text-gray-400 text-sm mt-1">جرب البحث بكلمات مختلفة</p>
                            </div>
                        ) : (
                            Object.entries(groupedItems).map(([category, items]) => (
                                <div key={category}>
                                    <div className="px-4 py-2">
                                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                            {category}
                                        </span>
                                    </div>
                                    {items.map((item) => {
                                        const currentIndex = globalIndex++;
                                        const isSelected = currentIndex === selectedIndex;

                                        return (
                                            <button
                                                key={item.href}
                                                onClick={() => handleSelect(item)}
                                                className={`w-full flex items-center gap-3 px-4 py-3 transition-all ${isSelected
                                                    ? "bg-primary/10 text-primary"
                                                    : "hover:bg-gray-50 text-gray-700"
                                                    }`}
                                            >
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isSelected
                                                    ? "bg-primary text-white"
                                                    : "bg-gray-100 text-gray-500"
                                                    }`}>
                                                    {item.icon}
                                                </div>
                                                <div className="flex-1 text-right">
                                                    <p className="font-medium">{item.title}</p>
                                                    <p className="text-xs text-gray-400 mt-0.5" dir="ltr">
                                                        {item.href}
                                                    </p>
                                                </div>
                                                {isSelected && (
                                                    <div className="flex items-center gap-1 text-primary">
                                                        <span className="text-xs">انتقال</span>
                                                        <FiArrowRight />
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                                <kbd className="px-1.5 py-0.5 rounded bg-white border border-gray-200 shadow-sm">↑</kbd>
                                <kbd className="px-1.5 py-0.5 rounded bg-white border border-gray-200 shadow-sm">↓</kbd>
                                <span className="mr-1">للتنقل</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <kbd className="px-1.5 py-0.5 rounded bg-white border border-gray-200 shadow-sm">Enter</kbd>
                                <span className="mr-1">للفتح</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <FiCommand size={12} />
                            <span>بحث ذكي يدعم العربية</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

// ════════════════════════════════════════════════════════════════════════════
// SEARCH TRIGGER COMPONENT (For Header)
// ════════════════════════════════════════════════════════════════════════════
interface SearchTriggerProps {
    onClick: () => void;
}

export function SearchTrigger({ onClick }: SearchTriggerProps) {
    // Global keyboard shortcut (Ctrl+K or Cmd+K)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "k") {
                e.preventDefault();
                onClick();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClick]);

    return (
        <button
            onClick={onClick}
            className="hidden md:flex items-center gap-2 rounded-xl bg-gray-50 px-4 py-2.5 hover:bg-gray-100 transition-colors group"
        >
            <FiSearch className="text-gray-400 group-hover:text-primary transition-colors" />
            <span className="text-sm text-gray-500 group-hover:text-gray-600 transition-colors w-48 text-right">
                بحث في لوحة التحكم...
            </span>
            <div className="flex items-center gap-0.5 px-2 py-1 rounded-md bg-white border border-gray-200 text-gray-400 text-xs shadow-sm">
                <span>Ctrl</span>
                <span>+</span>
                <span>K</span>
            </div>
        </button>
    );
}

export default SearchCommand;
