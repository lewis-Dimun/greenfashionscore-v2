import "@testing-library/jest-dom";
import { render, screen, within } from "@testing-library/react";
import Benefits from "../components/Benefits";

describe("Benefits component", () => {
  it("renders six benefit cards", () => {
    render(<Benefits />);
    const section = screen.getByRole("region", { name: /beneficios para tu marca/i });
    const cards = within(section).getAllByRole("article");
    expect(cards.length).toBe(6);
  });
});


