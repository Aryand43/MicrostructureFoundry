import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes, type PropsWithChildren } from "react";

type ButtonVariant = "primary" | "secondary";

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
  }
>;

const baseStyles =
  "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-micro-accent";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-micro-accent text-black hover:brightness-110 shadow-[0_8px_30px_rgba(111,167,255,0.25)]",
  secondary:
    "border border-micro-border bg-micro-bg-soft text-slate-200 hover:border-micro-accent/45"
};

export function Button({
  children,
  className,
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button className={cn(baseStyles, variants[variant], className)} {...props}>
      {children}
    </button>
  );
}
