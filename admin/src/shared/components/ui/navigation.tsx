import type { ReactNode } from "react";

export type HeroSectionProps = {
  title: ReactNode;
  description?: ReactNode;
  eyebrow?: ReactNode;
  leading?: ReactNode;
  actions?: ReactNode;
  className?: string;
};

export function HeroSection({
  title,
  description,
  eyebrow,
  leading,
  actions,
  className,
}: HeroSectionProps) {
  return (
    <header className={`ui-page-hero${className ? ` ${className}` : ""}`}>
      <span className="ui-page-hero__decoration" aria-hidden="true" />
      <div className="ui-page-hero__content">
        {leading && <div className="ui-page-hero__leading">{leading}</div>}
        <div className="ui-page-hero__copy">
          {eyebrow && <span className="ui-page-hero__eyebrow">{eyebrow}</span>}
          <h1 className="ui-page-title">{title}</h1>
          {description && <p className="ui-page-description">{description}</p>}
        </div>
      </div>
      {actions && <div className="ui-page-hero__actions">{actions}</div>}
    </header>
  );
}

export function PageHeader(props: HeroSectionProps) {
  return <HeroSection {...props} />;
}

export function Breadcrumb({
  items,
}: {
  items: Array<{ label: ReactNode; href?: string }>;
}) {
  return (
    <nav className="ui-breadcrumb" aria-label="Breadcrumb">
      {items.map((item, index) => (
        <span key={index}>
          {index > 0 && <span aria-hidden="true">/</span>}{" "}
          {item.href ? (
            <a href={item.href}>{item.label}</a>
          ) : (
            <span aria-current="page">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
