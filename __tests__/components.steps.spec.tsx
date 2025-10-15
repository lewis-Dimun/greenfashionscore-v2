import "@testing-library/jest-dom";
import { render, screen, within } from "@testing-library/react";
import Steps from "../components/Steps";

describe("Steps component", () => {
  it("renders three steps and CTA", () => {
    render(<Steps />);
    const section = screen.getByRole("region", { name: /cómo funciona/i });
    // Steps are rendered as divs, not listitems
    const stepHeadings = within(section).getAllByRole("heading", { level: 3 });
    expect(stepHeadings.length).toBe(3);
    
    // Check for CTA link in the section
    const evaluationLinks = within(section).getAllByRole("link", { name: /comenzar evaluación gratuita/i });
    expect(evaluationLinks[0]).toHaveAttribute("href", "/register");
  });
});


