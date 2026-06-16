import type { CompanyProfile } from "@/lib/company/questionnaire";
import { COMPANY_QUESTIONS } from "@/lib/company/questionnaire";
import { runAnalysis } from "@/lib/pipeline/analyze";
import { NextResponse } from "next/server";

function validateProfile(body: Partial<CompanyProfile>): string | null {
  for (const question of COMPANY_QUESTIONS) {
    if (!question.required) continue;
    const value = body[question.id];
    if (!value || !String(value).trim()) {
      return `Missing required field: ${question.label}`;
    }
  }
  return null;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<CompanyProfile>;
    const validationError = validateProfile(body);

    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const result = await runAnalysis(body as CompanyProfile);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[/api/analyze]", error);
    const message = error instanceof Error ? error.message : "Analysis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
