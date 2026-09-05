"use client";
import React, { useRef } from "react";
import { FiFileText, FiSave } from "react-icons/fi";
import ContentEditorPage from "@/components/admin/ContentEditorPage";

export default function AboutWaqfPage() {
    const saveRef = useRef<(() => void | Promise<void>) | null>(null);
    return (
        <div className="space-y-6">
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
                            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">عن الوقف</h1>
                            <p className="text-sm text-gray-700 mt-1">إدارة محتوى صفحة التعريف بالوقف</p>
                        </div>
                    </div>
                    <button
                        onClick={() => saveRef.current && saveRef.current()}
                        className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
                    >
                        <FiSave size={18} />
                        حفظ التعديلات
                    </button>
                </div>
            </section>

            <ContentEditorPage
                pageTitle="عن الوقف"
                contentKey="about_waqf"
                description="إدارة محتوى صفحة 'عن الوقف' الظاهرة في الموقع التعريفي."
                hideHeader
                saveRef={saveRef as React.MutableRefObject<() => Promise<void>>}
            />
        </div>
    );
}
