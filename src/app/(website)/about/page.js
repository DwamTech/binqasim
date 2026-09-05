"use client";
import HeroSection from "../../../components/HeroSection";
import AboutInfo from "../../../components/AboutInfo";
import styles from "./page.module.css";

export default function AboutPage() {
  return (
    <main className={styles.main} dir="ltr">
      <HeroSection
        title="عـن الـوقــف"
        imageSrc="/باب_وكسوة_الكعبة.jpg"
        imageAlt="عن الوقف"
        align="center"
        fontSize="clamp(100px, 20vw, 150px)"
        titleFontSize="clamp(64px, 12vw, 100px)"
        textShadow="0 20px 40px rgba(0,0,0,0.6)"
      />

      <section className={styles.introSection}>
        <div className={styles.introInner}>
          <h1 className={styles.basmala}>بِسْمِ ٱللّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</h1>
          <h2 className={styles.introHeading}>قال الله تعالى:</h2>
          <p className={styles.quote}>
            ﴿ وَالَّذِينَ جَاءُوا مِنْ بَعْدِهِمْ يَقُولُونَ رَبَّنَا اغْفِرْ
            لَنَا ولِإِخْوَانِنَا الَّذِينَ سَبَقُونَا بِالْإِيمَانِ
            ولَا تَجْعَلْ فِي قُلُوبِنَا غِلًّا لِلَّذِينَ آمَنُوا رَبَّنَا
            إِنَّكَ رَءُوفٌ رَحِيمٌ ﴾ [الحشر:10]
          </p>
          <h3 className={styles.introHeading}>وقال رسولُ الله ﷺ:</h3>
          <p className={styles.hadith}>
            إِذَا مَاتَ ابنُ آدم انْقَطَعَ عَنْهُ عَمَلُهُ إِلَّا مِنْ ثَلَاثٍ:
            صَدَقَةٍ جَارِيَةٍ، أو عِلْمٍ يُنْتَفَعُ بِهِ، أَوْ وَلَدٍ صَالِحٍ
            يَدْعُو لَهُ. [رَوَاهُ مُسْلِمٌ]
          </p>
        </div>
      </section>

      <AboutInfo />
    </main>
  );
}
