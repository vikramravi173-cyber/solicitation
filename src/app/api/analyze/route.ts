import { appendFileSync } from "fs";
import { join } from "path";
import type { CompanyProfile } from "@/lib/company/questionnaire";
import { COMPANY_QUESTIONS, parseMultiValue } from "@/lib/company/questionnaire";
import { runAnalysis } from "@/lib/pipeline/analyze";
import { NextResponse } from "next/server";

function debugLog(message: string, data: Record<string, unknown>, hypothesisId: string) {
  // #region agent log
  try {
    appendFileSync(
      join(process.cwd(), ".cursor/debug-efdb80.log"),
      `${JSON.stringify({
        sessionId: "efdb80",
        runId: "post-fix",
        hypothesisId,
        location: "api/analyze/route.ts",
        message,
        data,
        timestamp: Date.now(),
      })}\n`,
    );
  } catch {
    // ignore
  }
  // #endregion
}

function validateProfile(body: Partial<CompanyProfile>): string | null {
  for (const question of COMPANY_QUESTIONS) {
    if (!question.required) continue;
    const value = body[question.id];
    if (question.type === "multiselect") {
      if (parseMultiValue(String(value ?? "")).length === 0) {
        return `Missing required field: ${question.label}`;
      }
      continue;
    }
    if (!value || !String(value).trim()) {
      return `Missing required field: ${question.label}`;
    }
  }
  return null;
}

export async function POST(request: Request) {
  debugLog("Analyze POST started", {}, "H6");
  try {
    const body = (await request.json()) as Partial<CompanyProfile>;
    const validationError = validateProfile(body);

    if (validationError) {
      debugLog("Validation failed", { validationError }, "H6");
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const result = await runAnalysis(body as CompanyProfile);
    debugLog("Analyze succeeded", { opportunityCount: result.analyzedOpportunities.length }, "H6");
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Analysis failed";
    debugLog("Analyze failed", { message, stack: error instanceof Error ? error.stack : null }, "H6");
    console.error("[/api/analyze]", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
