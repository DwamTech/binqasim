"use client";

import { useEffect, useRef } from "react";

export function PageSelectionCheckbox({
  checked,
  indeterminate,
  disabled,
  onChange,
}: {
  checked: boolean;
  indeterminate: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);

  return (
    <input
      ref={ref}
      type="checkbox"
      className="ui-checkbox ui-focus"
      checked={checked}
      disabled={disabled}
      aria-label="تحديد كل تعليقات الصفحة الحالية"
      onChange={(event) => onChange(event.target.checked)}
    />
  );
}
