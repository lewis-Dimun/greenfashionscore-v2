"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuthHeaders } from "../../../lib/auth/client";
// import { useSurveyStore } from "../../../lib/state/surveyStore";
import AuthGuard from "../../../components/AuthGuard";
import { getFallbackQuestions } from "../../../lib/survey/fallback";

const PRODUCT_TYPES = [
  { id: 'jersey', name: 'Jersey', icon: '👕' },
  { id: 'pantalon', name: 'Pantalón', icon: '👖' },
  { id: 'polo', name: 'Polo', icon: '👔' },
  { id: 'vestido', name: 'Vestido', icon: '👗' },
  { id: 'bolso', name: 'Bolso', icon: '👜' },
  { id: 'calzado', name: 'Calzado', icon: '👟' },
  { id: 'camisa', name: 'Camisa', icon: '👔' },
  { id: 'camiseta', name: 'Camiseta', icon: '👕' },
  { id: 'falda', name: 'Falda', icon: '👗' }
];

export default function ProductWizardPage() {
  const [step, setStep] = useState<'select' | 'survey'>('select');
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [requiresGeneralSurvey, setRequiresGeneralSurvey] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const router = useRouter();

  // Verify guard and load product questions when product is selected
  useEffect(() => {
    if (selectedProduct && step === 'survey') {
      async function loadQuestions() {
        setLoading(true);
        try {
          // Check guard first
          const guardRes = await fetch('/api/specific-surveys', { headers: await getAuthHeaders() });
          if (guardRes.status === 403) {
            const data = await guardRes.json().catch(() => ({}));
            if (data?.requiresGeneralSurvey) {
              setRequiresGeneralSurvey(true);
              return;
            }
          }

          const res = await fetch('/api/questions/product');
          if (!res.ok) throw new Error('Failed to load product questions');
          const productQuestions = await res.json();
          // Normalize: API returns grouped object by dimension; flatten to array
          const normalized = Array.isArray(productQuestions)
            ? productQuestions
            : Object.values(productQuestions || {}).flat();
          setQuestions(Array.isArray(normalized) ? normalized : []);
        } catch (error) {
          console.warn('Failed to load product questions from DB, using fallback:', error);
          // For now, use general questions as fallback
          const fallbackQuestions = getFallbackQuestions();
          setQuestions(fallbackQuestions.people); // Use people questions as fallback
        } finally {
          setLoading(false);
        }
      }
      
      loadQuestions();
    }
  }, [selectedProduct, step]);

  const handleProductSelect = (productId: string) => {
    setSelectedProduct(productId);
    setStep('survey');
  };

  const handleAnswerChange = (questionId: string, answerId: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerId
    }));
  };

  const handleSubmit = async (mode: 'draft' | 'submit') => {
    if (!selectedProduct) return;
    
    setSubmitting(true);
    try {
      // Convert answers to new format
      const formattedAnswers = Object.entries(answers).map(([questionId, answerId]) => {
        const question = questions.find(q => q.id === questionId);
        const answer = question?.answers?.find((a: any) => a.id === answerId);
        return {
          questionId,
          answerId,
          numericValue: answer?.numeric_value || 0
        };
      });

      if (mode === 'draft') {
        await fetch('/api/surveys/specific', {
          method: 'PUT',
          headers: await getAuthHeaders(),
          body: JSON.stringify({ surveyId: 0, completed: false, answers: formattedAnswers })
        });
      } else {
        const res = await fetch('/api/scoring', {
          method: "POST",
          headers: await getAuthHeaders(),
          body: JSON.stringify({
            scope: "product",
            product_type: selectedProduct,
            answers: formattedAnswers
          })
        });
        
        if (res.ok) {
          router.push("/dashboard");
        }
      }
    } catch (error) {
      console.error('Error submitting product survey:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const isSurveyComplete = questions.length > 0 && questions.every(q => answers[q.id]);

  if (step === 'select') {
    return (
      <AuthGuard>
        <main className="min-h-screen bg-gray-50 py-8">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Encuesta por Producto</h1>
              <p className="text-lg text-gray-600">
                Selecciona el tipo de producto para el que quieres hacer la encuesta específica
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {PRODUCT_TYPES.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleProductSelect(product.id)}
                  className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:border-emerald-300 hover:shadow-md transition-all group"
                >
                  <div className="text-center">
                    <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                      {product.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-emerald-700">
                      {product.name}
                    </h3>
                  </div>
                </button>
              ))}
            </div>

            <div className="text-center mt-8">
              <a
                href="/dashboard"
                className="text-emerald-600 hover:text-emerald-700 font-medium"
              >
                ← Volver al dashboard
              </a>
            </div>
          </div>
        </main>
      </AuthGuard>
    );
  }

  if (requiresGeneralSurvey) {
    return (
      <AuthGuard>
        <main className="min-h-screen bg-gray-50 py-8">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="bg-white rounded-lg shadow p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Encuesta General requerida</h2>
              <p className="text-gray-700 mb-6">Debes completar la encuesta general antes de poder realizar la encuesta específica por producto.</p>
              <a href="/survey" className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors">Ir a Encuesta General</a>
            </div>
          </div>
        </main>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-6">
            <button
              onClick={() => setStep('select')}
              className="text-emerald-600 hover:text-emerald-700 font-medium mb-4"
            >
              ← Cambiar producto
            </button>
            <h1 className="text-3xl font-bold text-gray-900">
              Encuesta: {PRODUCT_TYPES.find(p => p.id === selectedProduct)?.name}
            </h1>
            <p className="text-lg text-gray-600">
              Responde las preguntas específicas para este tipo de producto
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando preguntas...</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="space-y-8">
                {questions.map((question, qIndex) => (
                  <div key={question.id} className="border-b border-gray-100 pb-6 last:border-b-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      {qIndex + 1}. {question.text}
                    </h3>
                    <div className="space-y-3">
                      {question.answers.map((answer: any) => (
                        <label key={answer.id} className="flex items-start space-x-3 cursor-pointer group">
                          <input
                            type="radio"
                            name={question.id}
                            value={answer.id}
                            className="mt-1 h-4 w-4 text-emerald-600 border-gray-300 focus:ring-emerald-500"
                            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                            checked={answers[question.id] === answer.id}
                          />
                          <div className="flex-1">
                            <span className="text-gray-900 group-hover:text-emerald-700 transition-colors">
                              {answer.text}
                            </span>
                            <div className="text-sm text-gray-500 mt-1">
                              {answer.numeric_value} puntos
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex justify-between">
                <button
                  onClick={() => setStep('select')}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                >
                  Cambiar producto
                </button>
                <button
                  onClick={() => handleSubmit('draft')}
                  disabled={submitting}
                  className="px-6 py-2 border border-emerald-600 text-emerald-700 rounded-md font-medium hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                >
                  Guardar borrador
                </button>
                <button
                  onClick={() => handleSubmit('submit')}
                  disabled={!isSurveyComplete || submitting}
                  className="px-6 py-2 bg-emerald-600 text-white rounded-md font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                >
                  {submitting ? "Enviando..." : "Enviar encuesta"}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </AuthGuard>
  );
}
