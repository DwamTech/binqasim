"use client";
import { Cairo } from "next/font/google";
import "../globals.css";

const cairo = Cairo({
    subsets: ["arabic"],
    weight: ["300", "400", "500", "600", "700", "800", "900"],
    display: "swap",
});

export default function LoginLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ar" dir="rtl">
            <head>
                <title>تسجيل الدخول - لوحة التحكم</title>
            </head>
            <body className={cairo.className}>
                {children}
            </body>
        </html>
    );
}
