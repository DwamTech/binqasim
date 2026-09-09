"use client";
import { useState, useEffect } from "react";
import HeroSection from "../../../components/HeroSection";
import { FaStar, FaRegStar, FaStarHalfAlt, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import styles from "./page.module.css";
import { PublicFeedbackService } from "@/services/publicFeedbackService";
import { useLanguage } from "../../../contexts/LanguageContext";

const translations = {
  ar: { title: "تقييم رضا المستفيدين", intro: "من أهم أسباب تطوير خدماتنا أن نستمع إلى مستوى رضا المستفيدين، حتى نبني خططًا أكثر تميزًا واستجابة لاحتياجاتكم.", thanks: "شكرًا لتقييمك! ⭐", add: "أضف تقييمك", loading: "جاري التحميل...", choose: "اختيار التقييم", rating: "تقييم", of: "من 5", sending: "جاري الإرسال...", average: "متوسط التقييم", count: "عدد التقييمات:", success: "شكرًا لك! تم تسجيل تقييمك بنجاح", wait: "يرجى الانتظار قليلًا قبل التقييم مرة أخرى", valid: "يرجى اختيار تقييم صحيح (1-5)", error: "حدث خطأ أثناء إرسال التقييم" },
  en: { title: "Beneficiary Satisfaction Survey", intro: "Listening to beneficiary satisfaction helps us improve our services and build plans that better respond to your needs.", thanks: "Thank you for rating us! ⭐", add: "Add your rating", loading: "Loading...", choose: "Choose a rating", rating: "Rating", of: "out of 5", sending: "Submitting...", average: "Average rating", count: "Number of ratings:", success: "Thank you! Your rating was submitted successfully", wait: "Please wait before rating again", valid: "Please choose a valid rating (1–5)", error: "An error occurred while submitting your rating" },
  fa: { title: "سنجش رضایت بهره‌مندان", intro: "شنیدن میزان رضایت بهره‌مندان به ما کمک می‌کند خدمات را بهبود دهیم و برنامه‌هایی پاسخ‌گوتر به نیازهای شما بسازیم.", thanks: "از امتیاز شما سپاسگزاریم! ⭐", add: "امتیاز دهید", loading: "در حال بارگذاری...", choose: "انتخاب امتیاز", rating: "امتیاز", of: "از ۵", sending: "در حال ارسال...", average: "میانگین امتیاز", count: "تعداد امتیازها:", success: "سپاسگزاریم! امتیاز شما با موفقیت ثبت شد", wait: "لطفاً پیش از امتیازدهی دوباره کمی صبر کنید", valid: "امتیاز معتبر از ۱ تا ۵ انتخاب کنید", error: "هنگام ارسال امتیاز خطایی رخ داد" },
};

export default function SatisfactionPage() {
  const { language } = useLanguage();
  const text = translations[language];
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [average, setAverage] = useState(0);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [hasRated, setHasRated] = useState(false);

  const stars = [1, 2, 3, 4, 5];

  // Fetch current rating stats on mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const stats = await PublicFeedbackService.getRatingStats();
        setAverage(stats.average_rating || 0);
        setCount(stats.rating_count || 0);
      } catch (error) {
        console.error("Failed to fetch rating stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Auto-hide toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Handle star click
  const handleRating = async (value) => {
    if (submitting || hasRated) return;

    setRating(value);
    setSubmitting(true);

    try {
      const response = await PublicFeedbackService.submitRating(value);

      // Update stats with new values
      setAverage(response.average_rating);
      setCount(response.rating_count);
      setHasRated(true);

      setToast({
        type: "success",
        message: text.success,
      });
    } catch (error) {
      setRating(0); // Reset rating on error

      if (error.rateLimited) {
        setToast({
          type: "error",
          message: error.message || text.wait,
        });
      } else if (error.validationErrors) {
        setToast({
          type: "error",
          message: text.valid,
        });
      } else {
        setToast({
          type: "error",
          message: error.message || text.error,
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Render average stars
  const renderAverageStars = () => {
    const fullStars = Math.floor(average);
    const hasHalf = average % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

    return (
      <>
        {[...Array(fullStars)].map((_, i) => (
          <FaStar key={`full-${i}`} className={styles.avgStar} />
        ))}
        {hasHalf && <FaStarHalfAlt key="half" className={styles.avgStarHalf} />}
        {[...Array(emptyStars)].map((_, i) => (
          <FaRegStar key={`empty-${i}`} className={styles.avgStarEmpty} />
        ))}
      </>
    );
  };

  return (
    <main className={styles.main}>
      {/* Toast Notification */}
      {toast && (
        <div className={`${styles.toast} ${styles[`toast${toast.type}`]}`}>
          {toast.type === "success" ? <FaCheckCircle /> : <FaTimesCircle />}
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className={styles.toastClose}>×</button>
        </div>
      )}

      <HeroSection
        title={text.title}
        imageSrc="/75884be2-3e9d-4126-ace3-770ef0c2f071_16x9_1200x676.webp"
        imageAlt={text.title}
        align="center"
      />

      <section className={styles.introSection}>
        <div className={styles.introCard}>
          <h2 className={styles.introTitle}>{text.title}</h2>
          <p className={styles.introText}>{text.intro}</p>
        </div>
      </section>

      <section className={styles.ratingSection}>
        <div className={styles.ratingInner}>
          {/* Rating Header */}
          <div className={styles.ratingHeader}>
            <span className={styles.label}>
              {hasRated ? text.thanks : text.add}
            </span>
          </div>

          {/* Average Stars Display */}
          <div className={styles.placeholderStars} aria-hidden="true">
            {loading ? (
              <span className={styles.loadingText}>{text.loading}</span>
            ) : (
              renderAverageStars()
            )}
          </div>

          {/* Interactive Stars */}
          <div
            className={`${styles.stars} ${hasRated ? styles.starsDisabled : ""} ${submitting ? styles.starsSubmitting : ""}`}
            role="radiogroup"
            aria-label={text.choose}
          >
            {stars.map((i) => {
              const active = (hover || rating) >= i;
              return (
                <button
                  key={i}
                  type="button"
                  className={`${styles.starBtn} ${active ? styles.starBtnActive : ""}`}
                  onMouseEnter={() => !hasRated && !submitting && setHover(i)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => handleRating(i)}
                  disabled={hasRated || submitting}
                  aria-label={`${text.rating} ${i} ${text.of}`}
                  aria-pressed={rating === i}
                >
                  {active ? (
                    <FaStar className={styles.starActive} />
                  ) : (
                    <FaRegStar className={styles.star} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Submitting indicator */}
          {submitting && (
            <div className={styles.submittingOverlay}>
              <span className={styles.spinner}></span>
              <span>{text.sending}</span>
            </div>
          )}

          {/* Rating Meta */}
          <div className={styles.ratingMeta}>
            <span className={styles.avg}>
              <FaStarHalfAlt size={16} />
              {text.average} {loading ? "..." : average.toFixed(1)} / 5
            </span>
            <span className={styles.sep} />
            <span className={styles.count}>
              {text.count} {loading ? "..." : count}
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}
