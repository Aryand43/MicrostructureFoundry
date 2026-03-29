# PRISM / MicrostructureFoundry – Development Instructions

This document explains how to work on this codebase so that:
- The UI stays research‑grade and matte‑black.
- The architecture stays clean and feature‑oriented.
- We can plug in serious probabilistic / multi‑fidelity models later without rewrites.
- The project doubles as a learning lab for uncertainty, optimization, and digital‑engineering ML.

---

## 1. High‑level product intent

PRISM is a research‑grade interface for **spatial microstructure prediction** and related digital‑engineering workflows.

Core ideas:

- Replace or accelerate expensive experiments / simulations using learned surrogates.
- Make **uncertainty** a first‑class UI concept, not an afterthought.
- Stay **microstructure‑ and melt‑pool‑centric** (additive manufacturing), not a generic ML dashboard.
- Keep a clean seam to backends (Python, DIM‑GP‑style models, BO engines, etc.).

The closest mental model is “Stochos, but specialized for additive microstructure + melt pool physics.”

---

## 2. Tech stack and philosophy

- Framework: **Next.js (App Router)** with TypeScript (strict).
- Styling: **Tailwind CSS v4** via `@tailwindcss/postcss`.
- UI components: lightweight, Tailwind‑first; no design libraries.
- Data layer: typed contracts in `lib/api/*` that mirror backend payloads.

Guiding principles:

1. **TypeScript everywhere.** No JS files.
2. **Server components by default.** Use `"use client"` only where needed (state, DOM APIs, hooks).
3. **Feature‑first structure.** Domain behavior lives in `features/<domain>`; primitives in `components/ui`.
4. **API seam stability.** The rest of the app should not care whether the model is mocked, local, or remote.

---

## 3. Repository structure

Important directories:

- `app/`
  - `page.tsx` – Landing route shell.
  - `predict/page.tsx` – Prediction route shell (control + visualization layout).
  - `api/predict/route.ts` – HTTP API endpoint for prediction (backend integration seam).
  - `globals.css` – Tailwind base and theme tokens.
  - `layout.tsx` – Root layout using the `Shell` primitive.

- `features/`
  - `landing/`
    - `Hero.tsx` – Landing hero.
    - `ValuePillars.tsx` – (optional) value cards for the landing page.
  - `prediction/`
    - `PredictionWorkspace.tsx` – Control panel + right‑hand visualization card.
    - `PredictionVisualization.tsx` – Tabs, heatmap, uncertainty, metadata.
    - `usePredictionJob.ts` – Client hook orchestrating prediction calls and progress.

- `components/ui/`
  - `Button.tsx` – Reusable button.
  - `Card.tsx` – Surface container with consistent shadows/borders.
  - `shell.tsx` – Full‑page shell, grid + noise overlays, content container.

- `lib/`
  - `utils.ts` – `cn` helper for classNames.
  - `api/prediction.ts` – **Single source of truth** for prediction request/response types and mock model.

- `docs/`
  - `architecture.md` – High‑level architecture and API readiness plan.

Do not move files across these layers without a clear reason.

---

## 4. Design system and UX rules

- Base palette:
  - `micro-bg` – primary background.
  - `micro-bg-soft` – raised surfaces.
  - `micro-border` – dividers and outlines.
  - `micro-accent` – accent color for selection, links, progress.

- Layout and visuals:
  - Use `Shell` for all pages to get:
    - Full‑viewport matte background.
    - Subtle grid and noise overlays.
    - Centered content max‑width.
  - Use `Card` for any raised, focused content area (control panels, visualizations, metric blocks).

- Typography and tone:
  - Titles: short, descriptive (e.g. “Microstructure Model Runner”).
  - Labels: domain‑specific (melt pool depth, grain size, anneal temperature, etc.).
  - Copy: concise, “research UI” tone – minimal adjectives, no marketing fluff.

- Tabs and panels:
  - Prefer tabs for view modes (Prediction / Uncertainty / Metadata / later Optimization).
  - Don’t nest tabs inside tabs.
  - Avoid modals if a card or panel will do.

---

## 5. Coding style and architecture

### 5.1 React components

- Default to **server components** under `app/` and `features/` unless:
  - You use hooks (`useState`, `useEffect`, custom hooks).
  - You need browser APIs (file input, window, etc.).
- Client components must start with `"use client";` at the top.

Patterns:

- Small, composable components.
- No large monolithic pages; put behavior into `features/` modules.
- UI primitives (`Button`, `Card`, `Shell`) stay dumb; no domain logic in `components/ui`.

### 5.2 TypeScript and types

- All domain payloads go through `lib/api/*`.
- `PredictionRequest` and `PredictionResponse` are **authoritative** for the prediction pipeline.
  - UI reads these types.
  - API handlers validate against them.
  - Backend implementation or mocks must conform to them.

When adding fields:

- Update the type in `lib/api/prediction.ts`.
- Update `/api/predict` input/output expectations.
- Plumb through `usePredictionJob` if needed.
- Surface relevant pieces in UI (e.g. Metadata tab).

### 5.3 Tailwind usage

- Prefer Tailwind utilities over custom CSS unless:
  - You are defining global typography, base body styles, or overlays (`globals.css`).
- Use `cn()` to merge class names; avoid inline `[cond && "class"]` arrays without `cn`.

---

## 6. Prediction pipeline contract

### 6.1 Request

Current shape (subject to extension):

```ts
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
```

Rules:

- All numeric fields are in **SI‑like units** and clearly labeled in the UI:
  - `grainSize` – micrometers.
  - `annealTempC` – Celsius.
  - `scanSpeed` – mm/s.
  - `laserPower` – watts.
  - `hatchSpacing` – micrometers.
  - `layerHeight` – micrometers.
  - `powderFlowRate` – g/min.
  - `length`, `width`, `height` – millimeters.
  - `x`, `y`, `z` – spatial query coordinates.
- Any new fields should have:
  - A clear domain meaning.
  - Matching labels in control panel UI.

### 6.2 Response

Current shape:

```ts
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
    datasetId?: string;
    x?: number;
    y?: number;
    z?: number;
    laserPower?: number;
    layerHeight?: number;
  };
};
```

Rules:

- `prediction` and `uncertainty` are normalized to [0, 1] for visualization.
- `metadata` must be sufficient for:
  - Debugging.
  - Displaying basic run info in the Metadata tab.
  - Comparing to baselines later (runtime, fidelity, dataset IDs, etc.).

Do **not** break these shapes; extend them when needed.

---

## 7. API route (`/api/predict`)

File: `app/api/predict/route.ts`

Responsibilities:

- Accept JSON body matching `PredictionRequest`.
- **Validate** basic structure (when a validation library is introduced).
- Call the model implementation or mock.
- Return `PredictionResponse` with appropriate HTTP status.

Current implementation is a stub that echoes the body. Future guidelines:

- Do not put heavy model logic directly inside the route.
- Keep model calls in a separate module (e.g. `lib/api/prediction.ts` or `lib/model/*`).
- Maintain backward‑compatible responses as much as possible.

---

## 8. Feature: Prediction workspace

File: `features/prediction/PredictionWorkspace.tsx`

Responsibilities:

- Present the **control panel**:
  - Microstructure file placeholder (CSV / H5).
  - Process parameters (sliders).
  - Model selection.
  - Run button + progress bar + basic status/error messages.

- Orchestrate prediction jobs:
  - Use `usePredictionJob()` to manage status and result.
  - Pass status/progress/result down to `PredictionVisualization`.

Rules:

- All domain parameters should be:
  - Clearly labeled with units.
  - Within realistic ranges (based on experiments when available).
- Any new control (e.g. fidelity level, dataset ID) should:
  - Bind to `PredictionRequest`.
  - Surface something meaningful in the UI.

---

## 9. Feature: Prediction visualization

File: `features/prediction/PredictionVisualization.tsx`

Responsibilities:

- Show a tabbed visualization of the prediction output:
  - `Prediction` – main field heatmap.
  - `Uncertainty` – uncertainty heatmap.
  - `Metadata` – textual metadata (runtime, model name, parameter values, etc.).

- Present job status:
  - Status, progress, resolution, and any summary metrics.

Implementation details:

- `Heatmap` renders `number[][]` as a grid with color encoding.
- `HeatmapSkeleton` shows a nice loading state when no data is available.
- Tabs are simple buttons with a selected vs unselected style.

Extension guidelines:

- When adding a new tab (e.g. `Optimization`, `Benchmark`):
  - Update the `tabs` array.
  - Add tab‑specific rendering logic inside the main component.
- Keep per‑tab content focused; avoid complex nested layouts.

---

## 10. Hooks: `usePredictionJob`

File: `features/prediction/usePredictionJob.ts`

Responsibilities:

- Orchestrate a single prediction run:
  - Manage `status`, `progress`, `result`, `errorMessage`.
  - Provide a `runJob` function to fire a prediction.
  - Simulate progress until the backend returns.

Rules:

- `runJob` must always:
  - Reset previous `result` and `errorMessage`.
  - Set `status` to `"Running"` at start and `"Complete"`/`"Error"` at end.
- Progress logic can be refined, but should:
  - Never jump backwards.
  - Reach 100% on success, or reset on error.

When integrating a real backend:

- Use `requestPrediction()` from `lib/api/prediction.ts`.
- Handle network and backend errors gracefully, with actionable messages.

---

## 11. Learning‑while‑building guidelines

This repo is also a **learning lab** for:

- Probabilistic ML (mean + uncertainty).
- Multi‑fidelity modeling.
- Simple Bayesian optimization.
- Digital‑engineering UX patterns.

Approach:

1. **Feature first, depth second.**
   - Add a small UI + type placeholder for a capability (e.g. `fidelityLevel`).
   - Then deepen the math/ML behind it when needed.

2. **Tiny loops.**
   - One change per session (30–90 minutes).
   - End each session with a working app (even if data is mocked).

3. **Use agents as pair‑dev and tutor.**
   - Ask for:
     - Concrete diffs for specific files.
     - Explanations tied to this codebase (e.g. “explain GP uncertainty in the context of our PredictionResponse”).

---

## 12. Adding new features

When adding anything non‑trivial, follow this checklist:

1. Clarify intent:
   - What user problem does this solve?
   - Is it prediction, uncertainty, optimization, or visualization oriented?

2. Decide layer:
   - UI primitive? → `components/ui`.
   - Feature behavior? → `features/<domain>`.
   - Data contract, client helper, or model call? → `lib/api` or `lib/model`.

3. Extend types:
   - Update `PredictionRequest` / `PredictionResponse` if needed.
   - Document new fields via comments.

4. Wire through:
   - Update `usePredictionJob` and any feature components.
   - Update `/api/predict` to accept/produce the new fields.

5. Keep it shippable:
   - Even if the backend is mocked, UI should render meaningful placeholders.

---

## 13. Do and don’t

**Do:**

- Keep components small and composable.
- Extend `PredictionRequest/Response` instead of inventing ad‑hoc payloads.
- Use domain language in labels and docs (melt pool, grain size, etc.).
- Keep the matte‑black aesthetic consistent.

**Don’t:**

- Introduce new dependencies without a short trade‑off discussion.
- Put heavy logic in React components or API route handlers.
- Break existing contracts silently.
- Add marketing‑y copy; this is a research tool.

---

## 14. Quick start (for new contributors)

1. Install dependencies:
   - `npm install` or `pnpm install`.

2. Run the dev server:
   - `npm run dev`.

3. Open:
   - `http://localhost:3000` – landing page.
   - `http://localhost:3000/predict` – prediction workspace.

4. First files to read:
   - `docs/architecture.md`
   - `lib/api/prediction.ts`
   - `features/prediction/PredictionWorkspace.tsx`
   - `features/prediction/PredictionVisualization.tsx`

Keep this file up to date as the product and modeling stack evolve.