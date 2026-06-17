"use client";

import { KeywordSearch } from "@/components/landing/KeywordSearch";
import Link from "next/link";
import { useEffect, useState } from "react";

interface DatabaseStats {
  configured: boolean;
  count?: number;
  parsedAt?: string;
}

const STEPS = [
  {
    num: "01",
    title: "Company intake",
    desc: "Tell us about your tech stack, TRL, federal experience, and target agencies.",
  },
  {
    num: "02",
    title: "Smart matching",
    desc: "We rank solicitations by keyword overlap, department fit, and catalog signals.",
  },
  {
    num: "03",
    title: "Deep research",
    desc: "Each match is researched from its solicitation link and summarized on one page.",
  },
  {
    num: "04",
    title: "Your report",
    desc: "Get acceptance likelihood scores, top picks, and a pursuit strategy you can share.",
  },
];

const FEATURES = [
  { title: "Match scoring", desc: "Every opportunity ranked by fit against your capabilities and TRL." },
  { title: "Win probability", desc: "Realistic acceptance likelihood based on your profile and experience." },
  { title: "One-page summaries", desc: "Concise deep dives on each solicitation for your BD team." },
  { title: "No API keys", desc: "Runs locally. Catalog parsed from PDF, analysis done on your machine." },
  { title: "Ranked recommendations", desc: "Top picks with rationale so you know what to pursue first." },
  { title: "Print-ready report", desc: "Export or print a polished report for capture managers." },
];

function ReportPreview() {
  const rows = [
    { rank: 1, title: "AFWERX Open Topic Call", score: 87, label: "High" },
    { rank: 2, title: "DIU Commercial Solutions", score: 74, label: "Moderate" },
    { rank: 3, title: "Army xTech Competition", score: 68, label: "Moderate" },
  ];

  return (
    <div className="card-elevated mx-auto w-full max-w-md">
      <p className="text-center text-xs font-semibold uppercase tracking-widest text-blue-400">
        Opportunity Report
      </p>
      <p className="mt-2 text-center text-xl font-bold text-slate-100">Your top matches</p>
      <div className="mt-6 space-y-3">
        {rows.map((row) => (
          <div
            key={row.rank}
            className="flex items-center gap-3 rounded-xl border border-slate-700/60 bg-slate-800/50 p-3"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white">
              {row.rank}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-100">{row.title}</p>
              <p className="text-xs text-slate-500">{row.label}</p>
            </div>
            <p className="text-sm font-bold text-blue-400">{row.score}%</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Hero() {
  const [stats, setStats] = useState<DatabaseStats | null>(null);

  useEffect(() => {
    fetch("/api/database")
      .then((res) => res.json())
      .then((data: DatabaseStats) => setStats(data))
      .catch(() => setStats({ configured: false }));
  }, []);

  return (
    <>
      <section className="hero-mesh border-b border-slate-800/60">
        <div className="container-page section-pad !pb-16 sm:!pb-24">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="text-center lg:text-left">
              <span className="badge">Federal opportunity intelligence</span>
              <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-slate-50 sm:text-5xl lg:text-[3.25rem]">
                Find the solicitations your company should{" "}
                <span className="text-blue-400">actually pursue</span>
              </h1>
              <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-slate-400 lg:mx-0">
                Search by keyword for a quick match, or tell us about your company for a full ranked
                report against the Gov Events &amp; Opportunities database.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4 lg:justify-start">
                <a href="#keyword-search" className="btn-primary">
                  Key word search
                </a>
                <Link href="/analyze" className="btn-secondary">
                  Full company analysis →
                </Link>
                <a href="#how-it-works" className="btn-secondary">
                  How it works
                </a>
              </div>
              {stats?.configured && (
                <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-400 ring-1 ring-emerald-500/25">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  {stats.count} solicitations loaded
                </p>
              )}
            </div>
            <div className="hidden sm:block">
              <ReportPreview />
            </div>
          </div>
        </div>
      </section>

      <section id="keyword-search" className="border-b border-slate-800 bg-slate-950">
        <div className="container-page py-14 sm:py-16">
          <KeywordSearch />
        </div>
      </section>

      <section className="border-b border-slate-800 bg-slate-900/40">
        <div className="container-page py-10">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { value: stats?.count ? `${stats.count}+` : "290+", label: "Solicitations indexed" },
              { value: "< 1 min", label: "Typical analysis time" },
              { value: "4 steps", label: "Intake to report" },
              { value: "$0", label: "API keys required" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-bold text-slate-100 sm:text-3xl">{stat.value}</p>
                <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="section-pad bg-slate-950">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <p className="section-label">Process</p>
            <h2 className="section-title mt-3">How it works</h2>
            <p className="section-subtitle">
              From company profile to a ranked pursuit list in four steps.
            </p>
          </div>
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step) => (
              <div key={step.num} className="card transition hover:border-blue-500/40 hover:shadow-card-lg">
                <p className="text-3xl font-bold text-blue-900">{step.num}</p>
                <h3 className="mt-3 text-lg font-bold text-slate-100">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="section-pad bg-slate-900/30">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <p className="section-label">Capabilities</p>
            <h2 className="section-title mt-3">What you get</h2>
          </div>
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="card">
                <h3 className="text-lg font-bold text-slate-100">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div className="container-page section-pad !py-20 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Ready to find your next win?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-lg text-blue-100">
            Complete the questionnaire and get a ranked report in minutes.
          </p>
          <Link
            href="/analyze"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-bold text-blue-700 shadow-lg transition hover:bg-blue-50 active:scale-[0.98]"
          >
            Begin questionnaire →
          </Link>
        </div>
      </section>
    </>
  );
}
