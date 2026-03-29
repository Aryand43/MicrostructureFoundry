export type FidelityLevel = "sim_low" | "sim_high" | "experiment";

export type PredictionRequest = {
  grainSize: number;
  annealTempC: number;
  scanSpeed: number;
  model: string;
  fidelityLevel?: FidelityLevel;
  datasetId?: string;
  laserPower?: number;
  hatchSpacing?: number;
  layerHeight?: number;
  powderFlowRate?: number;
  length?: number;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  z?: number;
};

export type PredictionResponse = {
  prediction: number[][];
  uncertainty: number[][];
  grainSizeField?: number[][];
  metadata: {
    model: string;
    runtimeMs: number;
    resolution: string;
    grainSize: number;
    annealTempC: number;
    scanSpeed: number;
    fidelityLevel?: FidelityLevel;
  };
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function makeField(size: number, seed: number): number[][] {
  return Array.from({ length: size }, (_, y) =>
    Array.from({ length: size }, (_, x) => {
      const waveA = Math.sin((x + seed) / 2.7);
      const waveB = Math.cos((y - seed) / 3.1);
      const waveC = Math.sin((x * y + seed) / 37);
      const normalized = (waveA + waveB + waveC + 3) / 6;
      return Math.max(0, Math.min(1, normalized));
    })
  );
}

function deriveUncertainty(field: number[][]): number[][] {
  return field.map((row) => row.map((value) => Math.abs(0.5 - value) * 1.9));
}

async function mockPredict(request: PredictionRequest): Promise<PredictionResponse> {
  const runtimeMs = 2000 + Math.floor(Math.random() * 1001);
  await sleep(runtimeMs);
  const fidelityLevel = request.fidelityLevel ?? "sim_low";

  const seed = Math.floor(
    (request.laserPower ?? 200) * 0.3 +
    request.scanSpeed * 1.5 +
    (request.layerHeight ?? 50) * 0.8 +
    (request.x ?? 0) * 2 +
    (request.y ?? 0) * 2 +
    (request.z ?? 0) * 2 +
    request.grainSize * 0.9 +
    request.annealTempC * 0.05
  );
  const prediction = makeField(28, seed);

  return {
    prediction,
    uncertainty: deriveUncertainty(prediction),
    metadata: {
      model: request.model,
      runtimeMs,
      resolution: `${prediction.length}x${prediction[0].length}`,
      grainSize: request.grainSize,
      annealTempC: request.annealTempC,
      scanSpeed: request.scanSpeed,
      fidelityLevel
    }
  };
}

export async function requestPrediction(
  request: PredictionRequest
): Promise<PredictionResponse> {
  // Swap this call to a real endpoint later without touching UI components.
  return mockPredict(request);
}
