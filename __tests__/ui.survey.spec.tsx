import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SurveyWizardPage from "../app/survey/page";

describe("Survey wizard a11y", () => {
  it("permite navegación por teclado y foco visible en siguiente", async () => {
    const user = userEvent.setup();
    render(<SurveyWizardPage />);
    const next = screen.getByRole("button", { name: /siguiente/i });
    expect(next).toBeInTheDocument();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("heading", { name: /planet/i })).toBeInTheDocument();
  });
});


