"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiBook, FiArrowRight } from "react-icons/fi";
import BookForm from "@/components/admin/BookForm";

export default function CreateBookPage() {
    const router = useRouter();

    const handleSuccess = () => {
        router.push("/admin/books");
    };

    const handleCancel = () => {
        router.back();
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
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <FiBook className="text-primary" size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">إضافة كتاب جديد</h1>
                            <p className="text-sm text-gray-700 mt-1">أضف كتاباً جديداً إلى المكتبة بسهولة وبشكل احترافي</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        {/* <a href="#book-form" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                            البدء الآن
                        </a> */}
                        <button
                            onClick={() => router.push('/admin/books')}
                            className="flex items-center gap-2 px-4 py-2 text-white bg-secondary rounded-lg hover:opacity-90 transition-colors"
                        >
                            <FiArrowRight size={18} />
                            <span>الرجوع لقائمة الكتب</span>
                        </button>
                    </div>
                </div>
            </section>

            {/* Book Form */}
            <div id="book-form">
                <BookForm
                    mode="create"
                    onSuccess={handleSuccess}
                    onCancel={handleCancel}
                />
            </div>
        </div>
    );
}
