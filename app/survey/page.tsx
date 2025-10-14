"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { scoringEndpointPath, FUNCTIONS_HEADERS } from "../../lib/config";
import { useSurveyStore } from "../../lib/state/surveyStore";
import { isSurveyValid } from "../../lib/validation/survey";

const STEPS = [
  { key: "people", title: "People" },
  { key: "planet", title: "Planet" },
  { key: "circularity", title: "Circularity" },
  { key: "materials", title: "Materials" }
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

  return (
    <main aria-label="Encuesta Green Fashion Score">
      <div role="progressbar" aria-label="Progreso" aria-valuemin={1} aria-valuemax={STEPS.length} aria-valuenow={stepIndex + 1}>
        Paso {stepIndex + 1} de {STEPS.length}
      </div>
      <section aria-label={`Sección ${current.title}`}>
        <h2 tabIndex={-1}>{current.title}</h2>
        <p>Preguntas de {current.title} (placeholder)</p>
      </section>
      <nav aria-label="Controles del wizard">
        <button onClick={goPrev} disabled={stepIndex === 0} aria-label="Anterior">
          Anterior
        </button>
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
          >
            {submitting ? "Enviando..." : "Enviar"}
          </button>
        )}
      </nav>
    </main>
  );
}


