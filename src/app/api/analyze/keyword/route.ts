import { runKeywordOpportunityAnalysis } from "@/lib/pipeline/analyze";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { query?: string; rowIndex?: number };
    const query = String(body.query ?? "").trim();
    const rowIndex = Number(body.rowIndex);

    if (!query) {
      return NextResponse.json({ error: "Search query is required" }, { status: 400 });
    }
    if (!Number.isFinite(rowIndex)) {
      return NextResponse.json({ error: "Valid rowIndex is required" }, { status: 400 });
    }

    const result = await runKeywordOpportunityAnalysis(query, rowIndex);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Analysis failed";
    console.error("[/api/analyze/keyword]", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
