"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
// Import global styles for admin to ensure Tailwind works
import "./admin.css";
import "./print.css";
// We don't import the root layout's css to avoid conflict
import { Cairo } from "next/font/google";
import Sidebar from "../../components/admin/Sidebar";
import Header from "../../components/admin/Header";
import { ToastProvider } from "../../components/admin/ToastProvider";
import AdminFooter from "../../components/admin/AdminFooter";

const cairo = Cairo({
    subsets: ["arabic"],
    weight: ["300", "400", "500", "600", "700"],
    display: "swap",
});

import { PendingCountsProvider } from "../../contexts/PendingCountsContext";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const checkToken = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                router.push("/login");
                return;
            }

            try {
                const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
                const response = await fetch(`${API_URL}/validate-token`, {
                    headers: {
                        'Authorization': 'Bearer ' + token,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                });

                if (response.status === 401) {
                    localStorage.removeItem("token");
                    router.push("/login");
                }
            } catch (error) {
                console.error("Token validation check failed", error);
            }
        };

        checkToken();
        const intervalId = setInterval(checkToken, 30000);

        return () => clearInterval(intervalId);
    }, [router]);

    return (
        <html lang="ar" dir="rtl">
            <head>
                <title>لوحة التحكم</title>
            </head>
            <body className={`${cairo.className} bg-gray-50`}>
                <ToastProvider>
                    <PendingCountsProvider>
                        <div className="flex min-h-screen">
                            {/* Sidebar */}
                            <Sidebar
                                isOpen={isSidebarOpen}
                                onClose={() => setIsSidebarOpen(false)}
                            />

                            {/* Main Content Info */}
                            <div className="flex flex-1 flex-col transition-all duration-300">
                                <Header onMenuClick={() => setIsSidebarOpen(true)} />

                                <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
                                    {children}
                                </main>
                                <div className="h-16 md:h-20"></div>
                                <AdminFooter />
                            </div>
                        </div>
                    </PendingCountsProvider>
                </ToastProvider>
            </body>
        </html>
    );
}
