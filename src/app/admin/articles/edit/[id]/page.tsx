"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArticleService } from "../../../services/articleService";
import { SectionService, Section } from "../../../services/sectionService";
import { FiSave, FiImage, FiUser, FiCalendar, FiTag, FiLayers, FiFileText, FiPlus, FiSearch, FiChevronDown, FiCheck } from "react-icons/fi";
import { useToast } from "@/components/admin/ToastProvider";

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
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm text-sm text-gray-700 flex items-center justify-between hover:border-primary/40 hover:shadow transition"
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

export default function EditArticlePage() {
    const router = useRouter();
    const params = useParams();
    const articleId = params.id as string;
    const toast = useToast();

    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Form States
    const [title, setTitle] = useState("");
    const [slug, setSlug] = useState("");
    const [content, setContent] = useState("");
    const [authorName, setAuthorName] = useState("");
    const [status, setStatus] = useState<"draft" | "published">("published");
    const [sectionId, setSectionId] = useState<number | "">("");
    const [excerpt, setExcerpt] = useState("");
    const [gregorianDate, setGregorianDate] = useState("");
    const [keywords, setKeywords] = useState("");
    const [featuredImage, setFeaturedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
    const [isSlugTouched, setIsSlugTouched] = useState(false);

    // Section Logic
    const [sections, setSections] = useState<Section[]>([]);
    const [sectionsLoading, setSectionsLoading] = useState(false);
    const [newSectionName, setNewSectionName] = useState("");
    const [isAddingSection, setIsAddingSection] = useState(false);

    // Author Logic
    const [authors, setAuthors] = useState<string[]>([]);
    const [filteredAuthors, setFilteredAuthors] = useState<string[]>([]);
    const [showAuthorsDropdown, setShowAuthorsDropdown] = useState(false);

    useEffect(() => {
        fetchSections();
        fetchAuthors();
        fetchArticleData();
    }, []);

    const fetchArticleData = async () => {
        setInitialLoading(true);
        try {
            console.log("Fetching article with ID:", articleId);
            const response = await ArticleService.getById(articleId);
            console.log("API Response:", response);

            // Handle different response structures
            const article = response.data || response;
            console.log("Article data:", article);

            // Populate form
            setTitle(article.title || "");
            setSlug(article.slug || "");
            setContent(article.content || "");
            setAuthorName(article.author_name || "");
            setStatus(article.status || "published");
            setSectionId(article.section_id || "");
            setExcerpt(article.excerpt || "");
            setGregorianDate(article.gregorian_date || "");
            setKeywords(article.keywords || "");

            console.log("Form populated with:", {
                title: article.title,
                slug: article.slug,
                section_id: article.section_id,
                status: article.status
            });

            // Handle existing image - API returns full URL
            if (article.featured_image) {
                console.log("Setting image URL:", article.featured_image);
                setExistingImageUrl(article.featured_image);
                setImagePreview(article.featured_image);
            }

        } catch (err: any) {
            console.error("Error fetching article:", err);
            setError(err.message || "فشل تحميل بيانات المقال");
        } finally {
            setInitialLoading(false);
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

    const fetchSections = async () => {
        setSectionsLoading(true);
        try {
            const data = await SectionService.getAll();
            setSections(data);
            return data;
        } catch (err) {
            console.error("Failed to load sections", err);
            return [];
        } finally {
            setSectionsLoading(false);
        }
    };

    const handleAddSection = async () => {
        const nameToAdd = newSectionName.trim();
        if (!nameToAdd) return;

        setIsAddingSection(true);
        try {
            await SectionService.create(nameToAdd);
            const updatedSections = await fetchSections();
            const createdSection = updatedSections.find(s => s.name === nameToAdd);

            if (createdSection) {
                setSectionId(createdSection.id);
            }

            setNewSectionName("");
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || "فشل إضافة القسم");
        } finally {
            setIsAddingSection(false);
        }
    };

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

        if (!isSlugTouched) {
            setSlug(slugify(val));
        }
    };

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setFeaturedImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    // Smart Publish Logic
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

        // If published and date is in the future, auto-convert to draft
        if (status === 'published' && isFutureDate(newDate)) {
            setStatus('draft');
            toast.warning('تم تحويل المقال إلى مسودة تلقائياً لأن تاريخ النشر مستقبلي');
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        // Validation
        const missingFields = [];
        if (!title) missingFields.push("عنوان المقال");
        if (!slug) missingFields.push("الرابط الدائم");
        if (!content) missingFields.push("محتوى المقال");
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
            formData.append("_method", "PUT"); // Laravel method override

            if (sectionId) formData.append("section_id", String(sectionId));
            if (featuredImage) formData.append("featured_image", featuredImage);
            if (excerpt) formData.append("excerpt", excerpt);
            if (gregorianDate) formData.append("gregorian_date", gregorianDate);
            if (keywords) formData.append("keywords", keywords);

            await ArticleService.update(Number(articleId), formData);

            setSuccess("تم تحديث المقال بنجاح!");

            setTimeout(() => {
                router.push("/admin/articles");
            }, 1000);

        } catch (err: any) {
            console.error(err);
            setError(err.message || "حدث خطأ أثناء تحديث المقال");
            window.scrollTo(0, 0);
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return (
            <div className="w-full max-w-6xl mx-auto space-y-6">
                <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-gray-500">جاري تحميل بيانات المقال...</p>
                    </div>
                </div>
            </div>
        );
    }

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
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <FiFileText className="text-primary" size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">تعديل المقال</h1>
                            <p className="text-sm text-gray-700 mt-1">تحرير بيانات المقال بشكل احترافي ومتسق</p>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <div className="flex">
                            <button
                                type="button"
                                onClick={() => router.push('/admin/articles')}
                                className="flex items-center gap-2 px-4 py-2 text-white bg-secondary rounded-lg hover:opacity-90 transition-colors"
                            >
                                الرجوع إلى قائمة المقالات
                            </button>
                        </div>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                إلغاء
                            </button>
                            <button
                                type="submit"
                                form="edit-article-form"
                                disabled={loading}
                                className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <FiSave size={18} />
                                {loading ? "جاري الحفظ..." : "حفظ التعديلات"}
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-100 flex items-center">
                    <span className="font-medium">خطأ:</span>&nbsp;{error}
                </div>
            )}

            {success && (
                <div className="bg-green-50 text-green-600 p-4 rounded-lg border border-green-100 flex items-center">
                    <span className="font-medium">نجاح:</span>&nbsp;{success}
                </div>
            )}

            <form id="edit-article-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Main Content Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Info */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
                        <h2 className="text-lg font-semibold text-gray-800 border-b pb-3 mb-4 flex items-center gap-2">
                            <FiFileText className="text-primary" />
                            بيانات المقال الأساسية
                        </h2>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">عنوان المقال <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={title}
                                onChange={handleTitleChange}
                                placeholder="أدخل عنوان المقال هنا..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">الرابط الدائم (Slug) <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={slug}
                                    onChange={(e) => {
                                        setSlug(e.target.value);
                                        setIsSlugTouched(true);
                                    }}
                                    placeholder="رابط-المقال-text-here"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-right focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    required
                                />
                            </div>
                            <p className="text-xs text-gray-400">يستخدم في رابط الصفحة URL. يجب أن يكون بالإنجليزية وبدون مسافات.</p>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">محتوى المقال <span className="text-red-500">*</span></label>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                rows={15}
                                placeholder="أدخل محتوى المقال هنا (HTML مدعوم)..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-mono text-sm"
                                required
                            />
                            <p className="text-xs text-gray-400">يمكنك كتابة كود HTML أو نص عادي.</p>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">مقتطف قصير (Excerpt)</label>
                            <textarea
                                value={excerpt}
                                onChange={(e) => setExcerpt(e.target.value)}
                                rows={3}
                                placeholder="وصف قصير يظهر في البطاقات ومحركات البحث..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-6">

                    {/* Publising Options */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
                        <h2 className="text-lg font-semibold text-gray-800 border-b pb-3 mb-4 flex items-center gap-2">
                            <FiSave className="text-primary" />
                            النشر
                        </h2>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">حالة النشر <span className="text-red-500">*</span></label>
                            <FancySelect
                                value={status}
                                onChange={(v) => setStatus(v as "draft" | "published")}
                                options={[
                                    { label: "منشور (Published)", value: "published" },
                                    { label: "مسودة (Draft)", value: "draft" }
                                ]}
                                placeholder="اختر الحالة"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">تاريخ النشر</label>
                            <div className="relative">
                                <input
                                    type="date"
                                    value={gregorianDate}
                                    onChange={handleDateChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all pl-10"
                                />
                                <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            </div>
                            <p className="text-xs text-gray-400">ملاحظة: يمكن نشر المقالات بتاريخ مستقبلي باعتباره مقال مجدول.</p>
                        </div>
                    </div>

                    {/* Author & Categorization */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
                        <h2 className="text-lg font-semibold text-gray-800 border-b pb-3 mb-4 flex items-center gap-2">
                            <FiLayers className="text-primary" />
                            التصنيف والمؤلف
                        </h2>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                القسم
                                <span className="text-red-500">*</span>
                            </label>
                            <FancySelect
                                value={sectionId ? String(sectionId) : ""}
                                onChange={(v) => setSectionId(v ? Number(v) : "")}
                                options={[{ label: "اختر القسم", value: "" }, ...sections.map(s => ({ label: s.name, value: String(s.id) }))]}
                                placeholder="اختر القسم"
                            />
                            <div className="border border-gray-200 rounded-lg mt-2">
                                <div className="p-2 bg-gray-50 border-t border-gray-200">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newSectionName}
                                            onChange={(e) => setNewSectionName(e.target.value)}
                                            placeholder="أضف قسم جديد..."
                                            className="flex-1 min-w-0 px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md focus:border-primary outline-none transition-colors"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    handleAddSection();
                                                }
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddSection}
                                            disabled={isAddingSection || !newSectionName.trim()}
                                            className="bg-white border border-gray-300 text-primary hover:bg-primary hover:text-white px-3 py-1.5 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                            title="أضافة قسم"
                                        >
                                            {isAddingSection ? <span className="animate-spin h-4 w-4 rounded-full border-2 border-primary border-t-transparent"></span> : <FiPlus size={16} />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">اسم الكاتب <span className="text-red-500">*</span></label>
                            <FancySelect
                                value={authorName}
                                onChange={(v) => setAuthorName(v)}
                                options={[{ label: "اختر الكاتب", value: "" }, ...authors.map(a => ({ label: a, value: a }))]}
                                placeholder="اختر الكاتب"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">الكلمات المفتاحية</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={keywords}
                                    onChange={(e) => setKeywords(e.target.value)}
                                    placeholder="اخبار, وقف, تعليم..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all pl-10"
                                />
                                <FiTag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            </div>
                        </div>
                    </div>

                    {/* Featured Image */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
                        <h2 className="text-lg font-semibold text-gray-800 border-b pb-3 mb-4 flex items-center gap-2">
                            <FiImage className="text-primary" />
                            الصورة البارزة
                        </h2>

                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary transition-colors cursor-pointer relative bg-gray-50">
                            <input
                                type="file"
                                onChange={handleImageChange}
                                accept="image/*"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            {imagePreview ? (
                                <div className="relative aspect-video w-full overflow-hidden rounded-md">
                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                </div>
                            ) : (
                                <div className="py-8 text-gray-400 flex flex-col items-center">
                                    <FiImage size={32} className="mb-2" />
                                    <span className="text-sm">اضغط لاختيار صورة</span>
                                    <span className="text-xs mt-1 text-gray-300">PNG, JPG, WEBP</span>
                                </div>
                            )}
                        </div>
                        {featuredImage && (
                            <p className="text-xs text-gray-500 text-center truncate px-2">
                                {featuredImage.name}
                            </p>
                        )}
                        {!featuredImage && existingImageUrl && (
                            <p className="text-xs text-gray-400 text-center">
                                الصورة الحالية محفوظة
                            </p>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
}
