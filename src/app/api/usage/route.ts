import { NextResponse } from "next/server";
import { haalUsageOp } from "@/lib/usage-tracker";

export async function GET() {
  try {
    const data = await haalUsageOp();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Usage ophalen mislukt:", error);
    return NextResponse.json(
      { error: "Kon usage data niet ophalen." },
      { status: 500 }
    );
  }
}
