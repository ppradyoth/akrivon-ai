import { ReactNode } from "react";

interface SectionProps {
  title?: string;
  eyebrow?: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}

export default function Section({ title, eyebrow, description, children, className = "" }: SectionProps) {
  return (
    <section className={`section ${className}`.trim()}>
      {(eyebrow || description || title) && (
        <header className="section-header">
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          {title && <h1>{title}</h1>}
          {description && <p className="section-description">{description}</p>}
        </header>
      )}
      {children}
    </section>
  );
}
