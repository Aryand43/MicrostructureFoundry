"use client";

import { useEffect, useRef, useState } from "react";
import { type PredictionResponse } from "@/lib/api/prediction";
import { type JobStatus } from "@/features/prediction/usePredictionJob";
import { cn } from "@/lib/utils";

const tabs = ["Prediction", "Uncertainty", "Metadata"] as const;
export type PredictionTab = (typeof tabs)[number];

type PredictionVisualizationProps = {
  status: JobStatus;
  progress: number;
  result: PredictionResponse | null;
  activeTab: PredictionTab;
  onTabChange: (tab: PredictionTab) => void;
};

function StatusPill({ status }: { status: JobStatus }) {
  const styleMap: Record<JobStatus, string> = {
    Idle: "border-slate-600/60 bg-slate-700/20 text-slate-300",
    Running: "border-micro-accent/60 bg-micro-accent/20 text-micro-accent animate-pulse",
    Complete: "border-emerald-500/50 bg-emerald-500/15 text-emerald-300",
    Error: "border-red-500/50 bg-red-500/15 text-red-300"
  };

  const labelMap: Record<JobStatus, string> = {
    Idle: "IDLE",
    Running: "RUNNING...",
    Complete: "COMPLETE",
    Error: "ERROR"
  };

  return (
    <span
      className={cn(
        "rounded-full border px-2.5 py-1 text-[10px] font-medium tracking-[0.14em]",
        styleMap[status]
      )}
    >
      {labelMap[status]}
    </span>
  );
}

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

function Heatmap({ data }: { data: number[][] }) {
  const columns = data[0]?.length ?? 1;

  return (
    <div className="relative h-[340px]">
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
    <div className="relative h-[340px] bg-[linear-gradient(140deg,#0d1118,#131b27,#0a0f17)]">
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
  const uncertaintyValues = result?.uncertainty.flat();
  const meanUncertainty =
    uncertaintyValues && uncertaintyValues.length
      ? (uncertaintyValues.reduce((sum, value) => sum + value, 0) / uncertaintyValues.length).toFixed(
          2
        )
      : undefined;
  const maxUncertainty =
    uncertaintyValues && uncertaintyValues.length
      ? Math.max(...uncertaintyValues).toFixed(2)
      : undefined;
  const [completedAt, setCompletedAt] = useState("--");
  const previousStatusRef = useRef<JobStatus>(status);
  const datasetFromMetadata = result?.metadata.datasetId;

  useEffect(() => {
    if (status === "Complete" && previousStatusRef.current !== "Complete") {
      setCompletedAt(new Date().toLocaleTimeString("en-GB", { hour12: false }));
    }
    previousStatusRef.current = status;
  }, [status]);

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Result Console</h2>
          <p className="mt-1 text-sm text-slate-400">
            Explore predicted fields, uncertainty, and run metadata.
          </p>
          <p className="mt-1 text-sm text-slate-400">
            {result
              ? `Last run: ${result.metadata.model}, ${
                  result.metadata.fidelityLevel ?? "sim_low"
                }, runtime ${result.metadata.runtimeMs} ms`
              : "Last run: --"}
          </p>
        </div>
        <StatusPill status={status} />
      </div>

      <div className="inline-flex rounded-xl border border-micro-border/80 bg-black/30 p-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => onTabChange(tab)}
            className={[
              "rounded-lg px-3 py-1.5 text-sm transition-colors",
              activeTab === tab
                ? "bg-micro-accent text-black"
                : "border border-micro-border/70 bg-transparent text-slate-400 hover:text-slate-200"
            ].join(" ")}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="relative space-y-4 rounded-xl border border-micro-border bg-black/25 p-4">
        {status === "Running" ? (
          <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-micro-accent to-transparent opacity-90" />
        ) : null}
        <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.16em] text-slate-500">
          <span>{activeTab} View</span>
          <span>{status === "Complete" ? "Prediction ready" : "Awaiting run"}</span>
        </div>

        <div className="overflow-hidden rounded-xl border border-micro-border bg-[#05060b] shadow-inner shadow-black/40">
          <div className="relative">
            {heatmapData ? (
              <Heatmap data={heatmapData} />
            ) : (
              <HeatmapSkeleton isRunning={status === "Running"} />
            )}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.03] via-transparent to-black/20" />
          </div>
        </div>
        <p className="text-xs text-slate-500">
          Legend: darker = lower value, brighter = higher value (normalized 0-1).
        </p>
        <p className="text-xs text-slate-400">
          Uncertainty: mean{" "}
          <span className="font-semibold text-slate-200">{meanUncertainty ?? "--"}</span>, max{" "}
          <span className="font-semibold text-slate-200">{maxUncertainty ?? "--"}</span>
        </p>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-micro-border/80 bg-gradient-to-b from-slate-900/30 to-black/20 p-3">
            <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">Status</p>
            <p className="mt-1 text-lg font-semibold text-slate-200">
              {status === "Complete" ? "Complete ✓" : status}
            </p>
          </div>
          <div className="rounded-lg border border-micro-border/80 bg-gradient-to-b from-slate-900/30 to-black/20 p-3">
            <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">Progress</p>
            <p className="mt-1 text-lg font-semibold text-slate-200">{progress}%</p>
          </div>
          <div className="rounded-lg border border-micro-border/80 bg-gradient-to-b from-slate-900/30 to-black/20 p-3">
            <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">Resolution</p>
            <p className="mt-1 text-lg font-semibold text-slate-200">
              {result?.metadata.resolution ?? "--"}
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-micro-border/80 bg-black/20 p-3">
            <p className="text-[10px] uppercase tracking-[0.14em] text-slate-500">Baseline</p>
            <p className="mt-1 text-xs uppercase tracking-[0.12em] text-slate-500">
              Estimated full simulation
            </p>
            <p className="mt-1 text-sm text-slate-200">≈ 60 min on 16 CPU cores</p>
          </div>
          <div className="rounded-lg border border-micro-border/80 bg-black/20 p-3">
            <p className="text-[10px] uppercase tracking-[0.14em] text-slate-500">Surrogate</p>
            <p className="mt-1 text-xs uppercase tracking-[0.12em] text-slate-500">PRISM surrogate</p>
            <p className="mt-1 text-sm text-slate-200">
              {result ? `${result.metadata.runtimeMs} ms` : "≈ 2–3 s"}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Speedup ≈{" "}
              {result && result.metadata.runtimeMs > 0
                ? `${Math.round(3600000 / result.metadata.runtimeMs)}x`
                : "1500x"}
            </p>
          </div>
        </div>

        {activeTab === "Metadata" && result ? (
          <div className="rounded-lg border border-micro-border/80 bg-black/20 p-3">
            <div className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
              {[
                ["Model", result.metadata.model],
                ["Fidelity", result.metadata.fidelityLevel ?? "--"],
                ["Dataset", datasetFromMetadata ?? "--"],
                ["Resolution", result.metadata.resolution],
                ["Runtime", `${result.metadata.runtimeMs} ms`],
                ["Grain Size", `${result.metadata.grainSize} um`],
                ["Anneal Temp", `${result.metadata.annealTempC} C`],
                ["Scan Speed", `${result.metadata.scanSpeed} mm/s`],
                ["Query (X,Y,Z)", `${result.metadata.x ?? 0}, ${result.metadata.y ?? 0}, ${result.metadata.z ?? 0}`],
                ["Laser Power", result.metadata.laserPower != null ? `${result.metadata.laserPower} W` : "--"],
                ["Completed at", completedAt]
              ].map(([label, value], index) => (
                <div
                  key={label}
                  className={cn(
                    "border-micro-border/60 pb-2",
                    index < 9 ? "border-b" : "border-b-0"
                  )}
                >
                  <dt className="text-xs uppercase tracking-[0.12em] text-slate-500">{label}</dt>
                  <dd className="mt-1 text-slate-200">{value}</dd>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
