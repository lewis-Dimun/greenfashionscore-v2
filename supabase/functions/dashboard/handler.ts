import { jsonResponse } from "../_shared/utils";
export type DashboardDeps = ReturnType<typeof dashboardHandlerDeps>;

export function dashboardHandlerDeps(factory: {
  fetchAggregates: (args: { brandId?: string; userId?: string }) => Promise<{
    total: number;
    perDimension: Record<string, number>;
    grade: string;
    etag: string;
  }>;
}) {
  return factory;
}

export function dashboardHandler(deps: DashboardDeps) {
  return async function handler(req: Request) {
    const url = new URL((req as any).url || "http://localhost");
    let brandId = url.searchParams.get("brandId") || undefined;
    if (!brandId && (req as any).json) {
      try {
        const body = await (req as any).json();
        if (body && typeof body.brandId === "string") brandId = body.brandId;
      } catch {}
    }
    const userId = undefined; // will be resolved from auth in real function
    const data = await deps.fetchAggregates({ brandId, userId });

    const ifNoneMatch = (req.headers as any)?.get?.("if-none-match");
    if (ifNoneMatch && ifNoneMatch === data.etag) {
      return new Response(null, { status: 304, headers: { ETag: data.etag } });
    }
    return jsonResponse({ total: data.total, perDimension: data.perDimension, grade: data.grade }, {
      status: 200,
      headers: { ETag: data.etag }
    });
  };
}


