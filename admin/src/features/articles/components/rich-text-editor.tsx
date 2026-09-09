"use client";

import { Extension } from "@tiptap/core";
import { Highlight } from "@tiptap/extension-highlight";
import { Placeholder } from "@tiptap/extension-placeholder";
import { TextAlign } from "@tiptap/extension-text-align";
import {
  Color,
  FontFamily,
  FontSize,
  TextStyle,
} from "@tiptap/extension-text-style";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

import styles from "./rich-text-editor.module.css";

type RichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
  invalid?: boolean;
};

const TextDirection = Extension.create({
  name: "textDirection",
  addGlobalAttributes() {
    return [
      {
        types: ["heading", "paragraph"],
        attributes: {
          dir: {
            default: null,
            parseHTML: (element) => element.getAttribute("dir"),
            renderHTML: (attributes) =>
              attributes.dir ? { dir: attributes.dir as string } : {},
          },
        },
      },
    ];
  },
});

const fonts = [
  { label: "Cairo — عربي", value: "Cairo" },
  { label: "Tajawal — عربي", value: "Tajawal" },
  { label: "Amiri — عربي (خط أميري)", value: "Amiri" },
  { label: "Alexandria — عربي (خط الإسكندرية)", value: "Alexandria" },
  { label: "Noto Kufi — عربي", value: "Noto Kufi Arabic" },
  { label: "Montserrat — English", value: "Montserrat" },
];

function ToolbarButton({
  label,
  title,
  active,
  disabled,
  onClick,
}: {
  label: string;
  title: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={active ? styles.activeButton : undefined}
      title={title}
      aria-label={title}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

export function RichTextEditor({
  value,
  onChange,
  invalid,
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        link: {
          openOnClick: false,
          autolink: true,
          defaultProtocol: "https",
          HTMLAttributes: { rel: "noopener noreferrer" },
        },
      }),
      TextStyle,
      Color,
      FontFamily,
      FontSize,
      Highlight.configure({ multicolor: true }),
      Placeholder.configure({
        placeholder:
          "ابدأ كتابة المقال هنا… يمكنك المزج بين العربية والإنجليزية وتنسيق المحتوى بحرية.",
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right", "justify"],
      }),
      TextDirection,
    ],
    content: value || "<p></p>",
    editorProps: {
      attributes: {
        class: styles.editorSurface ?? "",
        "aria-label": "محرر محتوى المقال",
        spellcheck: "true",
      },
    },
    onUpdate: ({ editor: currentEditor }) => onChange(currentEditor.getHTML()),
  });

  if (!editor) {
    return <div className={styles.editorLoading}>جارٍ تجهيز المحرر…</div>;
  }

  const setLink = () => {
    const current = editor.getAttributes("link").href as string | undefined;
    const href = window.prompt("أدخل رابطًا آمنًا", current ?? "https://");
    if (href === null) return;
    if (href.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: href.trim() })
      .run();
  };

  const text = editor.getText().trim();
  const words = text === "" ? 0 : text.split(/\s+/u).length;

  return (
    <div
      className={styles.editorShell}
      data-invalid={invalid ? "true" : "false"}
    >
      <div className={styles.toolbar} role="toolbar" aria-label="أدوات التنسيق">
        <div className={styles.toolbarGroup}>
          <ToolbarButton
            label="↶"
            title="تراجع"
            disabled={!editor.can().chain().focus().undo().run()}
            onClick={() => editor.chain().focus().undo().run()}
          />
          <ToolbarButton
            label="↷"
            title="إعادة"
            disabled={!editor.can().chain().focus().redo().run()}
            onClick={() => editor.chain().focus().redo().run()}
          />
        </div>

        <div className={styles.toolbarGroup}>
          <select
            aria-label="نوع الفقرة"
            value={
              editor.isActive("heading", { level: 2 })
                ? "h2"
                : editor.isActive("heading", { level: 3 })
                  ? "h3"
                  : editor.isActive("heading", { level: 4 })
                    ? "h4"
                    : "p"
            }
            onChange={(event) => {
              const block = event.target.value;
              if (block === "p") editor.chain().focus().setParagraph().run();
              else
                editor
                  .chain()
                  .focus()
                  .toggleHeading({
                    level: Number(block.slice(1)) as 2 | 3 | 4,
                  })
                  .run();
            }}
          >
            <option value="p">نص عادي</option>
            <option value="h2">عنوان رئيسي</option>
            <option value="h3">عنوان فرعي</option>
            <option value="h4">عنوان صغير</option>
          </select>
          <select
            aria-label="نوع الخط"
            defaultValue=""
            onChange={(event) => {
              if (event.target.value)
                editor.chain().focus().setFontFamily(event.target.value).run();
              else editor.chain().focus().unsetFontFamily().run();
            }}
          >
            <option value="">الخط الافتراضي</option>
            {fonts.map((font) => (
              <option value={font.value} key={font.value}>
                {font.label}
              </option>
            ))}
          </select>
          <select
            aria-label="حجم الخط"
            defaultValue=""
            onChange={(event) => {
              if (event.target.value)
                editor.chain().focus().setFontSize(event.target.value).run();
              else editor.chain().focus().unsetFontSize().run();
            }}
          >
            <option value="">الحجم</option>
            <option value="14px">14</option>
            <option value="16px">16</option>
            <option value="18px">18</option>
            <option value="20px">20</option>
            <option value="24px">24</option>
            <option value="30px">30</option>
          </select>
        </div>

        <div className={styles.toolbarGroup}>
          <ToolbarButton
            label="B"
            title="عريض"
            active={editor.isActive("bold")}
            onClick={() => editor.chain().focus().toggleBold().run()}
          />
          <ToolbarButton
            label="I"
            title="مائل"
            active={editor.isActive("italic")}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          />
          <ToolbarButton
            label="U"
            title="تحته خط"
            active={editor.isActive("underline")}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          />
          <ToolbarButton
            label="S"
            title="يتوسطه خط"
            active={editor.isActive("strike")}
            onClick={() => editor.chain().focus().toggleStrike().run()}
          />
          <label className={styles.colorControl} title="لون النص">
            A
            <input
              type="color"
              defaultValue="#163b33"
              aria-label="لون النص"
              onInput={(event) =>
                editor.chain().focus().setColor(event.currentTarget.value).run()
              }
            />
          </label>
          <label className={styles.colorControl} title="لون التمييز">
            ▰
            <input
              type="color"
              defaultValue="#fff0a8"
              aria-label="لون التمييز"
              onInput={(event) =>
                editor
                  .chain()
                  .focus()
                  .toggleHighlight({ color: event.currentTarget.value })
                  .run()
              }
            />
          </label>
        </div>

        <div className={styles.toolbarGroup}>
          {(
            [
              ["يمين", "right", "≡"],
              ["توسيط", "center", "≣"],
              ["يسار", "left", "≡"],
              ["ضبط", "justify", "☷"],
            ] as const
          ).map(([title, alignment, label]) => (
            <ToolbarButton
              key={alignment}
              label={label}
              title={`محاذاة ${title}`}
              active={editor.isActive({ textAlign: alignment })}
              onClick={() =>
                editor.chain().focus().setTextAlign(alignment).run()
              }
            />
          ))}
          <ToolbarButton
            label="ع"
            title="اتجاه عربي من اليمين"
            active={editor.isActive({ dir: "rtl" })}
            onClick={() =>
              editor
                .chain()
                .focus()
                .updateAttributes("paragraph", { dir: "rtl" })
                .updateAttributes("heading", { dir: "rtl" })
                .run()
            }
          />
          <ToolbarButton
            label="EN"
            title="اتجاه إنجليزي من اليسار"
            active={editor.isActive({ dir: "ltr" })}
            onClick={() =>
              editor
                .chain()
                .focus()
                .updateAttributes("paragraph", { dir: "ltr" })
                .updateAttributes("heading", { dir: "ltr" })
                .run()
            }
          />
        </div>

        <div className={styles.toolbarGroup}>
          <ToolbarButton
            label="• قائمة"
            title="قائمة نقطية"
            active={editor.isActive("bulletList")}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          />
          <ToolbarButton
            label="1. قائمة"
            title="قائمة رقمية"
            active={editor.isActive("orderedList")}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          />
          <ToolbarButton
            label="❝"
            title="اقتباس"
            active={editor.isActive("blockquote")}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          />
          <ToolbarButton
            label="🔗"
            title="إضافة أو تعديل رابط"
            active={editor.isActive("link")}
            onClick={setLink}
          />
          <ToolbarButton
            label="―"
            title="فاصل أفقي"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
          />
          <ToolbarButton
            label="Tx"
            title="مسح التنسيق"
            onClick={() =>
              editor.chain().focus().clearNodes().unsetAllMarks().run()
            }
          />
        </div>
      </div>

      <EditorContent editor={editor} />

      <footer className={styles.editorStatus}>
        <span>حفظ تلقائي داخل النموذج بصيغة HTML آمنة</span>
        <span>
          {words.toLocaleString("ar-EG")} كلمة ·{" "}
          {text.length.toLocaleString("ar-EG")} حرف
        </span>
      </footer>
    </div>
  );
}
