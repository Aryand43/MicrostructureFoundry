import { NextResponse } from "next/server";
import { requestPrediction, type PredictionRequest } from "@/lib/api/prediction";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<PredictionRequest>;
    const {
      grainSize,
      annealTempC,
      scanSpeed,
      model,
      fidelityLevel
    } = body;

    const isValid =
      typeof grainSize === "number" &&
      typeof annealTempC === "number" &&
      typeof scanSpeed === "number" &&
      typeof model === "string";

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid prediction request payload." },
        { status: 400 }
      );
    }

    const response = await requestPrediction({
      grainSize,
      annealTempC,
      scanSpeed,
      model,
      fidelityLevel
    });

    return NextResponse.json(response, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Prediction endpoint failed." }, { status: 500 });
  }
}
