import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import DashboardPage from "../app/dashboard/page";

describe("Dashboard UI", () => {
  it("renders results heading and chart containers", async () => {
    const ui = await DashboardPage();
    render(ui as any);
    expect(screen.getByRole("heading", { name: /resultados/i })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: /por sello/i })).toBeInTheDocument();
  });
});


