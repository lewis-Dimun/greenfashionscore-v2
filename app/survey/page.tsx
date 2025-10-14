"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { scoringEndpointPath, FUNCTIONS_HEADERS } from "../../lib/config";
import { useSurveyStore } from "../../lib/state/surveyStore";
import { isSurveyValid } from "../../lib/validation/survey";
import AuthGuard from "../../components/AuthGuard";
import { getQuestionsByDimension, type SurveyQuestion } from "../../lib/survey/questions";

const STEPS = [
  { key: "people", title: "People", description: "Condiciones laborales y bienestar" },
  { key: "planet", title: "Planet", description: "Impacto ambiental y emisiones" },
  { key: "materials", title: "Materials", description: "Sostenibilidad de materiales" },
  { key: "circularity", title: "Circularity", description: "Economía circular y durabilidad" }
];

export default function SurveyWizardPage() {
  const draft = useSurveyStore();
  const [stepIndex, setStepIndex] = useState(draft.stepIndex);
  const nextButtonRef = useRef<HTMLButtonElement | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    nextButtonRef.current?.focus();
  }, [stepIndex]);

  function goNext() {
    setStepIndex((i) => {
      const ni = Math.min(i + 1, STEPS.length - 1);
      draft.setStepIndex(ni);
      return ni;
    });
  }
  function goPrev() {
    setStepIndex((i) => {
      const ni = Math.max(i - 1, 0);
      draft.setStepIndex(ni);
      return ni;
    });
  }

  const current = STEPS[stepIndex];
  const questions = getQuestionsByDimension(current.key);

  return (
    <AuthGuard>
      <main aria-label="Encuesta Green Fashion Score" className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div role="progressbar" aria-label="Progreso del cuestionario" aria-valuemin={1} aria-valuemax={STEPS.length} aria-valuenow={stepIndex + 1} className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Paso {stepIndex + 1} de {STEPS.length}</span>
            <span className="text-sm font-medium text-gray-700">{Math.round(((stepIndex + 1) / STEPS.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-emerald-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${((stepIndex + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>
        
        <section aria-label={`Sección ${current.title}`} className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <div className="text-center mb-8">
            <h2 tabIndex={-1} className="text-3xl font-bold text-gray-900 mb-2">{current.title}</h2>
            <p className="text-lg text-gray-600">{current.description}</p>
          </div>
          
          <div className="space-y-8">
            {questions.map((question, qIndex) => (
              <div key={question.id} className="border-b border-gray-100 pb-6 last:border-b-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {qIndex + 1}. {question.question}
                </h3>
                <div className="space-y-3">
                  {question.options.map((option) => (
                    <label key={option.value} className="flex items-start space-x-3 cursor-pointer group">
                      <input
                        type="radio"
                        name={question.id}
                        value={option.value}
                        className="mt-1 h-4 w-4 text-emerald-600 border-gray-300 focus:ring-emerald-500"
                        onChange={(e) => {
                          draft.setAnswer(question.id, e.target.value);
                        }}
                        checked={draft.answers[question.id] === option.value}
                      />
                      <div className="flex-1">
                        <span className="text-gray-900 group-hover:text-emerald-700 transition-colors">
                          {option.label}
                        </span>
                        <div className="text-sm text-gray-500 mt-1">
                          {option.points} puntos
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
        
        <nav aria-label="Controles del wizard" className="flex gap-4 justify-between">
          <button 
            onClick={goPrev} 
            disabled={stepIndex === 0} 
            aria-label="Anterior"
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            Anterior
          </button>
          <div className="flex gap-4">
            <button
              ref={nextButtonRef}
              onClick={goNext}
              aria-label={stepIndex === STEPS.length - 1 ? "Finalizar" : "Siguiente"}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  goNext();
                }
              }}
              className="px-6 py-2 bg-emerald-600 text-white rounded-md font-medium hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            >
              {stepIndex === STEPS.length - 1 ? "Finalizar" : "Siguiente"}
            </button>
            {stepIndex === STEPS.length - 1 && (
              <button
                aria-label="Enviar encuesta"
                disabled={submitting || !isSurveyValid(draft.answers)}
                onClick={async () => {
                  setSubmitting(true);
                  try {
                    const res = await fetch(scoringEndpointPath(), {
                      method: "POST",
                      headers: FUNCTIONS_HEADERS,
                      body: JSON.stringify({
                        survey_type: "general",
                        survey_version: "v1",
                        brand_id: null,
                        answers: Object.entries(draft.answers).map(([question_code, answer_code]) => ({ question_code, answer_code }))
                      })
                    });
                    if (res.ok) router.push("/dashboard");
                  } finally {
                    setSubmitting(false);
                  }
                }}
                className="px-6 py-2 bg-emerald-700 text-white rounded-md font-medium hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              >
                {submitting ? "Enviando..." : "Enviar"}
              </button>
            )}
          </div>
        </nav>
      </div>
    </main>
    </AuthGuard>
  );
}


