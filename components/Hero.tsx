import Button from "./Button";

export default function Hero() {
  return (
    <section aria-label="Hero" className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
        Mide. Mejora. Comunica tu sostenibilidad.
      </h1>
      <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
        La certificación española que evalúa el impacto real de tu marca de moda.
      </p>
      <div className="flex flex-wrap gap-4 justify-center">
        <Button asLink={{ href: "/register" }}>Comenzar la evaluación</Button>
        <Button asLink={{ href: "/login" }}>Iniciar sesión</Button>
      </div>
    </section>
  );
}


