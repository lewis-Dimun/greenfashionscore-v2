import Hero from "../components/Hero";
import Card from "../components/Card";
import Steps from "../components/Steps";
import Benefits from "../components/Benefits";
import Methodology from "../components/Methodology";
import Partners from "../components/Partners";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <main>
      <Hero />

      <section aria-label="¿Qué es el Green Fashion Score?" className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-8">¿Qué es el Green Fashion Score?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>People</Card>
          <Card>Planet</Card>
          <Card>Materials</Card>
          <Card>Circularity</Card>
        </div>
      </section>

      <Steps />

      <Benefits />

      <Methodology />

      <Partners />

      <section aria-label="Área de usuario" className="container mx-auto px-4 py-16 text-center bg-gray-50">
        <div className="flex flex-wrap gap-4 justify-center">
          <a href="/login" className="text-emerald-600 hover:text-emerald-700 font-semibold underline">Iniciar sesión</a>
          <a href="/survey" className="text-emerald-600 hover:text-emerald-700 font-semibold underline">Ver resultados</a>
        </div>
      </section>

      <Footer />
    </main>
  );
}


