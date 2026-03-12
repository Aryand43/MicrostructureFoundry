import { cn } from "@/lib/utils";
import { type PropsWithChildren } from "react";

type CardProps = PropsWithChildren<{
  className?: string;
}>;

export function Card({ children, className }: CardProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-micro-border bg-micro-bg-soft/80 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur",
        className
      )}
    >
      {children}
    </section>
  );
}
