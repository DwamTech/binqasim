import { clientEnv, type ClientEnvironment } from "@/core/env/client";

export type DashboardModuleCopy = {
  navigation: string;
  singular: string;
  plural: string;
  pages: {
    list: string;
    create: string;
    edit: string;
    detail: string;
  };
};

type PageTitleOverrides = {
  create?: string | undefined;
  edit?: string | undefined;
  detail?: string | undefined;
};

type DashboardModuleLabelEnvironment = Pick<
  ClientEnvironment,
  | "NEXT_PUBLIC_NAV_ARTICLES"
  | "NEXT_PUBLIC_DASHBOARD_MODULE_ARTICLES_LABEL"
  | "NEXT_PUBLIC_DASHBOARD_MODULE_LIBRARY_LABEL"
  | "NEXT_PUBLIC_DASHBOARD_MODULE_DISSERTATIONS_LABEL"
  | "NEXT_PUBLIC_DASHBOARD_MODULE_LISTENING_LABEL"
  | "NEXT_PUBLIC_DASHBOARD_MODULE_HADITH_CARDS_LABEL"
  | "NEXT_PUBLIC_DASHBOARD_MODULE_SCIENTIFIC_FATWAS_LABEL"
  | "NEXT_PUBLIC_DASHBOARD_MODULE_SCIENTIFIC_VIDEOS_LABEL"
  | "NEXT_PUBLIC_DASHBOARD_MODULE_LIBRARY_INDEXES_LABEL"
  | "NEXT_PUBLIC_DASHBOARD_MODULE_COMMENTS_LABEL"
>;

export function resolveDashboardModuleLabels(
  environment: DashboardModuleLabelEnvironment,
) {
  return {
    articles:
      environment.NEXT_PUBLIC_DASHBOARD_MODULE_ARTICLES_LABEL ??
      environment.NEXT_PUBLIC_NAV_ARTICLES,
    library:
      environment.NEXT_PUBLIC_DASHBOARD_MODULE_LIBRARY_LABEL ??
      "المصنَّفات والمكتبة البكرية",
    dissertations:
      environment.NEXT_PUBLIC_DASHBOARD_MODULE_DISSERTATIONS_LABEL ??
      "الإنتاج الأكاديمي والإشراف العلمي",
    listening:
      environment.NEXT_PUBLIC_DASHBOARD_MODULE_LISTENING_LABEL ??
      "مجالس السماع والمواد الصوتية",
    hadithCards:
      environment.NEXT_PUBLIC_DASHBOARD_MODULE_HADITH_CARDS_LABEL ??
      "البطاقات الحديثية",
    scientificFatwas:
      environment.NEXT_PUBLIC_DASHBOARD_MODULE_SCIENTIFIC_FATWAS_LABEL ??
      "الفتاوى والمسائل الحديثة",
    scientificVideos:
      environment.NEXT_PUBLIC_DASHBOARD_MODULE_SCIENTIFIC_VIDEOS_LABEL ??
      "المرئيات واللقاءات العلمية",
    libraryIndexes:
      environment.NEXT_PUBLIC_DASHBOARD_MODULE_LIBRARY_INDEXES_LABEL ??
      "فهارس المكتبة وسجلات الزوار",
    comments:
      environment.NEXT_PUBLIC_DASHBOARD_MODULE_COMMENTS_LABEL ??
      "إدارة التعليقات",
  } as const;
}

export function withoutArabicDefiniteArticle(label: string): string {
  return label.startsWith("ال") ? label.slice(2) : label;
}

function moduleCopy(
  navigation: string,
  singular: string,
  plural: string,
  overrides: PageTitleOverrides = {},
): DashboardModuleCopy {
  return {
    navigation,
    singular,
    plural,
    pages: {
      list: navigation,
      create: overrides.create ?? `إضافة ${singular}`,
      edit: overrides.edit ?? `تعديل ${singular}`,
      detail: overrides.detail ?? `تفاصيل ${singular}`,
    },
  };
}

const deploymentModuleLabels = resolveDashboardModuleLabels(clientEnv);

export const dashboardCopy = {
  app: {
    name: clientEnv.NEXT_PUBLIC_APP_NAME,
    shortName: clientEnv.NEXT_PUBLIC_APP_SHORT_NAME,
    description: clientEnv.NEXT_PUBLIC_APP_DESCRIPTION,
    language: clientEnv.NEXT_PUBLIC_APP_LANGUAGE,
    direction: clientEnv.NEXT_PUBLIC_APP_DIRECTION,
  },
  common: {
    dashboard: clientEnv.NEXT_PUBLIC_NAV_DASHBOARD,
    account: clientEnv.NEXT_PUBLIC_NAV_ACCOUNT,
    logout: "تسجيل الخروج",
  },
  support: {
    title: "الدعم الفني",
    prompt: "تحتاج إلى مساعدة؟",
    action: "تواصل عبر واتساب",
    phone: clientEnv.NEXT_PUBLIC_SUPPORT_PHONE,
    whatsapp: clientEnv.NEXT_PUBLIC_SUPPORT_WHATSAPP,
  },
  modules: {
    sections: moduleCopy(
      clientEnv.NEXT_PUBLIC_NAV_SECTIONS,
      clientEnv.NEXT_PUBLIC_ENTITY_SECTION_SINGULAR,
      clientEnv.NEXT_PUBLIC_ENTITY_SECTION_PLURAL,
      {
        create: clientEnv.NEXT_PUBLIC_PAGE_SECTIONS_CREATE_TITLE,
        edit: clientEnv.NEXT_PUBLIC_PAGE_SECTIONS_EDIT_TITLE,
        detail: clientEnv.NEXT_PUBLIC_PAGE_SECTIONS_DETAIL_TITLE,
      },
    ),
    articles: moduleCopy(
      deploymentModuleLabels.articles,
      clientEnv.NEXT_PUBLIC_ENTITY_ARTICLE_SINGULAR,
      clientEnv.NEXT_PUBLIC_ENTITY_ARTICLE_PLURAL,
      {
        create: clientEnv.NEXT_PUBLIC_PAGE_ARTICLES_CREATE_TITLE,
        edit: clientEnv.NEXT_PUBLIC_PAGE_ARTICLES_EDIT_TITLE,
        detail: clientEnv.NEXT_PUBLIC_PAGE_ARTICLES_DETAIL_TITLE,
      },
    ),
    library: {
      navigation: deploymentModuleLabels.library,
    },
    dissertations: {
      navigation: deploymentModuleLabels.dissertations,
    },
    listening: {
      navigation: deploymentModuleLabels.listening,
    },
    hadithCards: {
      navigation: deploymentModuleLabels.hadithCards,
    },
    scientificFatwas: {
      navigation: deploymentModuleLabels.scientificFatwas,
    },
    scientificVideos: {
      navigation: deploymentModuleLabels.scientificVideos,
    },
    libraryIndexes: {
      navigation: deploymentModuleLabels.libraryIndexes,
    },
    comments: {
      navigation: deploymentModuleLabels.comments,
    },
    books: {
      ...moduleCopy(
        clientEnv.NEXT_PUBLIC_NAV_BOOKS,
        clientEnv.NEXT_PUBLIC_ENTITY_BOOK_SINGULAR,
        clientEnv.NEXT_PUBLIC_ENTITY_BOOK_PLURAL,
        {
          create: clientEnv.NEXT_PUBLIC_PAGE_BOOKS_CREATE_TITLE,
          edit: clientEnv.NEXT_PUBLIC_PAGE_BOOKS_EDIT_TITLE,
          detail: clientEnv.NEXT_PUBLIC_PAGE_BOOKS_DETAIL_TITLE,
        },
      ),
      series: {
        singular: clientEnv.NEXT_PUBLIC_ENTITY_BOOK_SERIES_SINGULAR,
        plural: clientEnv.NEXT_PUBLIC_ENTITY_BOOK_SERIES_PLURAL,
        manage: `إدارة ${clientEnv.NEXT_PUBLIC_ENTITY_BOOK_SERIES_PLURAL}`,
        detail: `تفاصيل ${clientEnv.NEXT_PUBLIC_ENTITY_BOOK_SERIES_SINGULAR}`,
      },
    },
    visuals: moduleCopy(
      clientEnv.NEXT_PUBLIC_NAV_VISUALS,
      clientEnv.NEXT_PUBLIC_ENTITY_VISUAL_SINGULAR,
      clientEnv.NEXT_PUBLIC_ENTITY_VISUAL_PLURAL,
      {
        create: clientEnv.NEXT_PUBLIC_PAGE_VISUALS_CREATE_TITLE,
        edit: clientEnv.NEXT_PUBLIC_PAGE_VISUALS_EDIT_TITLE,
        detail: clientEnv.NEXT_PUBLIC_PAGE_VISUALS_DETAIL_TITLE,
      },
    ),
    gallery: moduleCopy(
      clientEnv.NEXT_PUBLIC_NAV_GALLERY,
      clientEnv.NEXT_PUBLIC_ENTITY_MEDIA_SINGULAR,
      clientEnv.NEXT_PUBLIC_ENTITY_MEDIA_PLURAL,
      {
        create: clientEnv.NEXT_PUBLIC_PAGE_GALLERY_CREATE_TITLE,
        edit: clientEnv.NEXT_PUBLIC_PAGE_GALLERY_EDIT_TITLE,
        detail: clientEnv.NEXT_PUBLIC_PAGE_GALLERY_DETAIL_TITLE,
      },
    ),
    supervisors: moduleCopy(
      clientEnv.NEXT_PUBLIC_NAV_SUPERVISORS,
      clientEnv.NEXT_PUBLIC_ENTITY_SUPERVISOR_SINGULAR,
      clientEnv.NEXT_PUBLIC_ENTITY_SUPERVISOR_PLURAL,
      {
        create: clientEnv.NEXT_PUBLIC_PAGE_SUPERVISORS_CREATE_TITLE,
        edit: clientEnv.NEXT_PUBLIC_PAGE_SUPERVISORS_EDIT_TITLE,
        detail: clientEnv.NEXT_PUBLIC_PAGE_SUPERVISORS_DETAIL_TITLE,
      },
    ),
    reports: moduleCopy(
      clientEnv.NEXT_PUBLIC_NAV_REPORTS,
      clientEnv.NEXT_PUBLIC_ENTITY_REPORT_SINGULAR,
      clientEnv.NEXT_PUBLIC_ENTITY_REPORT_PLURAL,
    ),
    settings: moduleCopy(
      clientEnv.NEXT_PUBLIC_NAV_SETTINGS,
      clientEnv.NEXT_PUBLIC_ENTITY_SETTING_SINGULAR,
      clientEnv.NEXT_PUBLIC_ENTITY_SETTING_PLURAL,
      {
        create: clientEnv.NEXT_PUBLIC_PAGE_SETTINGS_CREATE_TITLE,
        edit: clientEnv.NEXT_PUBLIC_PAGE_SETTINGS_EDIT_TITLE,
        detail: clientEnv.NEXT_PUBLIC_PAGE_SETTINGS_DETAIL_TITLE,
      },
    ),
  },
} as const;
