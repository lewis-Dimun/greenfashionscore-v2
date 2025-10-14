export default function Steps() {
  return (
    <section aria-label="Cómo funciona" className="bg-gradient-to-br from-gray-50 to-emerald-50 py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Cómo funciona
            </h2>
            <p className="text-xl text-gray-600">
              En solo 3 pasos obtén tu certificación de sostenibilidad
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="text-center group">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-emerald-600 rounded-full flex items-center justify-center mx-auto text-white text-2xl font-bold group-hover:scale-110 transition-transform">
                  1
                </div>
                <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-emerald-600 to-emerald-300 transform translate-x-4"></div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Responde la encuesta</h3>
              <p className="text-gray-600 leading-relaxed">
                Completa nuestro cuestionario científico de 15 minutos sobre las 4 dimensiones de sostenibilidad
              </p>
            </div>
            
            <div className="text-center group">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-emerald-600 rounded-full flex items-center justify-center mx-auto text-white text-2xl font-bold group-hover:scale-110 transition-transform">
                  2
                </div>
                <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-emerald-600 to-emerald-300 transform translate-x-4"></div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Obtén tu puntuación</h3>
              <p className="text-gray-600 leading-relaxed">
                Recibe tu calificación A-E y un informe detallado con recomendaciones personalizadas
              </p>
            </div>
            
            <div className="text-center group">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-emerald-600 rounded-full flex items-center justify-center mx-auto text-white text-2xl font-bold group-hover:scale-110 transition-transform">
                  3
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Mejora y comunica</h3>
              <p className="text-gray-600 leading-relaxed">
                Accede a tu dashboard personalizado y comparte tu certificación con tus clientes
              </p>
            </div>
          </div>
          
          <div className="text-center">
            <a 
              href="/register" 
              className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-8 py-4 text-lg font-semibold text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              🚀 Comenzar evaluación gratuita
            </a>
            <p className="text-sm text-gray-500 mt-4">
              Sin compromiso • Resultados inmediatos • Certificación oficial
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}


