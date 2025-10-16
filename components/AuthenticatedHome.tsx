"use client";
import Link from "next/link";

interface AuthenticatedHomeProps {
  user: any;
}

export default function AuthenticatedHome({ user }: AuthenticatedHomeProps) {
  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              ¡Bienvenido de vuelta, {user.email?.split('@')[0]}! 👋
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Continúa tu viaje hacia la sostenibilidad en la moda. Gestiona tus encuestas, 
              revisa tus resultados y mejora tu puntuación Green Fashion Score.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <Link 
              href="/dashboard"
              className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Mi Dashboard</h3>
              <p className="text-gray-600 mb-4">
                Revisa tu puntuación actual y el progreso en cada dimensión
              </p>
              <div className="inline-flex items-center text-emerald-600 font-semibold">
                Ver resultados →
              </div>
            </Link>

            <Link 
              href="/survey"
              className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Encuesta General</h3>
              <p className="text-gray-600 mb-4">
                Completa o actualiza tu encuesta general de sostenibilidad
              </p>
              <div className="inline-flex items-center text-emerald-600 font-semibold">
                Comenzar encuesta →
              </div>
            </Link>

            <Link 
              href="/product/new"
              className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="text-4xl mb-4">🛍️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Productos Específicos</h3>
              <p className="text-gray-600 mb-4">
                Analiza productos específicos para obtener puntuaciones detalladas
              </p>
              <div className="inline-flex items-center text-emerald-600 font-semibold">
                Analizar producto →
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">¿Cómo funciona Green Fashion Score?</h2>
            <p className="text-lg text-gray-600">
              Un sistema integral de evaluación de sostenibilidad para marcas de moda
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📋</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">1. Encuesta General</h3>
              <p className="text-gray-600 text-sm">
                Evalúa las prácticas generales de tu marca en las 4 dimensiones clave
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🛍️</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">2. Productos Específicos</h3>
              <p className="text-gray-600 text-sm">
                Analiza productos individuales para obtener puntuaciones detalladas
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">3. Análisis y Puntuación</h3>
              <p className="text-gray-600 text-sm">
                Recibe una puntuación A-E y recomendaciones personalizadas
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏆</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">4. Certificación</h3>
              <p className="text-gray-600 text-sm">
                Obtén tu certificación Green Fashion Score y compártela
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Beneficios de Green Fashion Score</h2>
            <p className="text-lg text-gray-600">
              Mejora tu sostenibilidad y competitividad en el mercado
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="text-3xl mb-4">🌱</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Sostenibilidad Real</h3>
              <p className="text-gray-600 text-sm">
                Identifica áreas de mejora y implementa prácticas más sostenibles
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="text-3xl mb-4">📈</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Competitividad</h3>
              <p className="text-gray-600 text-sm">
                Diferenciate en el mercado con certificaciones reconocidas
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="text-3xl mb-4">🎯</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Objetivos Claros</h3>
              <p className="text-gray-600 text-sm">
                Recibe recomendaciones específicas para mejorar tu puntuación
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="text-3xl mb-4">🤝</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Transparencia</h3>
              <p className="text-gray-600 text-sm">
                Demuestra tu compromiso con la sostenibilidad a clientes y partners
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="text-3xl mb-4">💡</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Innovación</h3>
              <p className="text-gray-600 text-sm">
                Descubre nuevas oportunidades de negocio sostenible
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="text-3xl mb-4">📋</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Reportes</h3>
              <p className="text-gray-600 text-sm">
                Genera reportes detallados para stakeholders y regulaciones
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-emerald-600">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            ¿Listo para mejorar tu puntuación?
          </h2>
          <p className="text-xl text-emerald-100 mb-8">
            Continúa con tu encuesta o analiza nuevos productos para obtener mejores resultados
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center px-8 py-4 bg-white text-emerald-600 rounded-lg font-semibold hover:bg-emerald-50 transition-colors"
            >
              📊 Ver Mi Dashboard
            </Link>
            <Link
              href="/survey"
              className="inline-flex items-center px-8 py-4 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-emerald-600 transition-colors"
            >
              📝 Continuar Encuesta
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
