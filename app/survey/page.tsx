"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuthHeaders } from "../../lib/auth/client";
import { useSurveyStore } from "../../lib/state/surveyStore";
import { isSurveyValid } from "../../lib/validation/survey";
import AuthGuard from "../../components/AuthGuard";
import { getFallbackQuestions } from "../../lib/survey/fallback";

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
  const [questions, setQuestions] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [hasCompletedSurvey, setHasCompletedSurvey] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const router = useRouter();

  // Load questions from database or fallback
  useEffect(() => {
    async function loadQuestions() {
      try {
        const res = await fetch('/api/questions/general', {
          headers: await getAuthHeaders()
        });
        if (!res.ok) throw new Error('Failed to load general questions');
        const payload = await res.json();

        // Normalizar: la API devuelve objeto agrupado por dimensión.
        // Aseguramos claves en minúscula esperadas por el wizard.
        const normalized: Record<string, any[]> = { people: [], planet: [], materials: [], circularity: [] };

        if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
          Object.entries(payload).forEach(([key, list]: [string, any]) => {
            const k = key.toLowerCase().trim();
            if (Array.isArray(list)) {
              // Aceptar preguntas con >=1 respuesta; si no hay respuestas, añadir placeholder 0 pts
              const cleaned = list.map((q: any) => {
                const answers = Array.isArray(q.answers) ? q.answers : [];
                return {
                  ...q,
                  answers: answers.length > 0 ? answers : [{ id: `${q.id}_none`, text: 'Sin respuesta', points: 0 }]
                };
              });
              if (k in normalized) normalized[k as keyof typeof normalized] = cleaned;
            }
          });
        } else if (Array.isArray(payload)) {
          // Si viniese plano, lo agrupamos por dimension.name
          const grouped: Record<string, any[]> = { people: [], planet: [], materials: [], circularity: [] };
          payload.forEach((q: any) => {
            const k = (q?.dimension?.name || '').toLowerCase().trim();
            if (k in grouped) grouped[k as keyof typeof grouped].push(q);
          });
          normalized.people = grouped.people;
          normalized.planet = grouped.planet;
          normalized.materials = grouped.materials;
          normalized.circularity = grouped.circularity;
        }

        setQuestions(normalized);
      } catch (error) {
        console.warn('Failed to load questions from DB, using fallback:', error);
        const fallbackQuestions = getFallbackQuestions();
        setQuestions(fallbackQuestions);
      } finally {
        setLoading(false);
      }
    }
    
    loadQuestions();
  }, []);

  // Check if user already completed the survey and prefill answers
  useEffect(() => {
    async function checkExistingSurvey() {
      try {
        const res = await fetch('/api/surveys/general', {
          method: 'GET',
          headers: await getAuthHeaders()
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.completed) {
            setHasCompletedSurvey(true);
            if (Array.isArray(data.answers)) {
              data.answers.forEach((ans: any) => {
                draft.setAnswer(String(ans.question_id), String(ans.answer_id));
              });
            }
          }
        }
      } catch (e) {
        console.warn('Failed to check existing survey:', e);
      }
    }
    checkExistingSurvey();
  }, []);

  useEffect(() => {
    nextButtonRef.current?.focus();
  }, [stepIndex]);

  // Persist step index changes to the store outside of render
  useEffect(() => {
    if (draft.stepIndex !== stepIndex) {
      draft.setStepIndex(stepIndex);
    }
  }, [stepIndex]);

  function goNext() {
    setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
  }
  function goPrev() {
    setStepIndex((i) => Math.max(i - 1, 0));
  }

  const current = STEPS[stepIndex];
  const currentQuestions = questions[current.key] || [];

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
          
          {/* Completed banner and actions */}
          {hasCompletedSurvey && !isEditMode && !draft.isSubmitted && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h3 className="text-blue-900 font-bold text-xl mb-2">✅ Ya has completado esta encuesta</h3>
              <p className="text-blue-800 mb-4">Puedes ver tus resultados, editar tus respuestas o crear una nueva encuesta.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Ver Resultados
                </button>
                <button
                  onClick={() => setIsEditMode(true)}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
                >
                  Editar Respuestas
                </button>
                <button
                  onClick={async () => {
                    if (!confirm('¿Eliminar encuesta y empezar una nueva?')) return;
                    try {
                      const res = await fetch('/api/surveys/general', { method: 'DELETE', headers: await getAuthHeaders() });
                      if (res.ok) {
                        draft.reset();
                        setHasCompletedSurvey(false);
                        setIsEditMode(false);
                      }
                    } catch (err) {
                      console.error('Delete survey error:', err);
                    }
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Eliminar y Crear Nueva
                </button>
              </div>
            </div>
          )}

          {/* Feedback banners */}
          {draft.isSubmitted && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h3 className="text-green-800 font-semibold">✅ Encuesta enviada correctamente</h3>
              <p className="text-green-700">Redirigiendo al dashboard...</p>
            </div>
          )}

          {draft.submitError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h3 className="text-red-800 font-semibold">❌ Error al enviar</h3>
              <p className="text-red-700">{draft.submitError}</p>
            </div>
          )}
          
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Cargando preguntas...</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {currentQuestions.map((question, qIndex) => (
                      <div key={question.id} className="border-b border-gray-100 pb-6 last:border-b-0">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          {qIndex + 1}. {question.text}
                        </h3>
                        <div className="space-y-3">
                          {(question.answers || []).map((answer: any) => (
                            <label key={answer.id} className="flex items-start space-x-3 cursor-pointer group">
                              <input
                                type="radio"
                                name={String(question.id)}
                                value={String(answer.id)}
                                className="mt-1 h-4 w-4 text-emerald-600 border-gray-300 focus:ring-emerald-500"
                                onChange={(e) => {
                                  draft.setAnswer(String(question.id), String(e.target.value));
                                }}
                                checked={draft.answers[String(question.id)] === String(answer.id)}
                                disabled={draft.isSubmitted}
                              />
                              <div className="flex-1">
                                <span className="text-gray-900 group-hover:text-emerald-700 transition-colors">
                                  {answer.text}
                                </span>
                                {/* Ocultamos puntos en la UI por requisitos de UX */}
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
            {/* Guardar borrador disponible en cualquier paso */}
            <button
              aria-label="Guardar borrador"
              disabled={draft.isSubmitting || draft.isSubmitted}
              onClick={async () => {
                draft.setSubmitting(true);
                try {
                  const answers = Object.entries(draft.answers).map(([questionId, answerId]) => {
                    const question = Object.values(questions).flat().find((q: any) => String(q.id) === String(questionId));
                    const answer = question?.answers?.find((a: any) => String(a.id) === String(answerId));
                    return {
                      questionId,
                      answerId,
                      numericValue: answer?.numeric_value ?? answer?.points ?? 0
                    };
                  });
                  await fetch('/api/surveys/general', {
                    method: 'PUT',
                    headers: await getAuthHeaders(),
                    body: JSON.stringify({ completed: false, answers })
                  });
                } finally {
                  draft.setSubmitting(false);
                }
              }}
              className="px-6 py-2 border border-emerald-600 text-emerald-700 rounded-md font-medium hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            >
              {draft.isSubmitting ? "Guardando..." : "Guardar borrador"}
            </button>
            {stepIndex === STEPS.length - 1 && (
              <button
                aria-label="Enviar encuesta"
                disabled={draft.isSubmitting || draft.isSubmitted || !isSurveyValid(draft.answers)}
                      onClick={async () => {
                        draft.setSubmitting(true);
                        draft.setSubmitError(null);
                        try {
                          // Convert answers to new format
                          const answers = Object.entries(draft.answers).map(([questionId, answerId]) => {
                            // Find the numeric value for this answer
                            const question = Object.values(questions).flat().find((q: any) => String(q.id) === String(questionId));
                            const answer = question?.answers?.find((a: any) => String(a.id) === String(answerId));
                            return {
                              questionId,
                              answerId,
                              numericValue: answer?.numeric_value ?? answer?.points ?? 0
                            };
                          });

                          const res = await fetch('/api/scoring', {
                            method: "POST",
                            headers: await getAuthHeaders(),
                            body: JSON.stringify({
                              scope: "general",
                              answers
                            })
                          });
                          
                          if (res.ok) {
                            const result = await res.json();
                            if (result.success) {
                              draft.setSubmitted(true);
                              // Redirect to dashboard after 2 seconds
                              setTimeout(() => {
                                router.push("/dashboard");
                              }, 2000);
                            } else {
                              draft.setSubmitError(result.error || 'Error al enviar la encuesta');
                            }
                          } else {
                            const errorData = await res.json();
                            draft.setSubmitError(errorData.error || 'Error al enviar la encuesta');
                          }
                        } catch (error) {
                          console.error('Submit error:', error);
                          draft.setSubmitError('Error de conexión. Inténtalo de nuevo.');
                        } finally {
                          draft.setSubmitting(false);
                        }
                      }}
                className="px-6 py-2 bg-emerald-700 text-white rounded-md font-medium hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              >
                {draft.isSubmitting ? "Enviando..." : draft.isSubmitted ? "Enviado" : "Enviar"}
              </button>
            )}
          </div>
        </nav>
      </div>
    </main>
    </AuthGuard>
  );
}


