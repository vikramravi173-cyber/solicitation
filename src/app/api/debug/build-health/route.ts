import { existsSync, readdirSync } from "fs";
import { join } from "path";
import { NextResponse } from "next/server";

const LOG_PATH = join(process.cwd(), ".cursor/debug-0ef118.log");

function agentLog(
  message: string,
  data: Record<string, unknown>,
  hypothesisId: string,
) {
  // #region agent log
  try {
    const { appendFileSync } = require("fs") as typeof import("fs");
    appendFileSync(
      LOG_PATH,
      `${JSON.stringify({
        sessionId: "0ef118",
        runId: "pre-fix",
        hypothesisId,
        location: "api/debug/build-health/route.ts",
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

export async function GET() {
  const serverDir = join(process.cwd(), ".next/server");
  const chunksDir = join(serverDir, "chunks");
  const chunk276Server = join(serverDir, "276.js");
  const chunk276Chunks = join(chunksDir, "276.js");
  const chunk682Server = join(serverDir, "682.js");
  const chunk682Chunks = join(chunksDir, "682.js");

  const data = {
    serverDirExists: existsSync(serverDir),
    chunksDirExists: existsSync(chunksDir),
    chunk276AtServerRoot: existsSync(chunk276Server),
    chunk276InChunksDir: existsSync(chunk276Chunks),
    chunk682AtServerRoot: existsSync(chunk682Server),
    chunk682InChunksDir: existsSync(chunk682Chunks),
    serverRootFiles: existsSync(serverDir)
      ? readdirSync(serverDir).filter((f) => f.endsWith(".js")).slice(0, 20)
      : [],
    chunkFiles: existsSync(chunksDir) ? readdirSync(chunksDir).slice(0, 20) : [],
    webpackRuntimeExists: existsSync(join(serverDir, "webpack-runtime.js")),
    nodeEnv: process.env.NODE_ENV ?? "unset",
  };

  // H1: stale prod build — chunks in chunks/ but runtime expects server root
  agentLog("chunk path probe", data, "H1");
  // H2: missing chunks entirely after partial rebuild
  agentLog(
    "chunk missing check",
    {
      any276: data.chunk276AtServerRoot || data.chunk276InChunksDir,
      any682: data.chunk682AtServerRoot || data.chunk682InChunksDir,
    },
    "H2",
  );
  // H3: webpack-runtime out of sync with chunk layout
  agentLog(
    "runtime sync check",
    {
      runtimeExists: data.webpackRuntimeExists,
      mismatch:
        !data.chunk276AtServerRoot &&
        data.chunk276InChunksDir &&
        data.webpackRuntimeExists,
    },
    "H3",
  );

  const healthy =
    data.chunk276AtServerRoot ||
    (!data.webpackRuntimeExists && data.chunksDirExists);

  return NextResponse.json({ ...data, healthy });
}
