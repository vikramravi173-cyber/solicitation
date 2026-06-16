import { QuestionnaireForm } from "@/components/questionnaire/QuestionnaireForm";
import Link from "next/link";

export default function AnalyzePage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="text-sm text-blue-700 hover:underline">
          ← Back to home
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">Company intake</h1>
        <p className="mt-2 text-slate-600">
          Tell us about your company so we can match you to the best solicitations and
          build your recommendation report.
        </p>
        <div className="mt-8">
          <QuestionnaireForm />
        </div>
      </div>
    </main>
  );
}
