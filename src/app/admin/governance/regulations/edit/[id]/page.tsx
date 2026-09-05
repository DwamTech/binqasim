"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArticleService } from "@/app/admin/services/articleService";
import { SectionService } from "@/app/admin/services/sectionService";
import { FiSave, FiImage, FiUser, FiCalendar, FiTag, FiLayers, FiFileText } from "react-icons/fi";
import { useToast } from "@/components/admin/ToastProvider";
import RichTextEditor from "@/components/admin/RichTextEditor";

export default function EditRegulationPage() {
    const router = useRouter();
    const params = useParams();
    const articleId = params.id as string;
    const toast = useToast();

    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Form States (matching EditArticlePage exactly)
    const [title, setTitle] = useState("");
    const [slug, setSlug] = useState("");
    const [content, setContent] = useState("");
    const [authorName, setAuthorName] = useState("");
    const [status, setStatus] = useState<"draft" | "published">("published");
    const [sectionId, setSectionId] = useState<number | "">(""); // Fixed to regulations section
    const [excerpt, setExcerpt] = useState("");
    const [gregorianDate, setGregorianDate] = useState("");
    const [keywords, setKeywords] = useState("");
    const [featuredImage, setFeaturedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
    const [isSlugTouched, setIsSlugTouched] = useState(false);

    // Author Logic
    const [authors, setAuthors] = useState<string[]>([]);
    const [filteredAuthors, setFilteredAuthors] = useState<string[]>([]);
    const [showAuthorsDropdown, setShowAuthorsDropdown] = useState(false);

    useEffect(() => {
        fetchAuthors();
        fetchArticleData();
    }, []);

    const fetchArticleData = async () => {
        setInitialLoading(true);
        try {
            console.log("Fetching regulation with ID:", articleId);
            const response = await ArticleService.getById(articleId);
            console.log("API Response:", response);

            const article = response.data || response;
            console.log("Regulation data:", article);

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

            // Handle existing image - API returns full URL
            if (article.featured_image) {
                console.log("Setting image URL:", article.featured_image);
                setExistingImageUrl(article.featured_image);
                setImagePreview(article.featured_image);
            }

        } catch (err: any) {
            console.error("Error fetching regulation:", err);
            setError(err.message || "فشل تحميل بيانات اللائحة");
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

    useEffect(() => {
        if (status === 'published') {
            if (!gregorianDate || isFutureDate(gregorianDate)) {
                setGregorianDate(getTodayDate());
            }
        }
    }, [status, gregorianDate]);

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

        // Validation
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
            formData.append("_method", "PUT"); // Laravel method override

            if (sectionId) formData.append("section_id", String(sectionId));
            if (featuredImage) formData.append("featured_image", featuredImage);
            if (excerpt) formData.append("excerpt", excerpt);
            if (gregorianDate) formData.append("gregorian_date", gregorianDate);
            if (keywords) formData.append("keywords", keywords);

            await ArticleService.update(Number(articleId), formData);

            setSuccess("تم تحديث اللائحة بنجاح!");

            setTimeout(() => {
                router.push("/admin/governance/regulations");
            }, 1000);

        } catch (err: any) {
            console.error(err);
            setError(err.message || "حدث خطأ أثناء تحديث اللائحة");
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
                        <p className="text-gray-500">جاري تحميل بيانات اللائحة...</p>
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
                        <div>
                            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">تعديل اللائحة</h1>
                            <p className="text-sm text-gray-700 mt-1">قم بتعديل البيانات التالية لتحديث اللائحة</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="px-4 py-2 text-gray-700 bg-white/70 backdrop-blur-md border border-white/60 rounded-lg hover:bg-white transition-colors shadow-sm"
                        >
                            إلغاء
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        >
                            <FiSave size={18} />
                            {loading ? "جاري الحفظ..." : "حفظ التعديلات"}
                        </button>
                    </div>
                </div>
            </section>

            {/* Error/Success Messages */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    <strong>خطأ:</strong> {error}
                </div>
            )}

            {success && (
                <div className="bg-green-50 text-green-600 p-4 rounded-lg border border-green-100 flex items-center">
                    <span className="font-medium">نجاح:</span>&nbsp;{success}
                </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Main Content Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Info */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
                        <h2 className="text-lg font-semibold text-gray-800 border-b pb-3 mb-4 flex items-center gap-2">
                            <FiFileText className="text-primary" />
                            بيانات اللائحة الأساسية
                        </h2>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">عنوان اللائحة <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={title}
                                onChange={handleTitleChange}
                                placeholder="أدخل عنوان اللائحة هنا..."
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
                                    placeholder="رابط-اللائحة-text-here"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-right focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    required
                                />
                            </div>
                            <p className="text-xs text-gray-400">يستخدم في رابط الصفحة URL. يجب أن يكون بالإنجليزية وبدون مسافات.</p>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">محتوى اللائحة <span className="text-red-500">*</span></label>
                            <RichTextEditor value={content} onChange={setContent} />
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
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value as "draft" | "published")}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-white"
                            >
                                <option value="published">منشور (Published)</option>
                                <option value="draft">مسودة (Draft)</option>
                            </select>
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
                            <p className="text-xs text-gray-400">ملاحظة: يمكن نشر اللوائح بتاريخ مستقبلي باعتبارها لائحة مجدولة.</p>
                        </div>
                    </div>

                    {/* Author & Categorization */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
                        <h2 className="text-lg font-semibold text-gray-800 border-b pb-3 mb-4 flex items-center gap-2">
                            <FiLayers className="text-primary" />
                            التصنيف والمؤلف
                        </h2>

                        {/* Fixed Section Display */}
                        <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-blue-900">القسم:</span>
                                <span className="text-sm font-bold text-blue-700">اللوائح</span>
                            </div>
                            <p className="text-xs text-blue-600 mt-1">محدد تلقائياً - لا يمكن تغييره</p>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">اسم الكاتب <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={authorName}
                                    onChange={handleAuthorChange}
                                    onFocus={() => setShowAuthorsDropdown(true)}
                                    onBlur={() => setTimeout(() => setShowAuthorsDropdown(false), 200)}
                                    placeholder="ابدأ بكتابة اسم الكاتب..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all pl-10"
                                    required
                                    autoComplete="off"
                                />
                                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                                {/* Suggestions Dropdown */}
                                {showAuthorsDropdown && filteredAuthors.length > 0 && (
                                    <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-100 rounded-lg shadow-lg max-h-48 overflow-y-auto admin-scrollbar">
                                        {filteredAuthors.map((author, index) => (
                                            <li
                                                key={index}
                                                onMouseDown={() => {
                                                    handleAuthorSelect(author);
                                                }}
                                                className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm text-gray-700 transition-colors"
                                            >
                                                {author}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
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
