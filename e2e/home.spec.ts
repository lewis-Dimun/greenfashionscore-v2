import { test, expect } from "@playwright/test";

test.describe("Landing smoke", () => {
  test("CTA navegar a /register", async ({ page }) => {
    await page.goto("/");
    const link = page.getByRole("link", { name: /comenzar la evaluación/i });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", "/register");
  });
});


