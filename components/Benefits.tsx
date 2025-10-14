import Card from "./Card";

export default function Benefits() {
  return (
    <section aria-label="Beneficios para tu marca" className="container mx-auto px-4 py-16">
      <h2 className="text-3xl font-bold text-center mb-12">Beneficios para tu marca</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>Beneficio 1</Card>
        <Card>Beneficio 2</Card>
        <Card>Beneficio 3</Card>
        <Card>Beneficio 4</Card>
      </div>
    </section>
  );
}


