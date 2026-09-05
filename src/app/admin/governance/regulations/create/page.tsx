"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArticleService } from "@/app/admin/services/articleService";
import { SectionService } from "@/app/admin/services/sectionService";
import { FiSave, FiImage, FiType, FiUser, FiCalendar, FiTag, FiLayers, FiFileText, FiPlus, FiSearch, FiChevronDown, FiCheck } from "react-icons/fi";
import { useToast } from "@/components/admin/ToastProvider";
import RichTextEditor from "@/components/admin/RichTextEditor";

export default function CreateRegulationPage() {
    const router = useRouter();
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Form States (matching CreateArticlePage exactly)
    const [title, setTitle] = useState("");
    const [slug, setSlug] = useState("");
    const [content, setContent] = useState("");
    const [authorName, setAuthorName] = useState("");
    const [status, setStatus] = useState<"draft" | "published">("published");
    const [sectionId, setSectionId] = useState<number | "">(""); // Match Articles structure
    const [excerpt, setExcerpt] = useState("");
    const [gregorianDate, setGregorianDate] = useState("");
    const [keywords, setKeywords] = useState(""); // Added to match Articles
    const [featuredImage, setFeaturedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isSlugTouched, setIsSlugTouched] = useState(false);

    type FancySelectOption = { label: string; value: string };
    function FancySelect({
        value,
        onChange,
        options,
        placeholder,
        className
    }: {
        value: string;
        onChange: (v: string) => void;
        options: FancySelectOption[];
        placeholder: string;
        className?: string;
    }) {
        const [open, setOpen] = useState(false);
        const [query, setQuery] = useState("");
        const ref = React.useRef<HTMLDivElement | null>(null);

        useEffect(() => {
            const onDocClick = (e: MouseEvent) => {
                if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
            };
            document.addEventListener("mousedown", onDocClick);
            return () => document.removeEventListener("mousedown", onDocClick);
        }, []);

        const selectedLabel = options.find(o => o.value === value)?.label || "";
        const filtered = options.filter(o => o.label.toLowerCase().includes(query.toLowerCase()));

        return (
            <div ref={ref} className={`relative ${className || ""}`}>
                <button
                    type="button"
                    onClick={() => setOpen(v => !v)}
                    className="min-w-[160px] px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm text-sm text-gray-700 flex items-center justify-between hover:border-primary/40 hover:shadow transition"
                >
                    <span className={`line-clamp-1 ${selectedLabel ? "text-gray-800" : "text-gray-400"}`}>
                        {selectedLabel || placeholder}
                    </span>
                    <FiChevronDown className="text-gray-400" />
                </button>
                {open && (
                    <div className="absolute z-50 mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden">
                        <div className="flex items-center gap-2 px-3 py-2 border-b bg-gray-50">
                            <FiSearch className="text-gray-400" size={14} />
                            <input
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                placeholder="بحث داخل الخيارات..."
                                className="flex-1 bg-transparent outline-none text-xs text-gray-700"
                            />
                        </div>
                        <ul className="max-h-56 overflow-y-auto admin-scrollbar">
                            {filtered.map((opt) => (
                                <li
                                    key={opt.value}
                                    onMouseDown={() => {
                                        onChange(opt.value);
                                        setOpen(false);
                                        setQuery("");
                                    }}
                                    className={`px-3 py-2 text-sm cursor-pointer flex items-center justify-between hover:bg-gray-50 transition ${value === opt.value ? "bg-primary/5 text-gray-900" : "text-gray-700"}`}
                                >
                                    <span className="line-clamp-1">{opt.label}</span>
                                    {value === opt.value && <FiCheck className="text-primary" />}
                                </li>
                            ))}
                            {filtered.length === 0 && (
                                <li className="px-3 py-3 text-xs text-gray-500">لا توجد نتائج مطابقة</li>
                            )}
                        </ul>
                    </div>
                )}
            </div>
        );
    }

    // Author Logic
    const [authors, setAuthors] = useState<string[]>([]);
    const [filteredAuthors, setFilteredAuthors] = useState<string[]>([]);
    const [showAuthorsDropdown, setShowAuthorsDropdown] = useState(false);

    useEffect(() => {
        initializePage();
    }, []);

    const initializePage = async () => {
        try {
            await fetchAuthors();

            // Setup Section: "اللوائح" - Auto-find or create
            const sections = await SectionService.getAll();
            let targetSection = sections.find((s: any) => s.name === "اللوائح");

            if (!targetSection) {
                try {
                    targetSection = await SectionService.create("اللوائح", "قسم خاص باللوائح والسياسات");
                } catch (e) {
                    console.error("Failed to create section", e);
                    toast.error("فشل إنشاء قسم اللوائح تلقائياً");
                }
            }

            if (targetSection) {
                setSectionId(targetSection.id);
            }

        } catch (err) {
            console.error(err);
        }
    };

    const fetchAuthors = async () => {
        try {
            const data = await ArticleService.getAuthors();
            setAuthors(data);
            setFilteredAuthors(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAuthorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setAuthorName(value);
        setShowAuthorsDropdown(true);

        const filtered = authors.filter(author =>
            author.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredAuthors(filtered);
    };

    const handleAuthorSelect = (author: string) => {
        setAuthorName(author);
        setShowAuthorsDropdown(false);
    };

    // Slug Helper (matching Articles exactly)
    const slugify = (text: string) => {
        return text
            .toString()
            .trim()
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\p{L}\p{N}\-_]+/gu, '')
            .replace(/\-\-+/g, '-')
            .replace(/^-+/, '')
            .replace(/-+$/, '');
    };

    const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setTitle(val);

        const currentSlugified = slugify(val);
        if (!isSlugTouched) {
            setSlug(currentSlugified);
        }
    };

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setFeaturedImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    // Smart Publish Logic (matching Articles exactly)
    const getTodayDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    const isFutureDate = (date: string) => {
        if (!date) return false;
        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        selectedDate.setHours(0, 0, 0, 0);
        return selectedDate > today;
    };

    // Auto-set today's date when status changes to "published" if no date or future date
    useEffect(() => {
        if (status === 'published') {
            if (!gregorianDate || isFutureDate(gregorianDate)) {
                setGregorianDate(getTodayDate());
            }
        }
    }, [status, gregorianDate]);

    // Auto-convert to draft if future date is selected with published status
    const handleDateChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newDate = e.target.value;
        setGregorianDate(newDate);

        if (status === 'published' && isFutureDate(newDate)) {
            setStatus('draft');
            toast.warning('تم تحويل اللائحة إلى مسودة تلقائياً لأن تاريخ النشر مستقبلي');
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        // Validation (matching Articles)
        const missingFields = [];
        if (!title) missingFields.push("عنوان اللائحة");
        if (!slug) missingFields.push("الرابط الدائم");
        if (!content) missingFields.push("محتوى اللائحة");
        if (!authorName) missingFields.push("اسم الكاتب");
        if (!sectionId) missingFields.push("القسم");

        if (missingFields.length > 0) {
            setError(`يرجى ملء الحقول الإلزامية المفقودة: ${missingFields.join("، ")}`);
            setLoading(false);
            window.scrollTo(0, 0);
            return;
        }

        try {
            const formData = new FormData();
            formData.append("title", title);
            formData.append("slug", slug);
            formData.append("content", content);
            formData.append("author_name", authorName);
            formData.append("status", status);

            if (sectionId) formData.append("section_id", String(sectionId));
            if (featuredImage) formData.append("featured_image", featuredImage);
            if (excerpt) formData.append("excerpt", excerpt);
            if (gregorianDate) formData.append("gregorian_date", gregorianDate);
            if (keywords) formData.append("keywords", keywords);

            await ArticleService.create(formData);

            setSuccess("تم إنشاء اللائحة بنجاح!");

            setTimeout(() => {
                router.push("/admin/governance/regulations");
            }, 1000);

        } catch (err: any) {
            console.error(err);
            setError(err.message || "حدث خطأ أثناء إنشاء اللائحة");
            window.scrollTo(0, 0);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-6xl mx-auto space-y-6">
            <section className="animated-hero relative overflow-hidden rounded-2xl p-6 md:p-8">
                <div className="absolute inset-0 pointer-events-none hero-grid"></div>
                <span className="hero-blob hero-blob-1"></span>
                <span className="hero-blob hero-blob-2"></span>
                <span className="hero-dot hero-dot-1"></span>
                <span className="hero-dot hero-dot-2"></span>

                <div className="relative z-10 flex items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-white/70 backdrop-blur-md flex items-center justify-center shadow-sm">
                            <FiFileText className="text-primary" size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">إضافة لائحة جديدة</h1>
                            <p className="text-sm text-gray-700 mt-1">قم بملء البيانات التالية لإنشاء لائحة جديدة في قسم "اللوائح"</p>
                        </div>
                    </div>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-70 font-medium shadow-sm"
                    >
                        <FiSave />
                        {loading ? "جاري الحفظ..." : "حفظ اللائحة"}
                    </button>
                </div>
            </section>

            {/* Error/Success Messages */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    <strong>خطأ:</strong> {error}
                </div>
            )}

            {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                    <strong>نجح:</strong> {success}
                </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Info */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
                        <div className="flex items-center gap-2 text-gray-800 font-semibold border-b pb-3 mb-4">
                            <FiType className="text-primary" size={20} />
                            <h2 className="text-lg">المعلومات الأساسية</h2>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                عنوان اللائحة <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={title}
                                onChange={handleTitleChange}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                placeholder="مثال: لائحة تنظيم العمل الداخلي"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                الرابط الدائم (Slug) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={slug}
                                onChange={(e) => { setSlug(e.target.value); setIsSlugTouched(true); }}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-gray-50 font-mono text-sm"
                                placeholder="regulation-slug"
                                dir="ltr"
                            />
                            <p className="text-xs text-gray-500 mt-1">يتم إنشاؤه تلقائياً من العنوان، يمكنك تعديله</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                ملخص قصير
                            </label>
                            <textarea
                                value={excerpt}
                                onChange={(e) => setExcerpt(e.target.value)}
                                rows={3}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                                placeholder="وصف مختصر عن اللائحة..."
                            />
                        </div>
                    </div>

                    {/* Rich Content Editor */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center gap-2 text-gray-800 font-semibold border-b pb-3 mb-4">
                            <FiFileText className="text-primary" size={20} />
                            <h2 className="text-lg">محتوى اللائحة <span className="text-red-500">*</span></h2>
                        </div>
                        <RichTextEditor value={content} onChange={setContent} />
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Publish Status */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center gap-2 text-gray-800 font-semibold border-b pb-3 mb-4">
                            <FiLayers className="text-primary" size={20} />
                            <h2 className="text-lg">حالة النشر</h2>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="text-sm font-medium text-gray-700">الحالة</span>
                                <FancySelect
                                    value={status}
                                    onChange={(v) => setStatus(v as any)}
                                    options={[
                                        { label: "منشور", value: "published" },
                                        { label: "مسودة", value: "draft" },
                                    ]}
                                    placeholder="اختر الحالة"
                                />
                            </div>

                            {/* Section readonly display */}
                            <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-blue-900">القسم:</span>
                                    <span className="text-sm font-bold text-blue-700">اللوائح</span>
                                </div>
                                <p className="text-xs text-blue-600 mt-1">محدد تلقائياً</p>
                            </div>
                        </div>
                    </div>

                    {/* Metadata */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center gap-2 text-gray-800 font-semibold border-b pb-3 mb-4">
                            <FiTag className="text-primary" size={20} />
                            <h2 className="text-lg">البيانات الوصفية</h2>
                        </div>

                        <div className="space-y-4">
                            {/* Author with Autocomplete */}
                            <div className="relative">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    اسم الكاتب <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <FiUser className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        required
                                        value={authorName}
                                        onChange={handleAuthorChange}
                                        onFocus={() => setShowAuthorsDropdown(true)}
                                        onBlur={() => setTimeout(() => setShowAuthorsDropdown(false), 200)}
                                        className="w-full pr-10 pl-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                        placeholder="ابحث أو اكتب اسم جديد"
                                    />
                                </div>
                                {showAuthorsDropdown && filteredAuthors.length > 0 && (
                                    <div className="absolute z-50 w-full mt-1">
                                        <div className="rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden">
                                            <div className="flex items-center gap-2 px-3 py-2 border-b bg-gray-50 text-xs text-gray-500">
                                                <FiSearch className="text-gray-400" size={14} />
                                                <span>نتائج البحث</span>
                                            </div>
                                            <ul className="max-h-40 overflow-y-auto admin-scrollbar">
                                                {filteredAuthors.map((author, index) => (
                                                    <li
                                                        key={index}
                                                        onMouseDown={() => handleAuthorSelect(author)}
                                                        className="px-4 py-2 text-sm cursor-pointer hover:bg-gray-50 transition-colors"
                                                    >
                                                        {author}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    تاريخ النشر (ميلادي)
                                </label>
                                <div className="relative">
                                    <FiCalendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="date"
                                        value={gregorianDate}
                                        onChange={handleDateChange}
                                        className="w-full pr-10 pl-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">يتم تعيين اليوم تلقائياً عند النشر</p>
                            </div>

                            {/* Keywords */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    الكلمات المفتاحية
                                </label>
                                <input
                                    type="text"
                                    value={keywords}
                                    onChange={(e) => setKeywords(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    placeholder="فصل بفواصل: قانون، تنظيم، سياسة"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Featured Image */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center gap-2 text-gray-800 font-semibold border-b pb-3 mb-4">
                            <FiImage className="text-primary" size={20} />
                            <h2 className="text-lg">الصورة البارزة</h2>
                        </div>

                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-primary/50 transition-colors relative cursor-pointer group">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            {imagePreview ? (
                                <div className="relative w-full h-48">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="w-full h-full object-cover rounded-lg"
                                    />
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                                        <span className="text-white text-sm font-medium">انقر لتغيير الصورة</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-8">
                                    <FiImage className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                                    <p className="text-sm text-gray-600 font-medium">انقر لرفع صورة</p>
                                    <p className="text-xs text-gray-400 mt-1">PNG, JPG أقل من 5MB</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
