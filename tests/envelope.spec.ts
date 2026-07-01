import { test, expect, type Locator, type Page } from "@playwright/test";

/** Navigate and wait for React to hydrate the prerendered HTML. */
async function gotoHydrated(page: Page, url: string): Promise<void> {
  await page.goto(url);
  await page.locator("html[data-hydrated]").waitFor();
}

/** The field container that holds the input with the given label. */
function fieldFor(page: Page, label: string): Locator {
  return page.locator(".field", { has: page.getByLabel(label) });
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

  test("saves a from address (with nickname) and prefills it next time", async ({
    page,
  }) => {
    await gotoHydrated(page, "/template/envelope-10");
    const from = fieldFor(page, "Return address (from)");
    await page.getByLabel("Return address (from)").fill("Home Base\n1 Home St");
    await from.getByLabel("Nickname").fill("Home");
    await from.getByRole("button", { name: "Save" }).click();

    await page.reload();
    await page.locator("html[data-hydrated]").waitFor();

    // Prefilled with the latest saved send address...
    await expect(page.getByLabel("Return address (from)")).toHaveValue(
      "Home Base\n1 Home St",
    );
    // ...and available in the saved-addresses picker under its nickname.
    await expect(
      fieldFor(page, "Return address (from)").getByRole("option", {
        name: /Home/,
      }),
    ).toBeAttached();
  });

  test("saves a to address to its book", async ({ page }) => {
    await gotoHydrated(page, "/template/envelope-10");
    const to = fieldFor(page, "Delivery address (to)");
    await page.getByLabel("Delivery address (to)").fill("Client\n9 Client Rd");
    await to.getByRole("button", { name: "Save" }).click();

    await page.reload();
    await page.locator("html[data-hydrated]").waitFor();
    await expect(
      fieldFor(page, "Delivery address (to)").getByRole("option", {
        name: /Client/,
      }),
    ).toBeAttached();
  });

  test("batch mode prints one page per address", async ({ page }) => {
    await gotoHydrated(page, "/template/envelope-10");
    await page.getByRole("tab", { name: "Batch" }).click();
    await page
      .getByLabel(/one address per blank line/)
      .fill("Alice\n1 A St\n\nBob\n2 B St");

    await expect(page.getByText("2 envelopes will print.")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Print 2 envelopes" }),
    ).toBeVisible();
    await expect(page.locator(".print-portal .print-paper")).toHaveCount(2);
  });

  test("print view isolates the pages", async ({ page }) => {
    await gotoHydrated(page, "/template/envelope-10");
    await page.getByLabel("Return address (from)").fill("Print Me\n9 Z St");

    await page.emulateMedia({ media: "print" });

    await expect(page.locator("main")).toBeHidden();
    const printPaper = page.locator(".print-portal .print-paper");
    await expect(printPaper).toHaveCount(1);
    await expect(printPaper.locator(".envelope__return")).toContainText(
      "Print Me",
    );
  });
});
