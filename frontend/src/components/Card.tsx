import { ReactNode } from "react";

interface CardProps {
  title: string;
  description?: string;
  children?: ReactNode;
}

export default function Card({ title, description, children }: CardProps) {
  return (
    <article className="card">
      <h3>{title}</h3>
      {description && <p className="card-description">{description}</p>}
      {children}
    </article>
  );
}
