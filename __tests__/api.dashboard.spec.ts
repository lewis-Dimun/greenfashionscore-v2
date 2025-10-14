import { dashboardHandler, dashboardHandlerDeps } from "../supabase/functions/dashboard/handler";

describe("API - dashboard handler", () => {
  const deps = dashboardHandlerDeps({
    fetchAggregates: async () => ({
      total: 70,
      perDimension: { people: 14, planet: 18, materials: 30, circularity: 8 },
      grade: "B",
      etag: "W/\"dash-70\""
    })
  });

  it("responde 200 con ETag y payload", async () => {
    const req = new Request("http://localhost/functions/v1/dashboard?brandId=1", { headers: {} });
    const res = await dashboardHandler(deps)(req);
    expect(res.status).toBe(200);
    expect(res.headers.get("ETag")).toBe("W/\"dash-70\"");
    const body = await (res as any).json();
    expect(body).toHaveProperty("total", 70);
  });

  it("responde 304 si ETag coincide", async () => {
    const req = new Request("http://localhost/functions/v1/dashboard?brandId=1", {
      headers: { "if-none-match": "W/\"dash-70\"" }
    });
    const res = await dashboardHandler(deps)(req);
    expect(res.status).toBe(304);
  });
});


