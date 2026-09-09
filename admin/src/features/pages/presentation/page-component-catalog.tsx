import type { PageSection } from "../domain/pages.contracts";
import { createPageContentId } from "../domain/page-content-id";
import { PagesIcon, type PagesIconName } from "./pages-icons";

export type PageComponentType = PageSection["type"];
export type PageComponentGroup = "content" | "media" | "utility";

export type PageComponentDefinition = {
  type: PageComponentType;
  label: string;
  description: string;
  group: PageComponentGroup;
  icon: PagesIconName;
};

export const PAGE_COMPONENT_DEFINITIONS: readonly PageComponentDefinition[] = [
  {
    type: "hero",
    label: "واجهة رئيسية",
    description: "مقدمة بارزة بعنوان وصورة وإجراءات اختيارية.",
    group: "content",
    icon: "hero",
  },
  {
    type: "rich_content",
    label: "محتوى نصي",
    description: "نص منسق للفقرات والعناوين والروابط.",
    group: "content",
    icon: "richContent",
  },
  {
    type: "image_text",
    label: "صورة مع نص",
    description: "محتوى نصي بجوار صورة في تخطيط مرن.",
    group: "content",
    icon: "imageText",
  },
  {
    type: "cards",
    label: "بطاقات",
    description: "مجموعة خدمات أو عناصر في بطاقات منظمة.",
    group: "content",
    icon: "cards",
  },
  {
    type: "faq",
    label: "الأسئلة الشائعة",
    description: "أسئلة وإجابات قابلة للعرض المتتابع.",
    group: "content",
    icon: "faq",
  },
  {
    type: "cta",
    label: "دعوة لاتخاذ إجراء",
    description: "رسالة ختامية مركزة مع زر أو زرين.",
    group: "content",
    icon: "cta",
  },
  {
    type: "image",
    label: "صورة",
    description: "صورة مستقلة مع نص بديل وتعليق اختياري.",
    group: "media",
    icon: "image",
  },
  {
    type: "video",
    label: "فيديو",
    description: "ملف فيديو مع عنوان وصورة غلاف اختيارية.",
    group: "media",
    icon: "video",
  },
  {
    type: "audio",
    label: "صوت",
    description: "ملف صوتي مع عنوان ووصف اختياريين.",
    group: "media",
    icon: "audio",
  },
  {
    type: "gallery",
    label: "معرض صور",
    description: "مجموعة صور مرتبة ضمن معرض واحد.",
    group: "media",
    icon: "gallery",
  },
  {
    type: "statistics",
    label: "إحصائيات",
    description: "أرقام ومؤشرات مختصرة لإبراز النتائج.",
    group: "utility",
    icon: "statistics",
  },
  {
    type: "downloads",
    label: "ملفات للتحميل",
    description: "مستندات منظمة مع تسميات ووصف.",
    group: "utility",
    icon: "document",
  },
] as const;

const createId = createPageContentId;
const settings = () => ({
  theme: "default" as const,
  spacing: "medium" as const,
});

function newHero(): PageSection {
  return {
    id: createId(),
    type: "hero",
    version: 1,
    is_visible: true,
    data: { variant: "centered", title: "" },
    settings: settings(),
  };
}
function newRichContent(): PageSection {
  return {
    id: createId(),
    type: "rich_content",
    version: 1,
    is_visible: true,
    data: { html: "<p></p>" },
    settings: settings(),
  };
}
function newImage(): PageSection {
  return {
    id: createId(),
    type: "image",
    version: 1,
    is_visible: true,
    data: {
      variant: "contained",
      image: { media_id: 0, alt: "" },
      caption: null,
    },
    settings: settings(),
  };
}
function newImageText(): PageSection {
  return {
    id: createId(),
    type: "image_text",
    version: 1,
    is_visible: true,
    data: {
      variant: "image_left",
      title: null,
      html: "<p></p>",
      image: { media_id: 0, alt: "" },
    },
    settings: settings(),
  };
}
function newVideo(): PageSection {
  return {
    id: createId(),
    type: "video",
    version: 1,
    is_visible: true,
    data: {
      variant: "contained",
      video: { media_id: 0 },
      title: null,
      caption: null,
      poster: null,
    },
    settings: settings(),
  };
}
function newAudio(): PageSection {
  return {
    id: createId(),
    type: "audio",
    version: 1,
    is_visible: true,
    data: { audio: { media_id: 0 }, title: null, description: null },
    settings: settings(),
  };
}
function newGallery(): PageSection {
  return {
    id: createId(),
    type: "gallery",
    version: 1,
    is_visible: true,
    data: { variant: "grid", items: [] },
    settings: settings(),
  };
}
function newCards(): PageSection {
  return {
    id: createId(),
    type: "cards",
    version: 1,
    is_visible: true,
    data: {
      variant: "grid_3",
      title: null,
      description: null,
      items: [
        {
          id: createId(),
          title: "",
          description: null,
          image: null,
          action: null,
        },
      ],
    },
    settings: settings(),
  };
}
function newStatistics(): PageSection {
  return {
    id: createId(),
    type: "statistics",
    version: 1,
    is_visible: true,
    data: {
      variant: "grid",
      title: null,
      items: [{ id: createId(), value: "", label: "", description: null }],
    },
    settings: settings(),
  };
}
function newDownloads(): PageSection {
  return {
    id: createId(),
    type: "downloads",
    version: 1,
    is_visible: true,
    data: {
      variant: "list",
      title: null,
      description: null,
      items: [{ id: createId(), media_id: 0, label: "", description: null }],
    },
    settings: settings(),
  };
}
function newFaq(): PageSection {
  return {
    id: createId(),
    type: "faq",
    version: 1,
    is_visible: true,
    data: { variant: "accordion", title: null, description: null, items: [] },
    settings: settings(),
  };
}
function newCta(): PageSection {
  return {
    id: createId(),
    type: "cta",
    version: 1,
    is_visible: true,
    data: {
      variant: "banner",
      title: "",
      description: null,
      primary_action: { label: "", url: "" },
      secondary_action: null,
    },
    settings: settings(),
  };
}

export function createPageSection(type: PageComponentType): PageSection {
  const factories: Record<PageComponentType, () => PageSection> = {
    hero: newHero,
    rich_content: newRichContent,
    image: newImage,
    image_text: newImageText,
    video: newVideo,
    audio: newAudio,
    gallery: newGallery,
    cards: newCards,
    statistics: newStatistics,
    downloads: newDownloads,
    faq: newFaq,
    cta: newCta,
  };
  return factories[type]();
}

export function componentDefinition(type: PageComponentType) {
  return PAGE_COMPONENT_DEFINITIONS.find((item) => item.type === type)!;
}

export function ComponentTypeIcon({ type }: { type: PageComponentType }) {
  return <PagesIcon name={componentDefinition(type).icon} />;
}
