import "@testing-library/jest-dom";
import { render, screen, within, waitFor } from "@testing-library/react";
import Home from "../app/page";

describe("Landing GFS - Home", () => {
  it("muestra hero con título, subtítulo y CTAs", async () => {
    render(<Home />);
    
    // Use findByRole for better async handling
    const heading = await screen.findByRole("heading", { name: /mide\. mejora\. comunica tu sostenibilidad\./i });
    expect(heading).toBeInTheDocument();
    
    expect(
      screen.getByText(/la certificación española que evalúa el impacto real de tu marca de moda\./i)
    ).toBeInTheDocument();
    
    // Handle multiple CTA links with same text
    const evaluationLinks = screen.getAllByRole("link", { name: /comenzar evaluación gratuita/i });
    expect(evaluationLinks[0]).toHaveAttribute("href", "/register");
    
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
    // Steps are rendered as divs, not listitems
    const stepHeadings = within(section).getAllByRole("heading", { level: 3 });
    expect(stepHeadings.length).toBe(3);
    
    // Check for CTA link in the section
    const evaluationLinks = within(section).getAllByRole("link", { name: /comenzar evaluación gratuita/i });
    expect(evaluationLinks[0]).toHaveAttribute("href", "/register");
  });

  it("Beneficios: 6 tarjetas", () => {
    render(<Home />);
    const section = screen.getByRole("region", { name: /beneficios para tu marca/i });
    const cards = within(section).getAllByRole("article");
    expect(cards.length).toBe(6);
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

  it("Hero section con CTA de evaluación y login", async () => {
    render(<Home />);
    
    // Use findByRole for better async handling
    const evaluationButtons = await screen.findAllByRole("link", { name: /comenzar evaluación gratuita/i });
    expect(evaluationButtons[0]).toHaveAttribute("href", "/register");
    
    // Verificar que existe el botón de iniciar sesión
    const loginButton = await screen.findByRole("link", { name: /iniciar sesión/i });
    expect(loginButton).toHaveAttribute("href", "/login");
  });
});


