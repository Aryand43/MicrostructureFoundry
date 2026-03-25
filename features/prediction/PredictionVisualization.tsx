"use client";

import { type PredictionResponse } from "@/lib/api/prediction";
import { type JobStatus } from "@/features/prediction/usePredictionJob";

const tabs = ["Prediction", "Uncertainty", "Metadata"] as const;
export type PredictionTab = (typeof tabs)[number];

type PredictionVisualizationProps = {
  status: JobStatus;
  progress: number;
  result: PredictionResponse | null;
  activeTab: PredictionTab;
  onTabChange: (tab: PredictionTab) => void;
};

function getHeatmapData(
  activeTab: PredictionTab,
  result: PredictionResponse | null
): number[][] | null {
  if (!result) {
    return null;
  }

  if (activeTab === "Uncertainty") {
    return result.uncertainty;
  }

  return result.prediction;
}

function getUncertaintySummary(result: PredictionResponse | null): {
  mean: number;
  max: number;
} | null {
  if (!result) {
    return null;
  }

  const values = result.uncertainty.flat();
  if (!values.length) {
    return null;
  }

  const sum = values.reduce((accumulator, value) => accumulator + value, 0);
  const mean = sum / values.length;
  const max = Math.max(...values);

  return { mean, max };
}

function Heatmap({ data }: { data: number[][] }) {
  const columns = data[0]?.length ?? 1;

  return (
    <div className="relative h-[340px] overflow-hidden rounded-lg border border-micro-border bg-[#0b1018]">
      <div
        className="grid h-full w-full"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {data.flatMap((row, rowIndex) =>
          row.map((value, columnIndex) => {
            const lightness = 11 + Math.round(value * 56);
            const alpha = 0.22 + value * 0.78;
            return (
              <div
                key={`${rowIndex}-${columnIndex}`}
                className="h-full w-full"
                style={{ backgroundColor: `hsla(213, 100%, ${lightness}%, ${alpha})` }}
              />
            );
          })
        )}
      </div>
      <div className="pointer-events-none absolute inset-0 micro-grid-overlay opacity-20" />
    </div>
  );
}

function HeatmapSkeleton({ isRunning }: { isRunning: boolean }) {
  return (
    <div className="relative h-[340px] overflow-hidden rounded-lg border border-micro-border bg-[linear-gradient(140deg,#0d1118,#131b27,#0a0f17)]">
      <div className="absolute inset-0 micro-grid-overlay opacity-60" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(111,167,255,0.20),transparent_35%),radial-gradient(circle_at_75%_65%,rgba(111,167,255,0.13),transparent_40%),radial-gradient(circle_at_48%_48%,rgba(255,255,255,0.08),transparent_30%)]" />
      {isRunning ? (
        <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-transparent via-micro-accent to-transparent opacity-85" />
      ) : null}
    </div>
  );
}

export function PredictionVisualization({
  status,
  progress,
  result,
  activeTab,
  onTabChange
}: PredictionVisualizationProps) {
  const heatmapData = getHeatmapData(activeTab, result);
  const uncertaintySummary = getUncertaintySummary(result);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-medium">Visualization</h2>
        <p className="mt-2 text-sm text-slate-400">
          Tabbed output panel that receives prediction job data.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => onTabChange(tab)}
            className={[
              "rounded-lg border px-3 py-1.5 text-sm transition-colors",
              activeTab === tab
                ? "border-micro-accent bg-micro-accent/15 text-slate-100"
                : "border-micro-border bg-black/20 text-slate-400 hover:text-slate-200"
            ].join(" ")}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="space-y-4 rounded-xl border border-micro-border bg-black/25 p-4">
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.14em] text-slate-500">
          <span>{activeTab} View</span>
          <span>{status === "Complete" ? "Prediction ready" : "Awaiting run"}</span>
        </div>

        {heatmapData ? (
          <Heatmap data={heatmapData} />
        ) : (
          <HeatmapSkeleton isRunning={status === "Running"} />
        )}
        <p className="text-sm text-slate-400">
          Uncertainty: mean {uncertaintySummary?.mean.toFixed(2) ?? "--"}, max{" "}
          {uncertaintySummary?.max.toFixed(2) ?? "--"}.
        </p>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-micro-border bg-black/20 p-3">
            <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Status</p>
            <p className="mt-1 text-lg font-medium text-slate-200">{status}</p>
          </div>
          <div className="rounded-lg border border-micro-border bg-black/20 p-3">
            <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Progress</p>
            <p className="mt-1 text-lg font-medium text-slate-200">{progress}%</p>
          </div>
          <div className="rounded-lg border border-micro-border bg-black/20 p-3">
            <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Resolution</p>
            <p className="mt-1 text-lg font-medium text-slate-200">
              {result?.metadata.resolution ?? "--"}
            </p>
          </div>
        </div>

        {activeTab === "Metadata" ? (
          <div className="rounded-lg border border-micro-border bg-black/20 p-3 text-sm text-slate-300">
            <p>Model: {result?.metadata.model ?? "--"}</p>
            <p>Runtime: {result?.metadata.runtimeMs ?? "--"} ms</p>
            <p>Grain Size: {result?.metadata.grainSize ?? "--"} um</p>
            <p>Fidelity: {result?.metadata.fidelityLevel ?? "--"}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
