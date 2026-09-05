"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FiMail, FiLock } from "react-icons/fi";
import styles from "./login.module.css";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "فشل تسجيل الدخول");
            }

            // Save token and user data to localStorage
            if (data.token) {
                localStorage.setItem("token", data.token);
                if (data.user) {
                    localStorage.setItem("user", JSON.stringify(data.user));
                }
                // Redirect to admin dashboard
                router.push("/admin");
            } else {
                throw new Error("لم يتم استلام التوكن من السيرفر");
            }
        } catch (err) {
            setError(err.message || "حدث خطأ أثناء تسجيل الدخول");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.loginContainer}>
            <div className={styles.loginCard}>
                <div className={styles.logoSection}>
                    <Image
                        src="/Untitled-1-removebg-preview-350x350.png"
                        alt="Logo"
                        width={120}
                        height={120}
                    />
                    <h1 className={styles.title}>تسجيل الدخول</h1>
                    <p className={styles.subtitle}>الوصول إلى لوحة التحكم</p>
                </div>

                <form className={styles.form} onSubmit={handleSubmit}>
                    {error && <div className={styles.error}>{error}</div>}

                    <div className={styles.inputGroup}>
                        <label htmlFor="email" className={styles.label}>
                            البريد الإلكتروني
                        </label>
                        <div className={styles.inputWrapper}>
                            <input
                                id="email"
                                type="email"
                                className={styles.input}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@example.com"
                                required
                                disabled={loading}
                            />
                            <FiMail className={styles.icon} />
                        </div>
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="password" className={styles.label}>
                            كلمة المرور
                        </label>
                        <div className={styles.inputWrapper}>
                            <input
                                id="password"
                                type="password"
                                className={styles.input}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                disabled={loading}
                            />
                            <FiLock className={styles.icon} />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={loading}
                    >
                        {loading ? (
                            <span className={styles.loading}></span>
                        ) : (
                            "تسجيل الدخول"
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
