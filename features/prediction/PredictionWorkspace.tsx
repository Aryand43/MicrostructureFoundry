"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { usePredictionJob } from "@/features/prediction/usePredictionJob";
import {
  PredictionVisualization,
  type PredictionTab
} from "@/features/prediction/PredictionVisualization";
import { type FidelityLevel } from "@/lib/api/prediction";
import { cn } from "@/lib/utils";

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
      {children}
    </p>
  );
}

function StatusChip({ status }: { status: "Idle" | "Running" | "Complete" | "Error" }) {
  const statusStyles: Record<typeof status, string> = {
    Idle: "border-slate-600/60 bg-slate-700/20 text-slate-300",
    Running: "border-micro-accent/60 bg-micro-accent/20 text-micro-accent animate-pulse",
    Complete: "border-emerald-500/50 bg-emerald-500/15 text-emerald-300",
    Error: "border-red-500/50 bg-red-500/15 text-red-300"
  };

  return (
    <span
      className={cn(
        "rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em]",
        statusStyles[status]
      )}
    >
      {status}
    </span>
  );
}

export function PredictionWorkspace() {
  const [grainSize, setGrainSize] = useState(42);
  const [annealTempC, setAnnealTempC] = useState(900);
  const [scanSpeed, setScanSpeed] = useState(14);
  const [datasetId, setDatasetId] = useState<string>("exp-001");
  const [model, setModel] = useState("AtlasNet-v1");
  const [fidelityLevel, setFidelityLevel] = useState<FidelityLevel>("sim_low");
  const [activeTab, setActiveTab] = useState<PredictionTab>("Prediction");
  const { status, progress, result, errorMessage, runJob } = usePredictionJob();
  const isSubmitting = status === "Running";

  async function handlePredict() {
    const requestPayload = {
      grainSize,
      annealTempC,
      scanSpeed,
      model,
      fidelityLevel,
      datasetId
    };
    await runJob(requestPayload);
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
      <Card className="space-y-4 xl:sticky xl:top-8 xl:h-fit">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Experiment Setup</h2>
          <p className="mt-2 text-sm text-slate-400">
            Configure data, process parameters, and model.
          </p>
        </div>

        <SectionLabel>Input data</SectionLabel>
        <div className="space-y-2">
          <span className="text-sm text-slate-400">Microstructure File</span>
          <label className="flex cursor-not-allowed items-center justify-between rounded-xl border border-dashed border-micro-border/80 bg-black/20 px-4 py-3 text-sm text-slate-500">
            <span>Upload disabled (coming soon)</span>
            <span className="rounded-md border border-micro-border px-2 py-0.5 text-xs">
              .csv / .h5
            </span>
            <input type="file" disabled className="hidden" />
          </label>
        </div>
        <label className="block space-y-2">
          <span className="text-sm text-slate-400">Dataset</span>
          <select
            value={datasetId}
            onChange={(event) => setDatasetId(event.target.value)}
            className="w-full rounded-xl border border-micro-border bg-micro-bg-soft px-3 py-2 text-sm text-slate-200 transition-colors outline-none ring-0 hover:border-micro-accent/50 focus:border-micro-accent"
          >
            <option value="exp-001">exp-001 (central track)</option>
            <option value="exp-002">exp-002 (edge track)</option>
            <option value="sim-001">sim-001 (baseline sim)</option>
          </select>
        </label>

        <div className="mt-4 border-t border-micro-border/60 pt-4">
          <SectionLabel>Process parameters</SectionLabel>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <div className="rounded-lg border border-micro-border/70 bg-black/20 px-3 py-2 text-xs">
              <p className="uppercase tracking-[0.12em] text-slate-500">Grain Size</p>
              <p className="mt-1 text-sm font-medium text-slate-200">{grainSize} um</p>
            </div>
            <div className="rounded-lg border border-micro-border/70 bg-black/20 px-3 py-2 text-xs">
              <p className="uppercase tracking-[0.12em] text-slate-500">Anneal Temp</p>
              <p className="mt-1 text-sm font-medium text-slate-200">{annealTempC} C</p>
            </div>
            <div className="rounded-lg border border-micro-border/70 bg-black/20 px-3 py-2 text-xs sm:col-span-2">
              <p className="uppercase tracking-[0.12em] text-slate-500">Scan Speed</p>
              <p className="mt-1 text-sm font-medium text-slate-200">{scanSpeed} mm/s</p>
            </div>
          </div>
        </div>

        <label className="block space-y-2">
          <span className="text-sm text-slate-400">Mean Grain Size (um): {grainSize}</span>
          <input
            className="w-full accent-micro-accent"
            type="range"
            min={5}
            max={140}
            step={1}
            value={grainSize}
            onChange={(event) => setGrainSize(Number(event.target.value))}
          />
        </label>
        <label className="block space-y-2">
          <span className="text-sm text-slate-400">Anneal Temperature (C): {annealTempC}</span>
          <input
            className="w-full accent-micro-accent"
            type="range"
            min={500}
            max={1300}
            step={10}
            value={annealTempC}
            onChange={(event) => setAnnealTempC(Number(event.target.value))}
          />
        </label>
        <label className="block space-y-2">
          <span className="text-sm text-slate-400">Scan Speed (mm/s): {scanSpeed}</span>
          <input
            className="w-full accent-micro-accent"
            type="range"
            min={1}
            max={40}
            step={1}
            value={scanSpeed}
            onChange={(event) => setScanSpeed(Number(event.target.value))}
          />
        </label>

        <div className="mt-4 border-t border-micro-border/60 pt-4">
          <SectionLabel>Model & fidelity</SectionLabel>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-sm text-slate-400">Model</span>
              <select
                value={model}
                onChange={(event) => setModel(event.target.value)}
                className="w-full rounded-xl border border-micro-border bg-micro-bg-soft px-3 py-2 text-sm text-slate-200 transition-colors outline-none ring-0 hover:border-micro-accent/50 focus:border-micro-accent"
              >
                <option>AtlasNet-v1</option>
                <option>AtlasNet-v2</option>
                <option>Diffusion-Lite</option>
              </select>
            </label>
            <label className="block space-y-2">
              <span className="text-sm text-slate-400">Fidelity</span>
              <select
                value={fidelityLevel}
                onChange={(event) => setFidelityLevel(event.target.value as FidelityLevel)}
                className="w-full rounded-xl border border-micro-border bg-micro-bg-soft px-3 py-2 text-sm text-slate-200 transition-colors outline-none ring-0 hover:border-micro-accent/50 focus:border-micro-accent"
              >
                <option value="sim_low">Simulation - low</option>
                <option value="sim_high">Simulation - high</option>
                <option value="experiment">Experiment-calibrated</option>
              </select>
            </label>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Fidelity indicates how much we trust simulation vs experiment.
          </p>
        </div>

        <div className="mt-4 border-t border-micro-border/60 pt-4">
          <Button
            onClick={handlePredict}
            disabled={isSubmitting}
            className="w-full py-2.5 text-sm transition-transform hover:scale-[1.01] hover:shadow-[0_10px_30px_rgba(111,167,255,0.35)]"
          >
          {isSubmitting ? "Running Prediction..." : "Run Prediction"}
          </Button>
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.12em] text-slate-500">
              <div className="flex items-center gap-2">
                <span>Status: {status}</span>
                <StatusChip status={status} />
              </div>
              <span>{progress}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full border border-micro-border/80 bg-black/40">
              <div
                className={cn(
                  "h-full bg-micro-accent transition-all duration-200",
                  status === "Running"
                    ? "shadow-[0_0_14px_rgba(111,167,255,0.8)]"
                    : "shadow-[0_0_8px_rgba(111,167,255,0.45)]"
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
            {errorMessage ? <p className="text-xs text-red-300">{errorMessage}</p> : null}
          </div>
        </div>
      </Card>

      <Card>
        <PredictionVisualization
          status={status}
          progress={progress}
          result={result}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </Card>
    </div>
  );
}
