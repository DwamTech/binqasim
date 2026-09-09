"use client";
import { useState, useEffect } from "react";
import HeroSection from "../../../components/HeroSection";
import { FaStar, FaRegStar, FaStarHalfAlt, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import styles from "./page.module.css";
import { PublicFeedbackService } from "@/services/publicFeedbackService";

export default function SatisfactionPage() {
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
        message: "شكراً لك! تم تسجيل تقييمك بنجاح",
      });
    } catch (error) {
      setRating(0); // Reset rating on error

      if (error.rateLimited) {
        setToast({
          type: "error",
          message: error.message || "يرجى الانتظار قليلاً قبل التقييم مرة أخرى",
        });
      } else if (error.validationErrors) {
        setToast({
          type: "error",
          message: "يرجى اختيار تقييم صحيح (1-5)",
        });
      } else {
        setToast({
          type: "error",
          message: error.message || "حدث خطأ أثناء إرسال التقييم",
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
        title="تقيـيم رضا المستـفيديـن"
        imageSrc="/75884be2-3e9d-4126-ace3-770ef0c2f071_16x9_1200x676.webp"
        imageAlt="تقييم رضا المستفيدين"
        align="center"
      />

      <section className={styles.introSection}>
        <div className={styles.introCard}>
          <h2 className={styles.introTitle}>تقييم رضا المستفيدين</h2>
          <p className={styles.introText}>
            من أهم أسباب نمو قدراتنا ومواجهة تحدياتنا أن نتلقى مدى رضا المستفيدين منّا بكل سرور
            حتى نضع في خططنا المستقبلية ما يميّزنا ويزيد من رضاكم
          </p>
        </div>
      </section>

      <section className={styles.ratingSection}>
        <div className={styles.ratingInner}>
          {/* Rating Header */}
          <div className={styles.ratingHeader}>
            <span className={styles.label}>
              {hasRated ? "شكراً لتقييمك! ⭐" : "اضف تقييمك.."}
            </span>
          </div>

          {/* Average Stars Display */}
          <div className={styles.placeholderStars} aria-hidden="true">
            {loading ? (
              <span className={styles.loadingText}>جاري التحميل...</span>
            ) : (
              renderAverageStars()
            )}
          </div>

          {/* Interactive Stars */}
          <div
            className={`${styles.stars} ${hasRated ? styles.starsDisabled : ""} ${submitting ? styles.starsSubmitting : ""}`}
            role="radiogroup"
            aria-label="اختيار التقييم"
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
                  aria-label={`تقييم ${i} من 5`}
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
              <span>جاري الإرسال...</span>
            </div>
          )}

          {/* Rating Meta */}
          <div className={styles.ratingMeta}>
            <span className={styles.avg}>
              <FaStarHalfAlt size={16} />
              متوسط التقييم {loading ? "..." : average.toFixed(1)} / 5
            </span>
            <span className={styles.sep} />
            <span className={styles.count}>
              عدد التقييمات: {loading ? "..." : count}
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}
