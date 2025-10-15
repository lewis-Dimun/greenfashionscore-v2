import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SurveyWizardPage from "../app/survey/page";

// Mock fetch for API calls
const mockQuestionsResponse = {
  ok: true,
  json: async () => ({
    people: [
      {
        id: 1,
        text: "Test question",
        answers: [
          { id: 1, text: "Option 1", points: 1 },
          { id: 2, text: "Option 2", points: 2 }
        ]
      }
    ],
    planet: [
      {
        id: 2,
        text: "Test planet question",
        answers: [
          { id: 3, text: "Option A", points: 1 },
          { id: 4, text: "Option B", points: 2 }
        ]
      }
    ]
  })
};

describe("Survey wizard a11y", () => {
  beforeEach(() => {
    global.fetch = jest.fn(() => Promise.resolve(mockQuestionsResponse as any));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("permite navegación por teclado y foco visible en siguiente", async () => {
    const user = userEvent.setup();
    render(<SurveyWizardPage />);
    
    // Wait for questions to load
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /siguiente/i })).toBeInTheDocument();
    });
    
    const next = screen.getByRole("button", { name: /siguiente/i });
    expect(next).toBeInTheDocument();
    await user.keyboard("{Enter}");
    
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /planet/i })).toBeInTheDocument();
    });
  });
});


