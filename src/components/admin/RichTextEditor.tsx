"use client";
import React from 'react';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

// Dynamic import for SSR disabled
const ReactQuill = dynamic(() => import('react-quill-new'), {
    ssr: false,
    loading: () => <div className="h-64 bg-gray-50 flex items-center justify-center">جاري تحميل المحرر...</div>
});

interface RichTextEditorProps {
    value: string;
    onChange: (val: string) => void;
}

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, 4, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'align': [] }],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link', 'image'],
            ['clean']
        ],
    };

    return (
        <div className="rich-editor-wrapper">
            {/* Custom styling wrapper if needed */}
            <style jsx global>{`
                .ql-editor {
                    min-height: 300px;
                    direction: rtl;
                    text-align: right;
                    font-family: 'Cairo', sans-serif;
                    font-size: 16px;
                }
                .ql-toolbar {
                    direction: ltr;
                    border-top-left-radius: 0.5rem;
                    border-top-right-radius: 0.5rem;
                }
                .ql-container {
                     border-bottom-left-radius: 0.5rem;
                     border-bottom-right-radius: 0.5rem;
                     font-family: 'Cairo', sans-serif;
                }
                
                /* Fix RTL List Items */
                .ql-editor ol, .ql-editor ul {
                    padding-left: 0;
                    padding-right: 2em; /* مسافة للترقيم */
                }
                .ql-editor li {
                    padding-right: 0.5em; /* تباعد بسيط بين الرقم والنص */
                }
                /* محاذاة النص والاتجاه */
                .ql-editor p, .ql-editor ol, .ql-editor ul, .ql-editor pre, .ql-editor blockquote, .ql-editor h1, .ql-editor h2, .ql-editor h3, .ql-editor h4, .ql-editor h5, .ql-editor h6 {
                    text-align: right;
                    direction: rtl;
                }
                /* تصحيح اتجاه الأرقام والنقاط إذا كانت تظهر على اليسار */
                .ql-editor .ql-align-center { text-align: center; }
                .ql-editor .ql-align-justify { text-align: justify; }
                .ql-editor .ql-align-left { text-align: left; direction: ltr; } /* للسماح بالإنجليزية */
            `}</style>
            <ReactQuill
                theme="snow"
                value={value}
                onChange={onChange}
                modules={modules}
                className="bg-white rounded-lg shadow-sm"
            />
        </div>
    );
}
