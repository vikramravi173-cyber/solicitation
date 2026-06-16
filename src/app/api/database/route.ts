import { getSolicitationsDatabaseMeta } from "@/lib/data/solicitations-store";
import { NextResponse } from "next/server";

export async function GET() {
  const meta = getSolicitationsDatabaseMeta();

  if (!meta) {
    return NextResponse.json({
      configured: false,
      message:
        "Solicitations database not found. Run npm run parse-pdf to generate data/solicitations.json from the PDF.",
    });
  }

  return NextResponse.json({
    configured: true,
    ...meta,
    message: `${meta.count} solicitations loaded from ${meta.source}`,
  });
}
