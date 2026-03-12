"use client";

import { useEffect, useRef, useState } from "react";
import {
  requestPrediction,
  type PredictionRequest,
  type PredictionResponse
} from "@/lib/api/prediction";

export type JobStatus = "Idle" | "Running" | "Complete" | "Error";

type UsePredictionJobReturn = {
  status: JobStatus;
  progress: number;
  result: PredictionResponse | null;
  errorMessage: string | null;
  runJob: (request: PredictionRequest) => Promise<void>;
};

export function usePredictionJob(): UsePredictionJobReturn {
  const [status, setStatus] = useState<JobStatus>("Idle");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function stopProgressTimer() {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  }

  function startProgressTimer() {
    stopProgressTimer();
    progressTimerRef.current = setInterval(() => {
      setProgress((current) => (current >= 92 ? current : current + 4));
    }, 120);
  }

  useEffect(() => {
    return () => {
      stopProgressTimer();
    };
  }, []);

  async function runJob(request: PredictionRequest) {
    setStatus("Running");
    setProgress(0);
    setResult(null);
    setErrorMessage(null);
    startProgressTimer();

    try {
      const response = await requestPrediction(request);
      stopProgressTimer();
      setProgress(100);
      setResult(response);
      setStatus("Complete");
    } catch (error) {
      stopProgressTimer();
      setStatus("Error");
      setProgress(0);
      setErrorMessage(error instanceof Error ? error.message : "Prediction job failed.");
    }
  }

  return { status, progress, result, errorMessage, runJob };
}
