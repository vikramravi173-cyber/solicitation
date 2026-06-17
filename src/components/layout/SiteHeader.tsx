import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="no-print sticky top-0 z-40 border-b border-slate-800 bg-slate-950/90 backdrop-blur-lg">
      <div className="container-page flex h-16 items-center justify-between sm:h-[4.5rem]">
        <Link href="/" className="group flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white shadow-md shadow-blue-900/40">
            SM
          </span>
          <div className="hidden sm:block">
            <p className="text-sm font-bold text-slate-100 group-hover:text-blue-400">
              Solicitations Matcher
            </p>
            <p className="text-xs text-slate-500">Federal opportunity intelligence</p>
          </div>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/#how-it-works"
            className="hidden rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition hover:text-blue-400 sm:inline-block"
          >
            How it works
          </Link>
          <Link
            href="/#features"
            className="hidden rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition hover:text-blue-400 md:inline-block"
          >
            Features
          </Link>
          <Link href="/analyze" className="btn-primary !px-5 !py-2.5 text-sm">
            Start analysis
          </Link>
        </nav>
      </div>
    </header>
  );
}
