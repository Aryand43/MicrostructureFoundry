import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function Hero() {
  return (
    <section className="micro-grid-overlay relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden rounded-3xl border border-micro-border bg-micro-bg-soft/75 px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(111,167,255,0.22),transparent_40%)]" />
      <div className="relative mx-auto max-w-3xl space-y-7 text-center">
        <h1 className="text-balance text-4xl font-semibold leading-tight md:text-6xl">
          PRISM
        </h1>
        <p className="mx-auto max-w-2xl text-pretty text-base text-slate-400 md:text-lg">
          Research-grade interface for spatial microstructure prediction with a
          focused matte-black workflow for experiment-driven modeling.
        </p>
        <div className="flex justify-center">
          <Link href="/predict">
            <Button className="px-6 py-2.5">Go to Prediction</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
