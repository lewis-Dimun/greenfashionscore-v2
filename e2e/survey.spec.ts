import { test, expect } from "@playwright/test";

test.describe("Survey wizard flow (smoke)", () => {
  test("survey page redirects to login when not authenticated", async ({ page }) => {
    await page.goto("/survey");
    await page.waitForLoadState('networkidle');
    
    // Check that the page redirects to login
    await expect(page).toHaveURL(/login/);
  });
});


