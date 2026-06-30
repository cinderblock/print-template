import { test, expect } from "@playwright/test";

test.describe("Home Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("has correct title", async ({ page }) => {
    await expect(page).toHaveTitle("Print Template");
  });

  test("displays heading", async ({ page }) => {
    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toHaveText("Print Template");
  });

  test("has proper meta description", async ({ page }) => {
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute(
      "content",
      "Print onto envelopes, labels, and more — straight from your browser.",
    );
  });

  test("lists the envelope template and links to it", async ({ page }) => {
    const card = page.getByRole("link", { name: /#10 Envelope/ });
    await expect(card).toHaveAttribute("href", "/template/envelope-10");
  });
});

test.describe("404 Page", () => {
  test("displays not found message", async ({ page }) => {
    await page.goto("/nonexistent-page");
    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toHaveText("404");
  });
});
