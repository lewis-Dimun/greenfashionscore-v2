import "@testing-library/jest-dom";
import { render, screen, within } from "@testing-library/react";
import Footer from "../components/Footer";

describe("Footer component", () => {
  it("renders contact and legal links", () => {
    render(<Footer />);
    const footer = screen.getByRole("contentinfo", { hidden: true });
    const nav = within(footer).getByRole("navigation", { name: /contacto y legales/i });
    expect(within(nav).getByRole("link", { name: /contacto/i })).toBeInTheDocument();
    expect(within(nav).getByRole("link", { name: /legales/i })).toBeInTheDocument();
  });
});


