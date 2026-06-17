import { fetchSolicitations } from "@/lib/data/solicitations-store";
import { searchSolicitationsByKeywords } from "@/lib/matching/match-solicitations";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { query?: string; limit?: number };
    const query = String(body.query ?? "").trim();

    if (!query) {
      return NextResponse.json({ error: "Search query is required" }, { status: 400 });
    }

    const solicitations = await fetchSolicitations();
    const results = searchSolicitationsByKeywords(
      query,
      solicitations,
      Math.min(20, Math.max(1, body.limit ?? 10)),
    );

    return NextResponse.json({
      query,
      count: results.length,
      results,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Search failed";
    console.error("[/api/search]", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
