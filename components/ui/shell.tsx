import { cn } from "@/lib/utils";
import { type PropsWithChildren } from "react";

type ShellProps = PropsWithChildren<{
  className?: string;
}>;

export function Shell({ children, className }: ShellProps) {
  return (
    <div className={cn("relative min-h-screen bg-micro-bg text-slate-300", className)}>
      <div className="pointer-events-none absolute inset-0 micro-grid-overlay opacity-70" />
      <div className="pointer-events-none absolute inset-0 micro-noise-overlay opacity-15" />
      <div className="relative mx-auto min-h-screen w-full max-w-6xl px-6 py-8 md:px-10">
        {children}
      </div>
    </div>
  );
}
