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

export function PredictionWorkspace() {
  const [grainSize, setGrainSize] = useState(42);
  const [annealTempC, setAnnealTempC] = useState(900);
  const [scanSpeed, setScanSpeed] = useState(14);
  const [model, setModel] = useState("AtlasNet-v1");
  const [fidelityLevel, setFidelityLevel] = useState<FidelityLevel>("sim_low");
  const [activeTab, setActiveTab] = useState<PredictionTab>("Prediction");
  const { status, progress, result, errorMessage, runJob } = usePredictionJob();
  const isSubmitting = status === "Running";

  async function handlePredict() {
    await runJob({ grainSize, annealTempC, scanSpeed, model, fidelityLevel });
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
      <Card className="space-y-5 xl:sticky xl:top-8 xl:h-fit">
        <div>
          <h2 className="text-xl font-medium">Control Panel</h2>
          <p className="mt-2 text-sm text-slate-400">
            Configure inputs and launch a prediction run.
          </p>
        </div>
        <div className="space-y-2">
          <span className="text-sm text-slate-400">Microstructure File</span>
          <label className="flex cursor-not-allowed items-center justify-between rounded-xl border border-dashed border-micro-border bg-black/20 px-4 py-3 text-sm text-slate-500">
            <span>Upload disabled (coming soon)</span>
            <span className="rounded-md border border-micro-border px-2 py-0.5 text-xs">
              .csv / .h5
            </span>
            <input type="file" disabled className="hidden" />
          </label>
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
        <label className="block space-y-2">
          <span className="text-sm text-slate-400">Model</span>
          <select
            value={model}
            onChange={(event) => setModel(event.target.value)}
            className="w-full rounded-xl border border-micro-border bg-micro-bg px-3 py-2 text-sm text-slate-200 outline-none ring-0 focus:border-micro-accent"
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
            className="w-full rounded-xl border border-micro-border bg-micro-bg px-3 py-2 text-sm text-slate-200 outline-none ring-0 focus:border-micro-accent"
          >
            <option value="sim_low">Simulation - low</option>
            <option value="sim_high">Simulation - high</option>
            <option value="experiment">Experiment-calibrated</option>
          </select>
        </label>
        <Button onClick={handlePredict} disabled={isSubmitting}>
          {isSubmitting ? "Running Prediction..." : "Run Prediction"}
        </Button>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.12em] text-slate-500">
            <span>Status: {status}</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full border border-micro-border bg-black/40">
            <div
              className="h-full bg-micro-accent transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
          {errorMessage ? <p className="text-xs text-red-300">{errorMessage}</p> : null}
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
