"use client";
import { useEffect, useState } from "react";
import { getAuthHeaders } from "../../../lib/auth/client";
import AuthGuard from "../../../components/AuthGuard";

export default function SurveyIndexPage() {
  const [hasGeneralSurvey, setHasGeneralSurvey] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkGeneralSurvey() {
      try {
        const response = await fetch('/api/dashboard', {
          headers: await getAuthHeaders()
        });
        
        if (response.ok) {
          const data = await response.json();
          setHasGeneralSurvey(data.hasGeneralSurvey === false ? false : true);
        } else {
          setHasGeneralSurvey(false);
        }
      } catch (error) {
        console.error('Error checking general survey:', error);
        setHasGeneralSurvey(false);
      } finally {
        setLoading(false);
      }
    }

    checkGeneralSurvey();
  }, []);

  if (loading) {
    return (
      <AuthGuard>
        <main className="min-h-screen bg-gray-50 py-8">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
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
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Encuestas Green Fashion Score</h1>
            <p className="text-xl text-gray-600">
              Evalúa la sostenibilidad de tu empresa y productos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Encuesta General */}
            <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-blue-200 hover:border-blue-300 transition-colors">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Encuesta General</h2>
                <p className="text-gray-600">
                  Evalúa la sostenibilidad general de tu empresa en 4 dimensiones: People, Planet, Materials y Circularity.
                </p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Evaluación completa de sostenibilidad
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Puntuación y categorización automática
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Guardado de borrador disponible
                </div>
              </div>

              {hasGeneralSurvey === false ? (
                <a
                  href="/survey"
                  className="w-full inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Comenzar Encuesta General
                </a>
              ) : hasGeneralSurvey === true ? (
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-green-600">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Encuesta general completada
                  </div>
                  <a
                    href="/survey"
                    className="w-full inline-flex items-center justify-center px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                  >
                    Rehacer Encuesta General
                  </a>
                </div>
              ) : (
                <a
                  href="/survey"
                  className="w-full inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Comenzar Encuesta General
                </a>
              )}
            </div>

            {/* Encuesta Específica */}
            <div className={`bg-white rounded-lg shadow-lg p-8 border-2 transition-colors ${
              hasGeneralSurvey === false 
                ? 'border-gray-200 opacity-60' 
                : 'border-purple-200 hover:border-purple-300'
            }`}>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Encuesta por Producto</h2>
                <p className="text-gray-600">
                  Evalúa la sostenibilidad de productos específicos como jersey, pantalón, vestido, etc.
                </p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Evaluación por tipo de producto
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Múltiples productos evaluables
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Acumulación de puntuaciones
                </div>
              </div>

              {hasGeneralSurvey === false ? (
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-amber-600">
                    <svg className="w-4 h-4 text-amber-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Requiere completar encuesta general primero
                  </div>
                  <button
                    disabled
                    className="w-full inline-flex items-center justify-center px-6 py-3 bg-gray-300 text-gray-500 rounded-lg font-semibold cursor-not-allowed"
                  >
                    Encuesta General Requerida
                  </button>
                </div>
              ) : (
                <a
                  href="/product/new"
                  className="w-full inline-flex items-center justify-center px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                >
                  Crear Encuesta Específica
                </a>
              )}
            </div>
          </div>

          <div className="mt-12 text-center">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">¿Necesitas ayuda?</h3>
              <p className="text-blue-700 mb-4">
                Consulta tus resultados anteriores o gestiona tus encuestas desde el dashboard.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/surveys"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
                >
                  Ver Mis Resultados
                </a>
                <a
                  href="/dashboard"
                  className="inline-flex items-center px-4 py-2 border border-blue-600 text-blue-600 rounded-md font-medium hover:bg-blue-50 transition-colors"
                >
                  Ir al Dashboard
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </AuthGuard>
  );
}
