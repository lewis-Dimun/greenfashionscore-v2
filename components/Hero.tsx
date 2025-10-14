import Button from "./Button";

export default function Hero() {
  return (
    <section aria-label="Hero" className="relative bg-gradient-to-br from-emerald-50 via-white to-teal-50 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%2310b981" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
      
      <div className="relative container mx-auto px-4 py-20 lg:py-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-emerald-100 text-emerald-800 text-sm font-medium mb-8">
            <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
            Certificación oficial española
          </div>
          
          {/* Main heading */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Mide. Mejora. 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
              Comunica
            </span>
            <br />
            tu sostenibilidad.
          </h1>
          
          {/* Subheading */}
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            La certificación española que evalúa el impacto real de tu marca de moda. 
            <span className="font-semibold text-gray-800"> Obtén tu puntuación A-E</span> y mejora tu impacto ambiental.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button asLink={{ href: "/register" }} className="text-lg px-8 py-4">
              🚀 Comenzar evaluación gratuita
            </Button>
            <Button asLink={{ href: "/login" }} className="text-lg px-8 py-4 bg-white text-emerald-600 border-2 border-emerald-600 hover:bg-emerald-50">
              Iniciar sesión
            </Button>
          </div>
          
          {/* Trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center">
              <span className="text-emerald-600 mr-2">✓</span>
              Gratuito
            </div>
            <div className="flex items-center">
              <span className="text-emerald-600 mr-2">✓</span>
              15 minutos
            </div>
            <div className="flex items-center">
              <span className="text-emerald-600 mr-2">✓</span>
              Resultados inmediatos
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


