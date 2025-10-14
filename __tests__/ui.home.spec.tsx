import "@testing-library/jest-dom";
import { render, screen, within } from "@testing-library/react";
import Home from "../app/page";

describe("Landing GFS - Home", () => {
  it("muestra hero con título, subtítulo y CTAs", () => {
    render(<Home />);
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
    const loginLinksHero = screen.getAllByRole("link", { name: /iniciar sesión/i });
    expect(loginLinksHero.some((a) => a.getAttribute("href") === "/login")).toBe(true);
  });

  it("¿Qué es el GFS? con 4 pilares", () => {
    render(<Home />);
    const section = screen.getByRole("region", { name: /¿qué es el green fashion score\?/i });
    expect(section).toBeInTheDocument();
    const cards = within(section).getAllByRole("article");
    expect(cards.length).toBe(4);
  });

  it("Cómo funciona con 3 pasos y CTA", () => {
    render(<Home />);
    const section = screen.getByRole("region", { name: /cómo funciona/i });
    const items = within(section).getAllByRole("listitem");
    expect(items.length).toBe(3);
    expect(within(section).getByRole("link", { name: /diagnóstico/i })).toHaveAttribute(
      "href",
      "/register"
    );
  });

  it("Beneficios: 4 tarjetas", () => {
    render(<Home />);
    const section = screen.getByRole("region", { name: /beneficios para tu marca/i });
    const cards = within(section).getAllByRole("article");
    expect(cards.length).toBe(4);
  });

  it("Respaldado por la ciencia con timeline 2024–2025", () => {
    render(<Home />);
    const section = screen.getByRole("region", { name: /respaldado por la ciencia/i });
    expect(within(section).getByText(/2024/i)).toBeInTheDocument();
    expect(within(section).getByText(/2025/i)).toBeInTheDocument();
  });

  it("Partners con claim de confianza", () => {
    render(<Home />);
    const section = screen.getByRole("region", { name: /aliados y confianza/i });
    expect(within(section).getByText(/más de 30 marcas/i)).toBeInTheDocument();
  });

  it("Área de usuario con Login y Ver resultados", () => {
    render(<Home />);
    const section = screen.getByRole("region", { name: /área de usuario/i });
    const loginLinks = within(section).getAllByRole("link", { name: /iniciar sesión/i });
    expect(loginLinks.some((a) => a.getAttribute("href") === "/login")).toBe(true);
    expect(within(section).getByRole("link", { name: /ver resultados/i })).toHaveAttribute(
      "href",
      "/survey"
    );
  });
});


