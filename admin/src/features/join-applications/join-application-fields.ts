import type { JoinApplicationType } from "./join-applications.contracts";

export type JoinField = {
  name: string;
  label: string;
  type?:
    | "text"
    | "email"
    | "tel"
    | "date"
    | "number"
    | "password"
    | "textarea"
    | "select"
    | "file"
    | "checkbox";
  required?: boolean;
  options?: readonly { value: string; label: string }[];
  accept?: string;
  pattern?: string;
  min?: number;
  max?: number;
  help?: string;
  sensitive?: boolean;
  showWhen?: { field: string; value: string };
};

const genders = [
  { value: "male", label: "ذكر" },
  { value: "female", label: "أنثى" },
] as const;

const yesNo = [
  { value: "1", label: "نعم" },
  { value: "0", label: "لا" },
] as const;

const accountFields: readonly JoinField[] = [
  { name: "account_username", label: "اسم المستخدم", required: true },
  {
    name: "password",
    label: "كلمة المرور",
    type: "password",
    required: true,
    sensitive: true,
    min: 8,
    help: "اتركها فارغة أثناء التعديل للاحتفاظ بكلمة المرور الحالية.",
  },
  {
    name: "password_confirmation",
    label: "تأكيد كلمة المرور",
    type: "password",
    required: true,
    sensitive: true,
    min: 8,
  },
];

const nationalId: JoinField = {
  name: "national_id",
  label: "رقم الهوية",
  required: true,
  pattern: "[0-9]{10}",
  help: "10 أرقام بالضبط.",
};

const phone: JoinField = {
  name: "phone",
  label: "رقم الجوال",
  type: "tel",
  required: true,
  pattern: "05[0-9]{8}",
  help: "10 أرقام ويبدأ بـ 05.",
};

export const joinApplicationFields: Record<
  JoinApplicationType,
  readonly JoinField[]
> = {
  members: [
    { name: "full_name", label: "الاسم الرباعي", required: true },
    nationalId,
    { name: "birth_date", label: "تاريخ الميلاد", type: "date", required: true },
    { name: "gender", label: "الجنس", type: "select", options: genders, required: true },
    { name: "education_level", label: "المؤهل الدراسي", required: true },
    { name: "specialization", label: "التخصص", required: true },
    { name: "city", label: "المدينة", required: true },
    { name: "governorate", label: "المحافظة", required: true },
    { name: "employer", label: "جهة العمل" },
    phone,
    { name: "email", label: "البريد الإلكتروني", type: "email", required: true },
    ...accountFields,
    {
      name: "membership_type",
      label: "نوع العضوية",
      type: "select",
      required: true,
      options: [
        { value: "active", label: "عامل" },
        { value: "affiliate", label: "منتسب" },
        { value: "honorary", label: "فخري" },
        { value: "distinguished", label: "شرفي" },
      ],
    },
    { name: "qualification_file", label: "آخر مؤهل", type: "file", accept: ".pdf,.jpg,.jpeg,.png,.webp", required: true },
    { name: "cv", label: "السيرة الذاتية", type: "file", accept: ".pdf,.doc,.docx", required: true },
    { name: "identity_image", label: "صورة الهوية", type: "file", accept: ".jpg,.jpeg,.png,.webp", required: true },
    { name: "personal_photo", label: "الصورة الشخصية", type: "file", accept: ".jpg,.jpeg,.png,.webp", required: true },
  ],
  volunteers: [
    { name: "full_name", label: "الاسم بالكامل", required: true },
    nationalId,
    { name: "birth_date", label: "تاريخ الميلاد", type: "date", required: true },
    { name: "gender", label: "الجنس", type: "select", options: genders, required: true },
    { name: "nationality", label: "الجنسية", required: true },
    { name: "social_status", label: "الحالة الاجتماعية", required: true },
    { name: "blood_type", label: "فصيلة الدم", required: true },
    phone,
    { name: "email", label: "البريد الإلكتروني", type: "email", required: true },
    ...accountFields,
    { ...phone, name: "emergency_phone", label: "جوال الطوارئ" },
    { name: "region", label: "المنطقة", required: true },
    { name: "city", label: "المدينة", required: true },
    { name: "identity_image", label: "صورة الهوية", type: "file", accept: ".jpg,.jpeg,.png,.webp", required: true },
    { name: "personal_photo", label: "الصورة الشخصية", type: "file", accept: ".jpg,.jpeg,.png,.webp", required: true },
  ],
  guides: [
    { name: "full_name", label: "الاسم بالكامل", required: true },
    nationalId,
    { name: "birth_date", label: "تاريخ الميلاد", type: "date", required: true },
    { name: "gender", label: "الجنس", type: "select", options: genders, required: true },
    { name: "blood_type", label: "فصيلة الدم", required: true },
    phone,
    { name: "email", label: "البريد الإلكتروني", type: "email", required: true },
    ...accountFields,
    { name: "education_level", label: "المستوى التعليمي", required: true },
    { name: "academic_specialization", label: "التخصص العلمي", required: true },
    { name: "skills", label: "المهارات", type: "textarea", required: true },
    { name: "languages", label: "اللغات", type: "textarea", required: true },
    { name: "years_of_experience", label: "سنوات الخبرة", type: "number", min: 0, max: 80, required: true },
    { name: "experience_field", label: "مجال الخبرة", required: true },
    { name: "experience_scope", label: "نطاق الخبرة", type: "textarea", required: true },
    {
      name: "previous_guiding_audience",
      label: "خبرة الإرشاد السابقة",
      type: "select",
      required: true,
      options: [
        { value: "none", label: "لم يعمل من قبل" },
        { value: "individual", label: "أفراد" },
        { value: "group", label: "مجموعة" },
        { value: "company", label: "شركة" },
        { value: "campaign", label: "حملة" },
        { value: "all", label: "جميع ما سبق" },
      ],
    },
    { name: "is_employed", label: "موظف حاليًا", type: "select", required: true, options: yesNo },
    { name: "current_work_type", label: "نوع العمل الحالي", required: true, showWhen: { field: "is_employed", value: "1" } },
    { name: "current_job", label: "العمل الحالي", required: true, showWhen: { field: "is_employed", value: "1" } },
    { name: "affiliated_entity", label: "الجهة التابع لها", required: true, showWhen: { field: "is_employed", value: "1" } },
    { name: "tour_guidance_scope", label: "نطاق الإرشاد السياحي", required: true },
    { name: "tour_routes", label: "مسارات الجولات السياحية", type: "textarea", required: true },
    { name: "tours_count", label: "عدد الجولات المنفذة", type: "number", min: 0, max: 100000, required: true },
    { name: "tour_scope", label: "نطاق الجولات السياحية", type: "textarea", required: true },
    { name: "has_tour_guide_license", label: "يمتلك رخصة إرشاد", type: "select", required: true, options: yesNo },
    { name: "tour_guide_license_expires_at", label: "انتهاء الرخصة", type: "date", required: true, showWhen: { field: "has_tour_guide_license", value: "1" } },
    { name: "cv", label: "السيرة الذاتية", type: "file", accept: ".pdf,.doc,.docx", required: true },
    { name: "identity_image", label: "صورة الهوية", type: "file", accept: ".jpg,.jpeg,.png,.webp", required: true },
    { name: "personal_photo", label: "الصورة الشخصية", type: "file", accept: ".jpg,.jpeg,.png,.webp", required: true },
    { name: "tour_guide_license_file", label: "ملف الرخصة", type: "file", accept: ".pdf,.jpg,.jpeg,.png,.webp", required: true, showWhen: { field: "has_tour_guide_license", value: "1" } },
  ],
  jobs: [
    { name: "full_name", label: "الاسم الرباعي", required: true },
    nationalId,
    { name: "birth_date", label: "تاريخ الميلاد", type: "date", required: true },
    { name: "gender", label: "الجنس", type: "select", options: genders, required: true },
    { name: "nationality", label: "الجنسية", required: true },
    phone,
    { name: "email", label: "البريد الإلكتروني", type: "email", required: true },
    ...accountFields,
    { name: "city", label: "المدينة", required: true },
    { name: "governorate", label: "المحافظة", required: true },
    { name: "education_level", label: "المؤهل الدراسي", required: true },
    { name: "specialization", label: "التخصص", required: true },
    { name: "years_of_experience", label: "سنوات الخبرة", required: true },
    { name: "current_employer", label: "جهة العمل الحالية" },
    { name: "desired_job_title", label: "المسمى المطلوب", required: true },
    { name: "why_join", label: "دوافع الانضمام", type: "textarea", required: true },
    { name: "cv", label: "السيرة الذاتية", type: "file", accept: ".pdf,.doc,.docx" },
    { name: "national_id_image", label: "صورة الهوية", type: "file", accept: ".jpg,.jpeg,.png,.webp" },
    { name: "latest_qualification_file", label: "آخر مؤهل", type: "file", accept: ".pdf,.jpg,.jpeg,.png,.webp" },
    { name: "personal_photo", label: "الصورة الشخصية", type: "file", accept: ".jpg,.jpeg,.png,.webp", required: true },
  ],
};
