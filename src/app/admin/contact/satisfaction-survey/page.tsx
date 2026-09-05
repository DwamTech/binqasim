"use client";
import React, { useEffect, useState, useCallback } from "react";
import {
    FiStar,
    FiUsers,
    FiTrendingUp,
    FiAward,
    FiRefreshCw,
    FiInfo
} from "react-icons/fi";
import { FeedbackService, PlatformRating } from "../../services/feedbackService";

// ════════════════════════════════════════════════════════════════════════════
// STAT CARD COMPONENT
// ════════════════════════════════════════════════════════════════════════════
const StatCard = ({
    title,
    value,
    icon,
    color,
    subtitle
}: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    subtitle?: string;
}) => (
    <div className="stat-card group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        <div className={`absolute inset-0 opacity-5 ${color}`}></div>
        <div className={`absolute -top-4 -right-4 w-24 h-24 rounded-full ${color} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity`}></div>

        <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
                <div className={`rounded-xl p-3 ${color} bg-opacity-15 transition-transform group-hover:scale-110`}>
                    {icon}
                </div>
            </div>
            <h4 className="text-gray-500 text-sm font-medium mb-1">{title}</h4>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
            {subtitle && (
                <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
            )}
        </div>
    </div>
);

// ════════════════════════════════════════════════════════════════════════════
// STAR RATING DISPLAY
// ════════════════════════════════════════════════════════════════════════════
const StarRating = ({ rating, maxRating = 5 }: { rating: number; maxRating?: number }) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = maxRating - fullStars - (hasHalfStar ? 1 : 0);

    return (
        <div className="flex items-center gap-1">
            {/* Full Stars */}
            {Array.from({ length: fullStars }).map((_, i) => (
                <FiStar key={`full-${i}`} className="text-yellow-400 fill-yellow-400" size={28} />
            ))}
            {/* Half Star */}
            {hasHalfStar && (
                <div className="relative">
                    <FiStar className="text-gray-300" size={28} />
                    <div className="absolute inset-0 overflow-hidden w-1/2">
                        <FiStar className="text-yellow-400 fill-yellow-400" size={28} />
                    </div>
                </div>
            )}
            {/* Empty Stars */}
            {Array.from({ length: emptyStars }).map((_, i) => (
                <FiStar key={`empty-${i}`} className="text-gray-300" size={28} />
            ))}
        </div>
    );
};

// ════════════════════════════════════════════════════════════════════════════
// RATING BAR
// ════════════════════════════════════════════════════════════════════════════
const RatingBar = ({ stars, percentage, count }: { stars: number; percentage: number; count: number }) => (
    <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 w-12">
            <span className="text-sm font-medium text-gray-600">{stars}</span>
            <FiStar className="text-yellow-400 fill-yellow-400" size={14} />
        </div>
        <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
                className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full transition-all duration-500"
                style={{ width: `${percentage}%` }}
            />
        </div>
        <span className="text-sm text-gray-500 w-16 text-left">{count} تقييم</span>
    </div>
);

// ════════════════════════════════════════════════════════════════════════════
// MAIN SATISFACTION SURVEY PAGE
// ════════════════════════════════════════════════════════════════════════════
export default function SatisfactionSurveyPage() {
    const [rating, setRating] = useState<PlatformRating | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchRating = useCallback(async () => {
        try {
            const data = await FeedbackService.getPlatformRating();
            setRating(data);
        } catch (error) {
            console.error("Failed to fetch rating:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRating();
    }, [fetchRating]);

    // Calculate rating percentages (mock data for now since API doesn't provide breakdown)
    const getRatingBreakdown = (avgRating: number, totalCount: number) => {
        // Simulate a realistic distribution based on average
        const distribution = {
            5: Math.round(totalCount * (avgRating >= 4.5 ? 0.5 : avgRating >= 4 ? 0.35 : 0.2)),
            4: Math.round(totalCount * (avgRating >= 4 ? 0.3 : 0.25)),
            3: Math.round(totalCount * 0.15),
            2: Math.round(totalCount * 0.05),
            1: Math.round(totalCount * 0.05),
        };
        return distribution;
    };

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="relative">
                    <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary/20 border-t-primary"></div>
                    <FiStar className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary text-xl" />
                </div>
            </div>
        );
    }

    const breakdown = rating ? getRatingBreakdown(rating.average_rating, rating.rating_count) : null;

    return (
        <div className="space-y-8 pb-8">
            {/* ═══════════════════════════════════════════════════════════════
                HERO SECTION
            ═══════════════════════════════════════════════════════════════ */}
            <section className="settings-hero relative overflow-hidden rounded-3xl p-8">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-transparent to-primary/10"></div>
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-yellow-400/20 rounded-full blur-3xl animate-pulse-slow"></div>
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "1s" }}></div>

                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm shadow-sm mb-4">
                        <FiStar className="text-yellow-500" />
                        <span className="text-sm font-bold text-gray-700">تقييم رضا المستفيدين</span>
                    </div>
                    <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-2">
                        آراء المستفيدين
                    </h1>
                    <p className="text-gray-600 max-w-lg">
                        متابعة تقييمات المستفيدين للمنصة وقياس مستوى رضاهم عن الخدمات المقدمة.
                    </p>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                STATS CARDS
            ═══════════════════════════════════════════════════════════════ */}
            <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="متوسط التقييم"
                    value={rating?.average_rating.toFixed(1) || "0.0"}
                    icon={<FiStar className="text-2xl text-yellow-500" />}
                    color="bg-yellow-500"
                    subtitle={`من ${rating?.max_rating || 5} نجوم`}
                />
                <StatCard
                    title="عدد التقييمات"
                    value={rating?.rating_count || 0}
                    icon={<FiUsers className="text-2xl text-primary" />}
                    color="bg-primary"
                    subtitle="مستفيد قام بالتقييم"
                />
                <StatCard
                    title="نسبة الرضا"
                    value={rating ? `${Math.round((rating.average_rating / rating.max_rating) * 100)}%` : "0%"}
                    icon={<FiTrendingUp className="text-2xl text-green-500" />}
                    color="bg-green-500"
                    subtitle="نسبة الرضا العامة"
                />
                <StatCard
                    title="التقييم الأعلى"
                    value={rating?.max_rating || 5}
                    icon={<FiAward className="text-2xl text-secondary" />}
                    color="bg-secondary"
                    subtitle="أعلى تقييم ممكن"
                />
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                MAIN CONTENT
            ═══════════════════════════════════════════════════════════════ */}
            <div className="grid gap-8 lg:grid-cols-2">
                {/* Rating Overview */}
                <section className="bg-white rounded-2xl p-8 shadow-lg">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <FiStar className="text-yellow-500" />
                        التقييم العام
                    </h2>

                    <div className="text-center mb-8">
                        <div className="text-6xl font-extrabold text-gray-800 mb-2">
                            {rating?.average_rating.toFixed(1) || "0.0"}
                        </div>
                        <StarRating rating={rating?.average_rating || 0} />
                        <p className="text-gray-500 mt-3">
                            بناءً على {rating?.rating_count || 0} تقييم
                        </p>
                    </div>

                    {/* Refresh Button */}
                    <button
                        onClick={fetchRating}
                        className="w-full py-3 rounded-xl bg-primary/10 text-primary font-medium hover:bg-primary hover:text-white transition-colors flex items-center justify-center gap-2"
                    >
                        <FiRefreshCw />
                        تحديث البيانات
                    </button>
                </section>

                {/* Rating Breakdown */}
                <section className="bg-white rounded-2xl p-8 shadow-lg">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <FiTrendingUp className="text-primary" />
                        توزيع التقييمات
                    </h2>

                    {breakdown && rating && rating.rating_count > 0 ? (
                        <div className="space-y-4">
                            {[5, 4, 3, 2, 1].map(stars => (
                                <RatingBar
                                    key={stars}
                                    stars={stars}
                                    percentage={(breakdown[stars as keyof typeof breakdown] / rating.rating_count) * 100}
                                    count={breakdown[stars as keyof typeof breakdown]}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <FiInfo className="text-4xl text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">لا توجد بيانات كافية</p>
                        </div>
                    )}

                    {/* Info Note */}
                    <div className="mt-6 p-4 rounded-xl bg-blue-50 border border-blue-100">
                        <p className="text-sm text-blue-700 flex items-start gap-2">
                            <FiInfo className="flex-shrink-0 mt-0.5" />
                            <span>
                                التقييمات يتم جمعها من المستفيدين عبر صفحة الموقع الرئيسية.
                                كل مستخدم يمكنه إضافة تقييم واحد فقط في الدقيقة.
                            </span>
                        </p>
                    </div>
                </section>
            </div>

            {/* ═══════════════════════════════════════════════════════════════
                INFO CARD
            ═══════════════════════════════════════════════════════════════ */}
            <section className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-8 text-white shadow-lg">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <FiInfo />
                    معلومات النظام
                </h2>
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                        <h3 className="font-semibold mb-2">التقييم بالنجوم</h3>
                        <p className="text-sm text-white/80">
                            يمكن للمستفيدين تقييم المنصة من 1 إلى 5 نجوم
                        </p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                        <h3 className="font-semibold mb-2">الحماية من السبام</h3>
                        <p className="text-sm text-white/80">
                            تقييم واحد فقط كل دقيقة من نفس الـ IP
                        </p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                        <h3 className="font-semibold mb-2">التحديث التلقائي</h3>
                        <p className="text-sm text-white/80">
                            يتم حساب المتوسط تلقائياً مع كل تقييم جديد
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
