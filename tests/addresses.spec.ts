import { test, expect, type Page } from "@playwright/test";

async function gotoHydrated(page: Page, url: string): Promise<void> {
  await page.goto(url);
  await page.locator("html[data-hydrated]").waitFor();
}

test.describe("Address book manager", () => {
  test("lists a saved address, renames, and deletes it", async ({ page }) => {
    // Seed a to-address via the envelope page.
    await gotoHydrated(page, "/template/envelope-10");
    const to = page.locator(".field", {
      has: page.getByLabel("Delivery address (to)"),
    });
    await page.getByLabel("Delivery address (to)").fill("Manager Test\n5 M St");
    await to.getByRole("button", { name: "Save" }).click();

    await gotoHydrated(page, "/addresses");
    const item = page.locator(".book__item", { hasText: "Manager Test" });
    await expect(item).toBeVisible();

    // Rename (commits on blur).
    await item.getByLabel("Nickname").fill("Mgr");
    await item.getByLabel("Nickname").blur();

    // Delete.
    await item.getByRole("button", { name: "Delete" }).click();
    await expect(page.getByText("Manager Test")).toHaveCount(0);
  });

  test("imports addresses from a JSON file", async ({ page }) => {
    await gotoHydrated(page, "/addresses");
    const data = {
      app: "print-template",
      version: 1,
      from: [{ id: "x", text: "Imported From\n1 I St", usedAt: 1 }],
      to: [],
    };
    await page.locator('input[type="file"]').setInputFiles({
      name: "addresses.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(data)),
    });

    await expect(page.getByText("Imported From")).toBeVisible();
    await expect(page.getByText(/Imported 1 new address/)).toBeVisible();
  });
});
