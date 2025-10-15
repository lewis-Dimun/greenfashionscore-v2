import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import DashboardPage from "../app/dashboard/page";

describe("Dashboard UI", () => {
  it("renders results heading and score containers", async () => {
    render(<DashboardPage />);
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /resultados green fashion score/i })).toBeInTheDocument();
    });
    expect(screen.getByText(/puntuación total/i)).toBeInTheDocument();
    expect(screen.getByText(/ver mis resultados/i)).toBeInTheDocument();
  });
});


