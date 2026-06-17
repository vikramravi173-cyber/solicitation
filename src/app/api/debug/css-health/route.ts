import { NextResponse } from "next/server";
import { appendFileSync, existsSync, readdirSync } from "fs";
import { join } from "path";

export async function GET() {
  const cssDir = join(process.cwd(), ".next/static/css");
  const appCssDir = join(cssDir, "app");
  const cssFiles = existsSync(cssDir) ? readdirSync(cssDir, { recursive: true }) : [];

  let layoutCssStatus = 0;
  let layoutCssContentType = "";
  try {
    const res = await fetch("http://localhost:3000/_next/static/css/app/layout.css", {
      cache: "no-store",
    });
    layoutCssStatus = res.status;
    layoutCssContentType = res.headers.get("content-type") ?? "";
  } catch (err) {
    layoutCssStatus = -1;
    layoutCssContentType = err instanceof Error ? err.message : "fetch failed";
  }

  const logData = {
    cssDirExists: existsSync(cssDir),
    appCssDirExists: existsSync(appCssDir),
    cssFilesOnDisk: cssFiles,
    layoutCssFetchStatus: layoutCssStatus,
    layoutCssContentType,
    cwd: process.cwd(),
  };

  // #region agent log
  try {
    appendFileSync(
      join(process.cwd(), ".cursor/debug-efdb80.log"),
      `${JSON.stringify({
        sessionId: "efdb80",
        runId: "pre-fix",
        hypothesisId: "H4",
        location: "api/debug/css-health/route.ts",
        message: "CSS health check",
        data: logData,
        timestamp: Date.now(),
      })}\n`,
    );
  } catch {
    // ignore
  }
  // #endregion

  return NextResponse.json(logData);
}
