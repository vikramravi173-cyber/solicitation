import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="no-print border-t border-slate-800 bg-slate-900/50">
      <div className="container-page section-pad !py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white">
                SM
              </span>
              <span className="font-bold text-slate-100">Solicitations Matcher</span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
              Match your company to federal solicitations from the Gov Events &amp; Opportunities
              catalog. Research, score, and prioritize — all in one report.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-200">Product</p>
            <ul className="mt-4 space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/analyze" className="hover:text-blue-400">
                  Company analysis
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-blue-400">
                  How it works
                </Link>
              </li>
              <li>
                <Link href="/#features" className="hover:text-blue-400">
                  Features
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-200">Data source</p>
            <p className="mt-4 text-sm leading-relaxed text-slate-400">
              Gov Events &amp; Opportunities PDF catalog, parsed locally. No API keys required.
            </p>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-800 pt-8 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} Solicitations Matcher. Built for federal BD teams.
        </div>
      </div>
    </footer>
  );
}
