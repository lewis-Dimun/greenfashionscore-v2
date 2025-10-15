import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import DashboardPage from "../app/dashboard/page";

// Mock fetch for dashboard data
const mockDashboardData = {
  people: { score: 75, maxScore: 100 },
  planet: { score: 60, maxScore: 100 },
  materials: { score: 80, maxScore: 100 },
  circularity: { score: 70, maxScore: 100 },
  total: 72.5,
  grade: 'B',
  hasGeneralSurvey: true
};

describe("Dashboard UI", () => {
  beforeEach(() => {
    // Mock fetch to return dashboard data
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => mockDashboardData,
      } as any)
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders results heading and score containers", async () => {
    render(<DashboardPage />);
    
    // Wait for the heading to appear
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /resultados green fashion score/i })).toBeInTheDocument();
    });
    
    expect(screen.getByText(/puntuación total/i)).toBeInTheDocument();
    expect(screen.getByText(/ver mis resultados/i)).toBeInTheDocument();
  });
});


