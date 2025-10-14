import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import SurveyWizardPage from "../app/survey/page";

expect.extend(toHaveNoViolations);

describe("A11y - Survey wizard", () => {
  it("no critical accessibility violations", async () => {
    const { container } = render(<SurveyWizardPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("permite avanzar con teclado y mantiene foco en controles", async () => {
    const user = userEvent.setup();
    render(<SurveyWizardPage />);
    const next = screen.getByRole("button", { name: /siguiente/i });
    next.focus();
    expect(next).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("heading", { name: /planet/i })).toBeInTheDocument();
  });
});


