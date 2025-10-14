async function fetchDashboard(): Promise<{ total: number; grade: string; perDimension: Record<string, number> }> {
  // Placeholder client-side fetch to Edge GET (would include auth)
  const res = await fetch("/api/dashboard-mock", { cache: "no-store" });
  return res.json();
}

import Badge from "../../components/Badge";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default async function DashboardPage() {
  // In real app, fetch from Edge function; SSR/CSR depending on auth strategy
  const data = { total: 0, grade: "E", perDimension: { people: 0, planet: 0, materials: 0, circularity: 0 } };
  const pieData = [
    { name: "People", value: data.perDimension.people },
    { name: "Planet", value: data.perDimension.planet },
    { name: "Circularity", value: data.perDimension.circularity },
    { name: "Materials", value: data.perDimension.materials }
  ];
  const colors = ["#6AA67F", "#AAD4AC", "#F2D857", "#D99B84"];
  return (
    <main>
      <h1>Resultados</h1>
      <section aria-label="Resumen">
        <p>Total: {data.total}</p>
        <p>
          Letra: <Badge grade={data.grade as any} />
        </p>
      </section>
      <section aria-label="Por sello">
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
      </section>
    </main>
  );
}


