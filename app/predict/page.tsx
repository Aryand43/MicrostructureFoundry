import Link from "next/link";
import { PredictionWorkspace } from "@/features/prediction/PredictionWorkspace";

export default function PredictPage() {
  return (
    <main className="space-y-6 pb-10 pt-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
            Prediction
          </p>
          <h1 className="mt-2 text-3xl font-semibold">Microstructure Model Runner</h1>
        </div>
        <Link href="/" className="text-sm text-micro-accent hover:underline">
          Back to landing
        </Link>
      </div>
      <PredictionWorkspace />
    </main>
  );
}
