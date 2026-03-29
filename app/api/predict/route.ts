import { NextResponse } from "next/server";
import { requestPrediction, type PredictionRequest } from "@/lib/api/prediction";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<PredictionRequest>;

    const isValid =
      typeof body.annealTempC === "number" &&
      typeof body.scanSpeed === "number" &&
      typeof body.model === "string";

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid prediction request payload." },
        { status: 400 }
      );
    }

    const response = await requestPrediction(body as PredictionRequest);

    return NextResponse.json(response, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Prediction endpoint failed." }, { status: 500 });
  }
}
