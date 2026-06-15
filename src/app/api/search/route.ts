import { searchSolicitationsWithAI, filterOnlyResults } from "@/lib/ai/search";
import { fetchSolicitations } from "@/lib/google/sheets";
import { applyFilters } from "@/lib/solicitations/filters";
import type { SearchRequestBody } from "@/lib/solicitations/types";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SearchRequestBody;
    const query = body.query?.trim() ?? "";
    const filters = body.filters;

    if (!query && !filters?.department && !filters?.solicitationType && !filters?.company) {
      return NextResponse.json(
        { error: "Provide a search query and/or at least one filter" },
        { status: 400 },
      );
    }

    const allRows = await fetchSolicitations();
    const filteredRows = applyFilters(allRows, filters);

    const results = query
      ? await searchSolicitationsWithAI(filteredRows, query)
      : filterOnlyResults(filteredRows);

    return NextResponse.json({ results });
  } catch (error) {
    console.error("[/api/search]", error);
    const message = error instanceof Error ? error.message : "Search failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";

  if (!query) {
    return NextResponse.json(
      { error: "Missing query parameter: q" },
      { status: 400 },
    );
  }

  try {
    const allRows = await fetchSolicitations();
    const results = await searchSolicitationsWithAI(allRows, query);
    return NextResponse.json({ results });
  } catch (error) {
    console.error("[/api/search]", error);
    const message = error instanceof Error ? error.message : "Search failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
