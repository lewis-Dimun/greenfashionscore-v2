"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuthHeaders } from "../../lib/auth/client";
import AuthGuard from "../../components/AuthGuard";

interface Survey {
  id: number;
  completed: boolean;
  created_at: string;
  type: 'general' | 'specific';
  product_name?: string;
}

interface SurveyData {
  general: Survey | null;
  specific: Survey[];
}

export default function SurveysPage() {
  const [data, setData] = useState<SurveyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [renaming, setRenaming] = useState<number | null>(null);
  const [newName, setNewName] = useState<string>('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchSurveys() {
      try {
        const response = await fetch('/api/surveys/me', {
          headers: await getAuthHeaders()
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            setError('No estás autenticado. Por favor, inicia sesión.');
            return;
          }
          throw new Error(`Failed to fetch surveys: ${response.status}`);
        }
        
        const surveysData = await response.json();
        setData(surveysData);
      } catch (err) {
        console.error('Surveys fetch error:', err);
        setError('Error al cargar las encuestas');
      } finally {
        setLoading(false);
      }
    }

    fetchSurveys();
  }, []);

  const handleDelete = async (surveyId: number, type: 'general' | 'specific') => {
    if (type === 'general') {
      setToast({ message: 'No se puede eliminar la encuesta general. Puedes rehacerla desde el dashboard.', type: 'info' });
      return;
    }

    if (!confirm('¿Estás seguro de que quieres eliminar esta encuesta específica?')) {
      return;
    }

    setDeleting(surveyId);
    try {
      const response = await fetch(`/api/surveys/specific?id=${surveyId}`, {
        method: 'DELETE',
        headers: await getAuthHeaders()
      });

      if (response.ok) {
        setToast({ message: 'Encuesta eliminada correctamente', type: 'success' });
        // Refresh the data
        const surveysResponse = await fetch('/api/surveys/me', {
          headers: await getAuthHeaders()
        });
        if (surveysResponse.ok) {
          const surveysData = await surveysResponse.json();
          setData(surveysData);
        }
      } else {
        setToast({ message: 'Error al eliminar la encuesta', type: 'error' });
      }
    } catch (error) {
      console.error('Delete error:', error);
      setToast({ message: 'Error al eliminar la encuesta', type: 'error' });
    } finally {
      setDeleting(null);
    }
  };

  const handleRename = async (surveyId: number) => {
    if (!newName.trim()) {
      setToast({ message: 'El nombre no puede estar vacío', type: 'error' });
      return;
    }

    try {
      const response = await fetch('/api/surveys/specific', {
        method: 'PATCH',
        headers: await getAuthHeaders(),
        body: JSON.stringify({ surveyId, product_name: newName.trim() })
      });

      if (response.ok) {
        setToast({ message: 'Encuesta renombrada correctamente', type: 'success' });
        setRenaming(null);
        setNewName('');
        // Refresh the data
        const surveysResponse = await fetch('/api/surveys/me', {
          headers: await getAuthHeaders()
        });
        if (surveysResponse.ok) {
          const surveysData = await surveysResponse.json();
          setData(surveysData);
        }
      } else {
        setToast({ message: 'Error al renombrar la encuesta', type: 'error' });
      }
    } catch (error) {
      console.error('Rename error:', error);
      setToast({ message: 'Error al renombrar la encuesta', type: 'error' });
    }
  };

  const handleRehacer = (survey: Survey) => {
    if (survey.type === 'general') {
      router.push('/survey');
    } else {
      router.push('/product/new');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (completed: boolean) => {
    return completed ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Completada
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        Borrador
      </span>
    );
  };

  if (loading) {
    return (
      <AuthGuard>
        <main className="min-h-screen bg-gray-50 py-8">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
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
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-red-800 mb-2">Error</h2>
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        </main>
      </AuthGuard>
    );
  }

  const allSurveys: (Survey & { type: 'general' | 'specific' })[] = [
    ...(data?.general ? [{ ...data.general, type: 'general' as const }] : []),
    ...(data?.specific?.map(s => ({ ...s, type: 'specific' as const })) || [])
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <AuthGuard>
      <main className="min-h-screen bg-gray-50 py-8">
        {toast && (
          <div className={`fixed top-4 right-4 p-4 rounded-lg border-2 shadow-lg z-50 ${
            toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
            toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
            'bg-blue-50 border-blue-200 text-blue-800'
          }`}>
            <div className="flex items-center space-x-2">
              <span className="font-medium">
                {toast.type === 'success' && '✅'}
                {toast.type === 'error' && '❌'}
                {toast.type === 'info' && 'ℹ️'}
              </span>
              <span>{toast.message}</span>
              <button
                onClick={() => setToast(null)}
                className="ml-2 text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
          </div>
        )}
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Resultados</h1>
            <p className="text-lg text-gray-600">Gestiona tus encuestas y resultados</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Encuestas Realizadas</h2>
                <a
                  href="/product/new"
                  className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-md font-medium hover:bg-emerald-700 transition-colors"
                >
                  Nueva Encuesta Específica
                </a>
              </div>
            </div>

            {allSurveys.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay encuestas</h3>
                <p className="text-gray-600 mb-4">Comienza completando tu encuesta general</p>
                <a
                  href="/survey"
                  className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-md font-medium hover:bg-emerald-700 transition-colors"
                >
                  Comenzar Encuesta General
                </a>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Producto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {allSurveys.map((survey) => (
                      <tr key={`${survey.type}-${survey.id}`} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className={`w-3 h-3 rounded-full mr-3 ${
                              survey.type === 'general' ? 'bg-blue-500' : 'bg-purple-500'
                            }`}></div>
                            <span className="text-sm font-medium text-gray-900">
                              {survey.type === 'general' ? 'General' : 'Específica'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {survey.type === 'specific' ? (
                            renaming === survey.id ? (
                              <div className="flex items-center space-x-2">
                                <input
                                  type="text"
                                  value={newName}
                                  onChange={(e) => setNewName(e.target.value)}
                                  className="px-2 py-1 border border-gray-300 rounded text-sm"
                                  placeholder="Nuevo nombre"
                                  autoFocus
                                />
                                <button
                                  onClick={() => handleRename(survey.id)}
                                  className="text-green-600 hover:text-green-800 text-xs"
                                >
                                  ✓
                                </button>
                                <button
                                  onClick={() => {
                                    setRenaming(null);
                                    setNewName('');
                                  }}
                                  className="text-gray-500 hover:text-gray-700 text-xs"
                                >
                                  ✕
                                </button>
                              </div>
                            ) : (
                              <span className="group-hover:bg-gray-50 px-2 py-1 rounded">
                                {survey.product_name || 'Sin nombre'}
                              </span>
                            )
                          ) : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(survey.completed)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(survey.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => handleRehacer(survey)}
                            className="text-emerald-600 hover:text-emerald-900 transition-colors"
                          >
                            {survey.completed ? 'Rehacer' : 'Continuar'}
                          </button>
                          {survey.type === 'specific' && (
                            <>
                              <button
                                onClick={() => {
                                  setRenaming(survey.id);
                                  setNewName(survey.product_name || '');
                                }}
                                className="text-blue-600 hover:text-blue-900 transition-colors"
                              >
                                ✏️ Renombrar
                              </button>
                              <button
                                onClick={() => handleDelete(survey.id, survey.type)}
                                disabled={deleting === survey.id}
                                className="text-red-600 hover:text-red-900 disabled:opacity-50 transition-colors"
                              >
                                {deleting === survey.id ? 'Eliminando...' : '🗑️ Eliminar'}
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="mt-8 flex justify-center">
            <a
              href="/dashboard"
              className="text-emerald-600 hover:text-emerald-700 font-medium"
            >
              ← Volver al Dashboard
            </a>
          </div>
        </div>
      </main>
    </AuthGuard>
  );
}
