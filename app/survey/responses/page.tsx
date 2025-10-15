"use client";
import { useEffect, useState } from "react";
import AuthGuard from "../../../components/AuthGuard";
import { getAuthHeaders } from "../../../lib/auth/client";

interface QuestionResponse {
  id: number;
  questionId: number;
  questionText: string;
  answerId: number;
  answerText: string;
  points: number;
  maxPoints: number;
  weightPercent: number;
}

interface SurveyData {
  survey: {
    id: number;
    completed: boolean;
    created_at: string;
    completed_at?: string;
  };
  responses: Record<string, QuestionResponse[]>;
  totalResponses: number;
}

const dimensionColors = {
  PEOPLE: 'bg-blue-500',
  PLANET: 'bg-green-500', 
  MATERIALS: 'bg-purple-500',
  CIRCULARITY: 'bg-orange-500'
};

const dimensionIcons = {
  PEOPLE: '👥',
  PLANET: '🌍',
  MATERIALS: '🧵', 
  CIRCULARITY: '♻️'
};

export default function SurveyResponsesPage() {
  const [data, setData] = useState<SurveyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editedResponses, setEditedResponses] = useState<Record<number, QuestionResponse>>({});
  const [answerOptions, setAnswerOptions] = useState<Record<number, any[]>>({});

  useEffect(() => {
    async function fetchResponses() {
      try {
        const response = await fetch('/api/surveys/general/responses', {
          headers: await getAuthHeaders()
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Responses API error:', response.status, errorText);
          
          if (response.status === 401) {
            setError('No estás autenticado. Por favor, inicia sesión.');
            return;
          }
          
          if (response.status === 404) {
            setError('No se encontró la encuesta general. Completa la encuesta primero.');
            return;
          }
          
          throw new Error(`Failed to fetch responses: ${response.status}`);
        }
        
        const responsesData = await response.json();
        setData(responsesData);
      } catch (err) {
        console.error('Responses fetch error:', err);
        
        if (err instanceof Error && err.message.includes('No authentication token')) {
          setError('No estás autenticado. Por favor, inicia sesión.');
          return;
        }
        
        setError('Error al cargar las respuestas');
      } finally {
        setLoading(false);
      }
    }

    fetchResponses();
  }, []);

  const handleEdit = async () => {
    setEditing(true);
    // Initialize edited responses with current data
    const edits: Record<number, QuestionResponse> = {};
    if (data) {
      Object.values(data.responses).flat().forEach(response => {
        edits[response.id] = { ...response };
      });
    }
    setEditedResponses(edits);

    // Fetch answer options for all questions
    const options: Record<number, any[]> = {};
    const allQuestions = Object.values(data?.responses || {}).flat();
    
    for (const response of allQuestions) {
      try {
        const optionsResponse = await fetch(`/api/questions/options?questionId=${response.questionId}`);
        if (optionsResponse.ok) {
          const optionsData = await optionsResponse.json();
          options[response.questionId] = optionsData;
        }
      } catch (err) {
        console.error(`Error fetching options for question ${response.questionId}:`, err);
      }
    }
    
    setAnswerOptions(options);
  };

  const handleCancel = () => {
    setEditing(false);
    setEditedResponses({});
    setAnswerOptions({});
  };

  const handleResponseChange = (responseId: number, newAnswerId: number, newPoints: number) => {
    setEditedResponses(prev => ({
      ...prev,
      [responseId]: {
        ...prev[responseId],
        answerId: newAnswerId,
        points: newPoints
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const responsesToUpdate = Object.values(editedResponses).map(response => ({
        id: response.id,
        questionId: response.questionId,
        answerId: response.answerId,
        points: response.points
      }));

      const response = await fetch('/api/surveys/general/responses', {
        method: 'PUT',
        headers: await getAuthHeaders(),
        body: JSON.stringify({ responses: responsesToUpdate })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update responses: ${response.status} - ${errorText}`);
      }

      // Refresh data
      window.location.reload();
    } catch (err) {
      console.error('Save error:', err);
      setError('Error al guardar los cambios');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AuthGuard>
        <main className="min-h-screen bg-gray-50 py-8">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando respuestas...</p>
            </div>
          </div>
        </main>
      </AuthGuard>
    );
  }

  if (error) {
    return (
      <AuthGuard>
        <main className="min-h-screen bg-gray-50 py-8">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center py-12">
              <div className="text-red-600 text-lg mb-4">{error}</div>
              <div className="space-x-4">
                <button 
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
                >
                  Reintentar
                </button>
                {error.includes('autenticado') && (
                  <a
                    href="/login"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Iniciar Sesión
                  </a>
                )}
                {error.includes('No se encontró') && (
                  <a
                    href="/survey"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Hacer Encuesta
                  </a>
                )}
              </div>
            </div>
          </div>
        </main>
      </AuthGuard>
    );
  }

  if (!data) {
    return (
      <AuthGuard>
        <main className="min-h-screen bg-gray-50 py-8">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center py-12">
              <div className="text-gray-600 text-lg">No hay datos disponibles</div>
            </div>
          </div>
        </main>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Mis Respuestas</h1>
                <p className="text-lg text-gray-600">Encuesta General - {data.totalResponses} respuestas</p>
                <p className="text-sm text-gray-500">
                  Completada: {data.survey.completed_at ? new Date(data.survey.completed_at).toLocaleDateString() : 'No completada'}
                </p>
              </div>
              <div className="space-x-4">
                {!editing ? (
                  <button
                    onClick={handleEdit}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    ✏️ Editar Respuestas
                  </button>
                ) : (
                  <div className="space-x-2">
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                    >
                      {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Responses by Dimension */}
          {Object.entries(data.responses).map(([dimension, responses]) => (
            <div key={dimension} className="mb-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className={`${dimensionColors[dimension as keyof typeof dimensionColors]} text-white p-6`}>
                  <div className="flex items-center space-x-3">
                    <div className="text-3xl">
                      {dimensionIcons[dimension as keyof typeof dimensionIcons]}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{dimension}</h2>
                      <p className="text-sm opacity-90">
                        {responses.length} preguntas • Peso: {responses[0]?.weightPercent}%
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="space-y-4">
                    {responses.map((response, index) => (
                      <div key={response.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-sm font-medium text-gray-500">
                                Pregunta {index + 1}
                              </span>
                              <span className="text-sm text-gray-400">
                                • {response.points} puntos
                              </span>
                            </div>
                            <p className="text-gray-900 font-medium mb-3">
                              {response.questionText}
                            </p>
                            
                            {editing ? (
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Selecciona una nueva respuesta:
                                  </label>
                                  <select
                                    value={editedResponses[response.id]?.answerId || response.answerId}
                                    onChange={(e) => {
                                      const selectedOption = answerOptions[response.questionId]?.find(
                                        opt => opt.id === parseInt(e.target.value)
                                      );
                                      if (selectedOption) {
                                        handleResponseChange(
                                          response.id, 
                                          selectedOption.id, 
                                          selectedOption.points
                                        );
                                      }
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  >
                                    {answerOptions[response.questionId]?.map((option) => (
                                      <option key={option.id} value={option.id}>
                                        {option.text} ({option.points} puntos)
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div className="text-sm text-gray-600">
                                  <span className="font-medium">Puntos actuales:</span> {editedResponses[response.id]?.points || response.points}
                                </div>
                              </div>
                            ) : (
                              <div className="bg-gray-50 rounded-md p-3">
                                <p className="text-gray-700">
                                  <span className="font-medium">Respuesta:</span> {response.answerText}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                  Puntos obtenidos: {response.points}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Summary */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Resumen</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">{data.totalResponses}</div>
                <div className="text-sm text-gray-600">Respuestas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {Object.keys(data.responses).length}
                </div>
                <div className="text-sm text-gray-600">Dimensiones</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {data.survey.completed ? 'Completada' : 'En progreso'}
                </div>
                <div className="text-sm text-gray-600">Estado</div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-8 text-center">
            <div className="space-x-4">
              <a
                href="/dashboard"
                className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
              >
                📊 Ver Dashboard
              </a>
              <a
                href="/survey"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                🔄 Volver a Encuesta
              </a>
            </div>
          </div>
        </div>
      </main>
    </AuthGuard>
  );
}
