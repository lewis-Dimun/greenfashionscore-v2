import "@testing-library/jest-dom";
import { render, screen, within } from "@testing-library/react";
import Steps from "../components/Steps";

describe("Steps component", () => {
  it("renders three steps and CTA", () => {
    render(<Steps />);
    const section = screen.getByRole("region", { name: /cómo funciona/i });
    const items = within(section).getAllByRole("listitem");
    expect(items.length).toBe(3);
    expect(within(section).getByRole("link", { name: /diagnóstico/i })).toHaveAttribute(
      "href",
      "/register"
    );
  });
});


