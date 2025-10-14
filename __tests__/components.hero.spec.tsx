import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import Hero from "../components/Hero";

describe("Hero component", () => {
  it("renders title, subtitle and CTAs", () => {
    render(<Hero />);
    expect(
      screen.getByRole("heading", { name: /mide\. mejora\. comunica tu sostenibilidad\./i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/la certificación española que evalúa el impacto real de tu marca de moda\./i)
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /comenzar la evaluación/i })).toHaveAttribute(
      "href",
      "/register"
    );
    expect(screen.getByRole("link", { name: /iniciar sesión/i })).toHaveAttribute(
      "href",
      "/login"
    );
  });
});


