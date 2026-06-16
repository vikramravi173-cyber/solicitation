"use client";

import Link from "next/link";

export function Hero() {
  return (
    <section className="text-center">
      <p className="text-sm font-medium uppercase tracking-wide text-blue-600">
        Federal opportunity intelligence
      </p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
        Match your company to the right solicitations
      </h1>
      <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
        Answer questions about your company, and we&apos;ll match you against{" "}
        <strong>290+ federal solicitations</strong> from the Gov Events &amp;
        Opportunities database, research each match, score likelihood of acceptance,
        and deliver a one-page report on what to pursue and why.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Link
          href="/analyze"
          className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Start company analysis
        </Link>
      </div>
      <ol className="mx-auto mt-12 grid max-w-3xl gap-4 text-left sm:grid-cols-4">
        {[
          { step: "1", label: "Company intake", desc: "Capabilities, TRL, experience" },
          { step: "2", label: "Database matching", desc: "AI ranks best solicitations from PDF catalog" },
          { step: "3", label: "Research", desc: "Scrape links + summarize" },
          { step: "4", label: "Report", desc: "Likelihood scores + recommendations" },
        ].map((item) => (
          <li key={item.step} className="rounded-xl border border-slate-200 bg-white p-4">
            <span className="text-xs font-bold text-blue-600">Step {item.step}</span>
            <p className="mt-1 font-semibold text-slate-900">{item.label}</p>
            <p className="mt-1 text-sm text-slate-600">{item.desc}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
