import { QuestionnaireForm } from "@/components/questionnaire/QuestionnaireForm";
import Link from "next/link";

export default function AnalyzePage() {
  return (
    <>
      <section className="hero-mesh border-b border-slate-800/60">
        <div className="container-page py-14 sm:py-16">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm font-medium text-blue-400 hover:text-blue-300"
          >
            ← Back to home
          </Link>
          <span className="badge mt-6">11 questions · about 5 minutes</span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl">
            Tell us about your company
          </h1>
          <p className="mt-3 max-w-xl text-lg text-slate-400">
            Each question explains what we need and why it matters. Your answers are matched against
            290+ federal solicitations to build a tailored recommendation report.
          </p>
        </div>
      </section>

      <section className="container-page -mt-6 pb-20 pt-2 sm:-mt-8">
        <div className="mx-auto max-w-2xl">
          <QuestionnaireForm />
        </div>
      </section>
    </>
  );
}
