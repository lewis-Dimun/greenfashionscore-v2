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

      <section aria-label="¿Qué es el Green Fashion Score?">
        <Card>People</Card>
        <Card>Planet</Card>
        <Card>Materials</Card>
        <Card>Circularity</Card>
      </section>

      <Steps />

      <Benefits />

      <Methodology />

      <Partners />

      <section aria-label="Área de usuario">
        <a href="/login">Iniciar sesión</a>
        <a href="/survey">Ver resultados</a>
      </section>

      <Footer />
    </main>
  );
}


