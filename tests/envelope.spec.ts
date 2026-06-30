import { test, expect, type Page } from "@playwright/test";

/** Navigate and wait for React to hydrate the prerendered HTML. */
async function gotoHydrated(page: Page, url: string): Promise<void> {
  await page.goto(url);
  await page.locator("html[data-hydrated]").waitFor();
}

test.describe("Envelope template", () => {
  test("renders typed addresses into the preview", async ({ page }) => {
    await gotoHydrated(page, "/template/envelope-10");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "#10 Envelope",
    );

    await page.getByLabel("Return address (from)").fill("Jane Doe\n1 A St");
    await page.getByLabel("Delivery address (to)").fill("IRS\nPO Box 1");

    // Scope to the on-screen preview (a second copy exists in the print portal).
    const preview = page.locator(".print-stage");
    await expect(preview.locator(".envelope__return")).toContainText(
      "Jane Doe",
    );
    await expect(preview.locator(".envelope__delivery")).toContainText("IRS");
  });

  test("persists the from address across reloads", async ({ page }) => {
    await gotoHydrated(page, "/template/envelope-10");
    await page.getByLabel("Return address (from)").fill("Persist Me\n2 B St");

    // Debounced save is 400ms.
    await page.waitForTimeout(600);
    await page.reload();
    await page.locator("html[data-hydrated]").waitFor();

    await expect(page.getByLabel("Return address (from)")).toHaveValue(
      "Persist Me\n2 B St",
    );
  });

  test("saves a delivery address to the recent address book", async ({
    page,
  }) => {
    await gotoHydrated(page, "/template/envelope-10");
    await page.getByLabel("Delivery address (to)").fill("Book Entry\n3 C St");
    await page.getByRole("button", { name: "Save to address book" }).click();

    await page.reload();
    await page.locator("html[data-hydrated]").waitFor();
    await expect(page.getByLabel("Recent addresses")).toBeVisible();
    await expect(
      page.getByRole("option", { name: "Book Entry" }),
    ).toBeAttached();
  });

  test("print view isolates a single paper-sized page", async ({ page }) => {
    await gotoHydrated(page, "/template/envelope-10");
    await page.getByLabel("Return address (from)").fill("Print Me\n9 Z St");

    await page.emulateMedia({ media: "print" });

    // App chrome is removed from layout; only the portaled paper prints.
    await expect(page.locator("main")).toBeHidden();
    const printPaper = page.locator(".print-portal .print-paper");
    await expect(printPaper).toBeVisible();
    await expect(printPaper.locator(".envelope__return")).toContainText(
      "Print Me",
    );
  });
});
