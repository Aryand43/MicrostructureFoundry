# PRISM Architecture

## Stack

- Framework: Next.js 16 (App Router)
- Language: TypeScript (strict mode)
- Styling: Tailwind CSS v4 via `@tailwindcss/postcss`
- Runtime targets:
  - UI routes in `app/`
  - API route scaffold in `app/api/predict/route.ts`

## Product Goals

- Deliver a matte-black, research-grade interface with minimal visual noise.
- Keep the UI interactive and exploratory for spatial microstructure experiments.
- Preserve a clean contract for future model inference backend integration.

## Folder Strategy (Feature-Based)

```text
app/
  api/predict/route.ts         # backend integration seam
  predict/page.tsx             # prediction route shell
  globals.css                  # global theme and Tailwind base
  layout.tsx                   # shared frame + metadata
  page.tsx                     # landing route shell

features/
  landing/
    Hero.tsx
  prediction/
    PredictionWorkspace.tsx

components/
  ui/
    Button.tsx
    Card.tsx

lib/
  utils.ts                     # className helper and shared helpers

docs/
  architecture.md
```

## Routing and Responsibilities

- `/`:
  - Uses `features/landing/*` modules.
  - Full-screen hero with title, subtitle, and direct action into prediction flow.
- `/predict`:
  - Uses `features/prediction/PredictionWorkspace.tsx`.
  - Hosts split layout with left controls, right visualization tabs, and API dispatch logic.
- `/api/predict`:
  - Handles `POST` with a stubbed `202 Accepted` response.
  - Serves as the stable interface for later model-serving integration.

## UI Design Foundation

- Dark-first matte palette is defined as theme tokens in `app/globals.css`.
- Reusable primitives (`Button`, `Card`) enforce consistency and reduce duplication.
- Minimal chrome with high information contrast:
  - subtle grid overlays
  - soft borders
  - restrained accent usage

## API Readiness Plan

Current state:
- Client sends JSON payload to `/api/predict`.
- API route returns accepted + echo payload as placeholder.

Next integration steps:
1. Define `PredictionRequest` and `PredictionResponse` shared types in `lib/`.
2. Add validation (e.g., zod) at API boundary.
3. Replace stub logic with model inference service call.
4. Add loading, error, and confidence state rendering in `PredictionWorkspace`.
5. Add tracing/logging for experiment reproducibility.
