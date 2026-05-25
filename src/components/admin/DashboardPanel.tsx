import type { ReactNode } from "react";

type Props = {
  title: string;
  span?: 3 | 4 | 5 | 6 | 8 | 12;
  subtitle?: string;
  children: ReactNode;
  className?: string;
};

export function DashboardPanel({
  title,
  span = 4,
  subtitle,
  children,
  className,
}: Props) {
  return (
    <section
      className={`obs-panel obs-span-${span}${className ? ` ${className}` : ""}`}
    >
      <header className="obs-panel-head">
        <h2 className="obs-panel-title">{title}</h2>
        {subtitle && <p className="obs-panel-sub">{subtitle}</p>}
      </header>
      <div className="obs-panel-body">{children}</div>
    </section>
  );
}
