"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";
import { FiBook, FiArrowRight } from "react-icons/fi";
import BookForm from "@/components/admin/BookForm";

export default function EditBookPage() {
    const router = useRouter();
    const params = useParams();
    const bookId = params.id as string;

    const handleSuccess = () => {
        router.push("/admin/books");
    };

    const handleCancel = () => {
        router.back();
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <FiBook className="text-primary" size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">تعديل الكتاب</h1>
                            <p className="text-sm text-gray-500 mt-1">تحديث معلومات الكتاب</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => router.push('/admin/books')}
                        className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors"
                    >
                        <FiArrowRight size={18} />
                        <span>الرجوع لقائمة الكتب</span>
                    </button>
                </div>
            </div>

            {/* Book Form */}
            <BookForm
                mode="edit"
                bookId={bookId}
                onSuccess={handleSuccess}
                onCancel={handleCancel}
            />
        </div>
    );
}
