import Hero from "../components/Hero";
import Card from "../components/Card";
import Steps from "../components/Steps";
import Benefits from "../components/Benefits";
import Methodology from "../components/Methodology";
import Partners from "../components/Partners";
import Footer from "../components/Footer";
import AuthGuard from "../components/AuthGuard";

export default function Home() {
  return (
    <main>
      <Hero />

      <section aria-label="¿Qué es el Green Fashion Score?" className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              ¿Qué es el <span className="text-emerald-600">Green Fashion Score</span>?
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              Una metodología científica que evalúa la sostenibilidad de tu marca de moda 
              a través de 4 dimensiones clave, otorgando una calificación de A a E.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center group hover:scale-105 transition-transform">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-emerald-200 transition-colors">
                <span className="text-2xl">👥</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">People</h3>
              <p className="text-gray-600">Condiciones laborales, salarios justos y bienestar de los trabajadores</p>
            </Card>
            
            <Card className="text-center group hover:scale-105 transition-transform">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                <span className="text-2xl">🌍</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Planet</h3>
              <p className="text-gray-600">Impacto ambiental, emisiones de CO₂ y uso de recursos naturales</p>
            </Card>
            
            <Card className="text-center group hover:scale-105 transition-transform">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
                <span className="text-2xl">🧵</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Materials</h3>
              <p className="text-gray-600">Sostenibilidad de materiales, fibras orgánicas y químicos seguros</p>
            </Card>
            
            <Card className="text-center group hover:scale-105 transition-transform">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-200 transition-colors">
                <span className="text-2xl">♻️</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Circularity</h3>
              <p className="text-gray-600">Economía circular, reciclaje y diseño para la durabilidad</p>
            </Card>
          </div>
        </div>
      </section>

      <Steps />

      <Benefits />

      <Methodology />

      <Partners />

      <section aria-label="Área de usuario" className="container mx-auto px-4 py-16 text-center bg-gray-50">
        <div className="flex flex-wrap gap-4 justify-center">
          <a href="/login" className="text-emerald-600 hover:text-emerald-700 font-semibold underline">Iniciar sesión</a>
          <AuthGuard requireAuth={true}>
            <a href="/survey" className="text-emerald-600 hover:text-emerald-700 font-semibold underline">Realizar encuesta</a>
            <a href="/dashboard" className="text-emerald-600 hover:text-emerald-700 font-semibold underline">Ver resultados</a>
          </AuthGuard>
        </div>
      </section>

      <Footer />
    </main>
  );
}


