import Card from "./Card";

export default function Benefits() {
  return (
    <section aria-label="Beneficios para tu marca" className="bg-white py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            ¿Por qué elegir <span className="text-emerald-600">Green Fashion Score</span>?
          </h2>
          <p className="text-xl text-gray-600">
            Obtén ventajas competitivas y construye confianza con tus clientes
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="text-center group hover:scale-105 transition-all duration-300">
            <Card>
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-emerald-200 transition-colors">
              <span className="text-2xl">🏆</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Certificación oficial</h3>
            <p className="text-gray-600 leading-relaxed">
              Obtén una certificación reconocida que valida tu compromiso con la sostenibilidad
            </p>
            </Card>
          </div>
          
          <div className="text-center group hover:scale-105 transition-all duration-300">
            <Card>
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Análisis detallado</h3>
            <p className="text-gray-600 leading-relaxed">
              Recibe un informe completo con recomendaciones específicas para mejorar tu impacto
            </p>
            </Card>
          </div>
          
          <div className="text-center group hover:scale-105 transition-all duration-300">
            <Card>
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
              <span className="text-2xl">💚</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Confianza del cliente</h3>
            <p className="text-gray-600 leading-relaxed">
              Demuestra tu compromiso ambiental y atrae a consumidores conscientes
            </p>
            </Card>
          </div>
          
          <div className="text-center group hover:scale-105 transition-all duration-300">
            <Card>
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-200 transition-colors">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Resultados rápidos</h3>
            <p className="text-gray-600 leading-relaxed">
              Obtén tu puntuación en 15 minutos y accede a tu dashboard inmediatamente
            </p>
            </Card>
          </div>
          
          <div className="text-center group hover:scale-105 transition-all duration-300">
            <Card>
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-teal-200 transition-colors">
              <span className="text-2xl">🎯</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Mejora continua</h3>
            <p className="text-gray-600 leading-relaxed">
              Accede a tu panel personalizado para hacer seguimiento de tu progreso
            </p>
            </Card>
          </div>
          
          <div className="text-center group hover:scale-105 transition-all duration-300">
            <Card>
            <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-pink-200 transition-colors">
              <span className="text-2xl">📈</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Ventaja competitiva</h3>
            <p className="text-gray-600 leading-relaxed">
              Diferenciate de la competencia con una certificación de sostenibilidad
            </p>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}


