import { cx } from "@/lib/utils";

export function Card({
  className,
  dark = false,
  children,
}: {
  className?: string;
  dark?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cx(
        "rounded-xl p-6 md:p-8",
        dark ? "bg-surface-dark-elevated text-on-dark border border-white/10" : "bg-canvas text-ink border border-hairline",
        className
      )}
    >
      {children}
    </div>
  );
}

export function SectionTitle({
  eyebrow,
  title,
  subtitle,
  dark = false,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  dark?: boolean;
}) {
  return (
    <div className="max-w-2xl">
      {eyebrow && (
        <div className={cx("mb-4 text-[12px] font-semibold uppercase tracking-widest", dark ? "text-on-dark-soft" : "text-muted")}>
          {eyebrow}
        </div>
      )}
      <h2 className={cx("text-display text-3xl md:text-4xl", dark ? "text-on-dark" : "text-ink")}>{title}</h2>
      {subtitle && <p className={cx("mt-3 text-base leading-relaxed", dark ? "text-on-dark-soft" : "text-body")}>{subtitle}</p>}
    </div>
  );
}

export function Stat({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "up" | "down";
}) {
  const valueColor = tone === "up" ? "text-semantic-up" : tone === "down" ? "text-semantic-down" : "text-ink";
  return (
    <div className="border border-hairline rounded-lg p-5 bg-canvas">
      <div className="text-[12px] font-semibold uppercase tracking-wider text-muted">{label}</div>
      <div className={cx("tabular mt-2 text-2xl", valueColor)}>{value}</div>
      {hint && <div className="mt-1 text-[13px] text-body">{hint}</div>}
    </div>
  );
}

export function ProgressBar({
  value,
  tone = "primary",
  className,
}: {
  value: number;
  tone?: "primary" | "up";
  className?: string;
}) {
  return (
    <div className={cx("h-1.5 w-full rounded-full bg-surface-strong overflow-hidden", className)}>
      <div
        className={cx("h-full rounded-full transition-all", tone === "primary" ? "bg-primary" : "bg-semantic-up")}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="rounded-lg border border-dashed border-hairline bg-surface-soft p-10 text-center">
      <div className="font-semibold text-ink">{title}</div>
      {hint && <div className="mt-1 text-sm text-body">{hint}</div>}
    </div>
  );
}
