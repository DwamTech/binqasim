"use client";

import { FiExternalLink, FiMapPin } from "react-icons/fi";
import { useLanguage } from "../../contexts/LanguageContext";
import styles from "./LocationMapSection.module.css";

const address = "مملكة البحرين - الرفاع الشرقي (الحجيات) - مجمع 929 - طريق 2914 - مبنى 686أ";
const coordinates = "26.0978,50.5551";
const mapUrl = `https://www.google.com/maps?q=${coordinates}&z=17&output=embed`;
const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(coordinates)}`;

const copy = {
  ar: { eyebrow: "موقع الجمعية", title: "تفضل بزيارتنا", addressLabel: "العنوان", address, directions: "فتح الاتجاهات", mapTitle: "موقع جمعية الآل والأصحاب على الخريطة" },
  en: { eyebrow: "Society location", title: "Come visit us", addressLabel: "Address", address: "Kingdom of Bahrain — East Riffa (Al Hajiyat), Block 929, Road 2914, Building 686A", directions: "Get directions", mapTitle: "Aal & Al Ashab Society location on the map" },
  fa: { eyebrow: "موقعیت بنیاد", title: "به دیدار ما بیایید", addressLabel: "نشانی", address: "پادشاهی بحرین، الرفاع شرقی (الحجیات)، مجتمع 929، جاده 2914، ساختمان 686A", directions: "مسیریابی", mapTitle: "موقعیت بنیاد آل و اصحاب روی نقشه" },
};

export default function LocationMapSection() {
  const { language } = useLanguage();
  const text = copy[language];

  return (
    <section className={styles.section} id="location" aria-labelledby="location-title">
      <div className={styles.heading}>
        <span><FiMapPin aria-hidden />{text.eyebrow}</span>
        <h2 id="location-title">{text.title}</h2>
      </div>
      <div className={styles.mapWrap}>
        <iframe src={mapUrl} title={text.mapTitle} loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade" />
        <div className={styles.addressCard}>
          <span className={styles.pin}><FiMapPin aria-hidden /></span>
          <div><small>{text.addressLabel}</small><address>{text.address}</address></div>
          <a href={directionsUrl} target="_blank" rel="noopener noreferrer">{text.directions}<FiExternalLink aria-hidden /></a>
        </div>
      </div>
    </section>
  );
}
