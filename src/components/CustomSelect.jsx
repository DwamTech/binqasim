"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./CustomSelect.module.css";

export default function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "اختر",
  disabled = false,
  dir = "rtl",
}) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const menuRef = useRef(null);
  const selectedIndex = useMemo(
    () => options.findIndex((o) => o.value === value),
    [options, value]
  );
  const [activeIndex, setActiveIndex] = useState(Math.max(0, selectedIndex));

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        open &&
        btnRef.current &&
        menuRef.current &&
        !btnRef.current.contains(e.target) &&
        !menuRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  useEffect(() => {
    if (open && menuRef.current) {
      const el = menuRef.current.querySelector(`[data-index="${activeIndex}"]`);
      if (el) el.scrollIntoView({ block: "nearest" });
    }
  }, [open, activeIndex]);

  const selectByIndex = (idx) => {
    const opt = options[idx];
    if (!opt) return;
    onChange(opt.value);
    setOpen(false);
  };

  const onButtonKeyDown = (e) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      setOpen(true);
      setActiveIndex(
        e.key === "ArrowDown"
          ? Math.min(options.length - 1, activeIndex + 1)
          : Math.max(0, activeIndex - 1)
      );
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen((v) => !v);
    }
  };

  const onMenuKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(options.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      selectByIndex(activeIndex);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    }
  };

  const selectedLabel = selectedIndex >= 0 ? options[selectedIndex].label : "";

  return (
    <div className={styles.select} dir={dir}>
      <button
        ref={btnRef}
        type="button"
        className={`${styles.button} ${disabled ? styles.disabled : ""}`}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={onButtonKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={selectedLabel ? styles.valueText : styles.placeholder}>
          {selectedLabel || placeholder}
        </span>
        <span className={styles.chevron} aria-hidden />
      </button>
      {open && (
        <ul
          ref={menuRef}
          className={styles.menu}
          role="listbox"
          tabIndex={-1}
          onKeyDown={onMenuKeyDown}
        >
          {options.map((opt, idx) => (
            <li
              key={opt.value}
              data-index={idx}
              className={`${styles.option} ${
                value === opt.value ? styles.optionSelected : ""
              } ${activeIndex === idx ? styles.optionActive : ""}`}
              role="option"
              aria-selected={value === opt.value}
              onClick={() => selectByIndex(idx)}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
