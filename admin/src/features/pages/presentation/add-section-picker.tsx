"use client";

import { useState } from "react";

import { Button, Dialog } from "@/shared/components/ui";

import type { PageSection } from "../domain/pages.contracts";
import {
  PAGE_COMPONENT_DEFINITIONS,
  createPageSection,
  type PageComponentGroup,
} from "./page-component-catalog";
import { PagesIcon } from "./pages-icons";
import { SectionStructuralPreview } from "./section-previews";
import styles from "./pages.module.css";

const groups: Array<{
  key: PageComponentGroup;
  label: string;
  badgeClass: string;
}> = [
  { key: "content", label: "المحتوى الأساسي", badgeClass: styles.groupBadgeContent ?? "" },
  { key: "media", label: "الوسائط المرئية", badgeClass: styles.groupBadgeMedia ?? "" },
  { key: "utility", label: "عناصر مساعدة وتفاعلية", badgeClass: styles.groupBadgeUtility ?? "" },
];

export function AddSectionPicker({
  disabled,
  onAdd,
}: {
  disabled: boolean;
  onAdd: (section: PageSection) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button disabled={disabled} onClick={() => setOpen(true)}>
        <PagesIcon name="add" />
        إضافة قسم
      </Button>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="اختر نوع القسم"
        size="wide"
      >
        <div className={styles.pickerHeaderHelp}>
          <p>اختر التخطيط المناسب لمحتوى الصفحة لإضافة وقسم جديد مخصص بالكامل</p>
        </div>

        {groups.map((group) => (
          <section className={styles.pickerGroup} key={group.key}>
            <div className={styles.pickerGroupHeader}>
              <span className={`${styles.pickerGroupBadge} ${group.badgeClass}`}>
                {group.label}
              </span>
            </div>
            <div className={styles.pickerGrid}>
              {PAGE_COMPONENT_DEFINITIONS.filter(
                (item) => item.group === group.key,
              ).map((item) => (
                <button
                  key={item.type}
                  type="button"
                  className={`${styles.pickerItem} ui-focus`}
                  onClick={() => {
                    onAdd(createPageSection(item.type));
                    setOpen(false);
                  }}
                >
                  <div className={styles.pickerPreviewBox}>
                    <SectionStructuralPreview type={item.type} />
                  </div>
                  <div className={styles.pickerContent}>
                    <div className={styles.pickerTitleRow}>
                      <strong>{item.label}</strong>
                      <span className={styles.pickerAddHoverBtn}>
                        <PagesIcon name="add" />
                      </span>
                    </div>
                    <small>{item.description}</small>
                  </div>
                </button>
              ))}
            </div>
          </section>
        ))}
      </Dialog>
    </>
  );
}
