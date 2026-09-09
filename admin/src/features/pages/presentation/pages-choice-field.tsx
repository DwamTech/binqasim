"use client";

import { useId, type ReactNode } from "react";

import styles from "./pages-choice-field.module.css";

export type PagesChoiceOption<T extends string> = {
  value: T;
  label: string;
  description?: string;
  preview?: ReactNode;
};

export function PagesChoiceField<T extends string>({
  label,
  description,
  value,
  options,
  onValueChange,
}: {
  label: string;
  description?: string;
  value: T;
  options: readonly PagesChoiceOption<T>[];
  onValueChange: (value: T) => void;
}) {
  const groupName = useId();
  const descriptionId = useId();

  return (
    <fieldset
      className={styles.fieldset}
      aria-describedby={description ? descriptionId : undefined}
    >
      <legend className={styles.legend}>{label}</legend>
      {description && (
        <p id={descriptionId} className={styles.description}>
          {description}
        </p>
      )}
      <div className={styles.grid}>
        {options.map((option) => (
          <label key={option.value} className={styles.option}>
            <input
              className={styles.input}
              type="radio"
              name={groupName}
              value={option.value}
              checked={option.value === value}
              onChange={() => onValueChange(option.value)}
            />
            {option.preview && (
              <span className={styles.preview}>{option.preview}</span>
            )}
            <span className={styles.copy}>
              <strong>{option.label}</strong>
              {option.description && <small>{option.description}</small>}
            </span>
            <span className={styles.indicator} aria-hidden="true">
              ✓
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export type PagesHeroLayout =
  "centered" | "image_left" | "image_right" | "background_image";

const previewLayout: Record<PagesHeroLayout, string> = {
  centered: "centered",
  image_left: "image-left",
  image_right: "image-right",
  background_image: "background",
};

export function PagesHeroLayoutPreview({
  layout,
}: {
  layout: PagesHeroLayout;
}) {
  return (
    <span
      className={styles.layoutPreview}
      data-layout={previewLayout[layout]}
      aria-hidden="true"
    >
      <span className={styles.layoutImage} />
      <span className={styles.layoutCopy}>
        <i />
        <i />
      </span>
    </span>
  );
}
