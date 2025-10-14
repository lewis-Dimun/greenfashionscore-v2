"use client";
import Badge from "../../components/Badge";
import AuthGuard from "../../components/AuthGuard";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function DashboardPage() {
  const data = { total: 0, grade: "E", perDimension: { people: 0, planet: 0, materials: 0, circularity: 0 } };
  const pieData = [
    { name: "People", value: data.perDimension.people },
    { name: "Planet", value: data.perDimension.planet },
    { name: "Circularity", value: data.perDimension.circularity },
    { name: "Materials", value: data.perDimension.materials }
  ];
  const colors = ["#6AA67F", "#AAD4AC", "#F2D857", "#D99B84"];
  return (
    <AuthGuard>
      <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Resultados</h1>
        
        <section aria-label="Resumen" className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center gap-8">
            <div>
              <p className="text-sm text-gray-600 mb-1">Puntuación total</p>
              <p className="text-4xl font-bold text-emerald-600">{data.total}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Calificación</p>
              <Badge grade={data.grade as any} />
            </div>
          </div>
        </section>
        
        <section aria-label="Por sello" className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Desglose por dimensión</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-4 text-center">Distribución</h3>
              <div style={{ width: "100%", height: 240 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90}>
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={colors[i % colors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-4 text-center">Comparativa</h3>
              <div style={{ width: "100%", height: 280 }}>
                <ResponsiveContainer>
                  <BarChart data={pieData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#00A676" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
    </AuthGuard>
  );
}


