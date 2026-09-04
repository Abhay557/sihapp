import { cx } from "@/lib/utils";

type Tone = "default" | "up" | "down" | "primary" | "dark";

const tones: Record<Tone, string> = {
  default: "bg-surface-strong text-ink",
  up: "bg-surface-strong text-semantic-up",
  down: "bg-surface-strong text-semantic-down",
  primary: "bg-primary/10 text-primary",
  dark: "bg-surface-dark text-on-dark",
};

export function Badge({
  tone = "default",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-pill px-3 py-1 text-[12px] font-semibold leading-none",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export function StatusDot({ tone = "muted" }: { tone?: "up" | "down" | "muted" | "primary" }) {
  const map = {
    up: "bg-semantic-up",
    down: "bg-semantic-down",
    muted: "bg-muted-soft",
    primary: "bg-primary",
  } as const;
  return <span className={cx("inline-block size-2 rounded-full", map[tone])} />;
}
