import Link from "next/link";
import { cx } from "@/lib/utils";

type Variant = "primary" | "secondary" | "dark" | "outline-dark" | "ghost";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-on-primary hover:bg-primary-active",
  secondary: "bg-surface-strong text-ink hover:bg-hairline",
  dark: "bg-surface-dark-elevated text-on-dark hover:bg-ink",
  "outline-dark": "border border-on-dark text-on-dark hover:bg-surface-dark-elevated",
  ghost: "text-primary hover:underline",
};

type Size = "sm" | "md" | "lg";

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-[15px]",
  lg: "h-14 px-8 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return (
    <button
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-pill font-semibold transition-colors disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className,
  ...props
}: React.ComponentProps<typeof Link> & { variant?: Variant; size?: Size }) {
  return (
    <Link
      href={href}
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-pill font-semibold transition-colors",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}
