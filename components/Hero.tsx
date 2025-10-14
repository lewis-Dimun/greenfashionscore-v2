import Button from "./Button";

export default function Hero() {
  return (
    <section aria-label="Hero">
      <h1>Mide. Mejora. Comunica tu sostenibilidad.</h1>
      <p>La certificación española que evalúa el impacto real de tu marca de moda.</p>
      <div>
        <Button asLink={{ href: "/register" }}>Comenzar la evaluación</Button>
        <span style={{ marginLeft: 8 }} />
        <Button asLink={{ href: "/login" }}>Iniciar sesión</Button>
      </div>
    </section>
  );
}


