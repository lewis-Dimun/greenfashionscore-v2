"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import AuthGuard from "../../components/AuthGuard";
import { getAuthHeaders } from "../../lib/auth/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { CertificateButton } from "../../components/CertificatePDF";

// Componente para tarjeta de categoría
function CategoryCard({ 
  title, 
  score, 
  max, 
  dimensionLogo, 
  color 
}: { 
  title: string; 
  score: number; 
  max: number; 
  dimensionLogo: string; 
  color: string; 
}) {
  const percentage = (score / max) * 100;
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-16 h-16 flex items-center justify-center">
            <Image 
              src={dimensionLogo} 
              alt={title} 
              width={64} 
              height={64}
              className="object-contain"
            />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600">Máximo: {max} puntos</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">{score}</div>
          <div className="text-sm text-gray-500">puntos</div>
        </div>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div 
          className={`h-3 rounded-full ${color}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      
      <div className="mt-2 text-sm text-gray-600">
        {percentage.toFixed(1)}% del máximo
      </div>
    </div>
  );
}

// Componente para badge de grade
function GradeBadge({ grade }: { grade: string }) {
  const semaphoreImages = {
    A: '/branding/SEMÁFORO A.png',
    B: '/branding/SEMÁFORO B.png',
    C: '/branding/SEMÁFORO C.png',
    D: '/branding/SEMÁFORO D.png',
    E: '/branding/SEMÁFORO E.png'
  };
  
  return (
    <div className="flex flex-col items-center">
      <Image 
        src={semaphoreImages[grade as keyof typeof semaphoreImages]} 
        alt={`Calificación ${grade}`}
        width={300}
        height={300}
        className="object-contain"
      />
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState({
    people: 0,
    planet: 0,
    materials: 0,
    circularity: 0,
    total: 0,
    grade: 'E',
    breakdown: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasGeneralSurvey, setHasGeneralSurvey] = useState<boolean>(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const response = await fetch('/api/dashboard', {
          headers: await getAuthHeaders()
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Dashboard API error:', response.status, errorText);
          
          if (response.status === 401) {
            setError('No estás autenticado. Por favor, inicia sesión.');
            return;
          }
          
          throw new Error(`Failed to fetch dashboard data: ${response.status}`);
        }
        
        const dashboardData = await response.json();
        if (dashboardData && typeof dashboardData === 'object' && 'hasGeneralSurvey' in dashboardData && dashboardData.hasGeneralSurvey === false) {
          setHasGeneralSurvey(false);
          return;
        }
        setHasGeneralSurvey(true);
        setData(dashboardData);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        
        if (err instanceof Error && err.message.includes('No authentication token')) {
          setError('No estás autenticado. Por favor, inicia sesión.');
          return;
        }
        
        setError('Error al cargar los datos del dashboard');
        // Set default data to prevent empty state
        setData({
          people: 0,
          planet: 0,
          materials: 0,
          circularity: 0,
          total: 0,
          grade: 'E',
          breakdown: []
        });
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <AuthGuard>
        <main className="min-h-screen bg-gray-50 py-8">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando resultados...</p>
            </div>
          </div>
        </main>
      </AuthGuard>
    );
  }

  if (!hasGeneralSurvey) {
    return (
      <AuthGuard>
        <main className="min-h-screen bg-gray-50">
          <div className="max-w-4xl mx-auto p-8">
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-xl p-12 text-center">
              <h1 className="text-4xl font-bold text-white mb-4">¡Bienvenido a Green Fashion Score!</h1>
              <p className="text-xl text-green-50 mb-8">Comienza evaluando tu marca con nuestra encuesta general</p>
              <a href="/survey" className="inline-block bg-white text-green-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-50 transition">Comenzar Encuesta General</a>
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
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Resultados Green Fashion Score</h1>
            <p className="text-lg text-gray-600">Tu puntuación de sostenibilidad</p>
          </div>
          
          {/* Tarjetas de categorías */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <CategoryCard
              title="PEOPLE"
              score={data.people}
              max={20}
              dimensionLogo="/branding/People.png"
              color="bg-blue-500"
            />
            <CategoryCard
              title="PLANET"
              score={data.planet}
              max={20}
              dimensionLogo="/branding/Planet.png"
              color="bg-green-500"
            />
            <CategoryCard
              title="MATERIALS"
              score={data.materials}
              max={40}
              dimensionLogo="/branding/Materials.png"
              color="bg-purple-500"
            />
            <CategoryCard
              title="CIRCULARITY"
              score={data.circularity}
              max={20}
              dimensionLogo="/branding/Circularity.png"
              color="bg-orange-500"
            />
          </div>
          
          {/* Total y Grade */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8 border border-gray-200">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Puntuación Total</h2>
              <div className="flex items-center justify-center space-x-8 mb-6">
                <div>
                  <div className="text-6xl font-bold text-emerald-600">{data.total}</div>
                  <div className="text-lg text-gray-600">de 100 puntos</div>
                </div>
                <div>
                  <div className="text-lg text-gray-600 mb-2">Calificación</div>
                  <GradeBadge grade={data.grade} />
                </div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-4 max-w-md mx-auto">
                <div 
                  className="bg-emerald-600 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((data.total / 100) * 100, 100)}%` }}
                />
              </div>
              <div className="mt-2 text-sm text-gray-600">
                {((data.total / 100) * 100).toFixed(1)}% del máximo
              </div>
            </div>
          </div>
          
          {/* Botón de Certificado */}
          <div className="text-center mb-8">
            <CertificateButton 
              data={{
                grade: data.grade,
                total: data.total,
                people: data.people,
                planet: data.planet,
                materials: data.materials,
                circularity: data.circularity,
                userName: 'Usuario', // TODO: Get actual user name
                date: new Date().toLocaleDateString('es-ES', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })
              }}
            />
          </div>
          
          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Bar Chart */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Puntuación por Dimensión</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[
                  { name: 'People', score: data.people, max: 20, percentage: (data.people / 20) * 100 },
                  { name: 'Planet', score: data.planet, max: 20, percentage: (data.planet / 20) * 100 },
                  { name: 'Materials', score: data.materials, max: 40, percentage: (data.materials / 40) * 100 },
                  { name: 'Circularity', score: data.circularity, max: 20, percentage: (data.circularity / 20) * 100 }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'score' ? `${value} puntos` : `${value} puntos máx`,
                      name === 'score' ? 'Tu puntuación' : 'Máximo'
                    ]}
                  />
                  <Legend />
                  <Bar dataKey="score" fill="#10b981" name="Tu puntuación" />
                  <Bar dataKey="max" fill="#e5e7eb" name="Máximo" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Distribución de Puntuación</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'People', value: data.people, color: '#3b82f6' },
                      { name: 'Planet', value: data.planet, color: '#10b981' },
                      { name: 'Materials', value: data.materials, color: '#8b5cf6' },
                      { name: 'Circularity', value: data.circularity, color: '#f59e0b' }
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {[
                      { name: 'People', value: data.people, color: '#3b82f6' },
                      { name: 'Planet', value: data.planet, color: '#10b981' },
                      { name: 'Materials', value: data.materials, color: '#8b5cf6' },
                      { name: 'Circularity', value: data.circularity, color: '#f59e0b' }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Navigation Actions */}
          <div className="text-center mb-8">
            <div className="space-x-4 mb-4">
              <a
                href="/surveys"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                📝 Ver Mis Resultados
              </a>
              <a
                href="/product/new"
                className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
              >
                🛍️ Hacer encuesta por producto
              </a>
            </div>
            <p className="text-sm text-gray-600">
              Revisa tus respuestas o añade encuestas específicas por tipo de producto
            </p>
          </div>
          
          {/* Breakdown de encuestas */}
          {data.breakdown && data.breakdown.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Desglose por encuesta</h3>
              <div className="space-y-4">
                {data.breakdown.map((survey: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-semibold text-gray-900">
                        {survey.scope === 'general' ? 'Encuesta General' : `Encuesta: ${survey.productType?.toUpperCase() || 'Producto'}`}
                      </div>
                      <div className="text-sm text-gray-600">
                        {survey.scores.people + survey.scores.planet + survey.scores.materials + survey.scores.circularity} puntos total
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">{survey.total}</div>
                        <div className="text-sm text-gray-500">puntos</div>
                      </div>
                      <GradeBadge grade={survey.grade} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </AuthGuard>
  );
}


