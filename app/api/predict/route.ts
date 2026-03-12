import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();

  return NextResponse.json(
    {
      status: "accepted",
      message: "Prediction endpoint is scaffolded and ready for model integration.",
      received: body
    },
    { status: 202 }
  );
}
