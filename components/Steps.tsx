export default function Steps() {
  return (
    <section aria-label="Cómo funciona" className="container mx-auto px-4 py-16 bg-gray-50">
      <h2 className="text-3xl font-bold text-center mb-12">Cómo funciona</h2>
      <ol className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <li className="text-center">
          <div className="text-5xl font-bold text-emerald-600 mb-4">1</div>
          <p className="text-lg font-semibold">Responde la encuesta</p>
        </li>
        <li className="text-center">
          <div className="text-5xl font-bold text-emerald-600 mb-4">2</div>
          <p className="text-lg font-semibold">Obtén tu puntuación</p>
        </li>
        <li className="text-center">
          <div className="text-5xl font-bold text-emerald-600 mb-4">3</div>
          <p className="text-lg font-semibold">Accede al panel y mejora</p>
        </li>
      </ol>
      <div className="text-center">
        <a href="/register" className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-6 py-3 text-base font-semibold text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors">
          Diagnóstico
        </a>
      </div>
    </section>
  );
}


