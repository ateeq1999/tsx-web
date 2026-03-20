import { test, expect } from "@playwright/test"

test.describe("Package publish flow", () => {
  test("publish page requires authentication", async ({ page }) => {
    await page.goto("/publish")
    // Unauthenticated users should be redirected to login
    await expect(page).toHaveURL(/login|auth/)
  })

  test("publish docs page is accessible", async ({ page }) => {
    await page.goto("/docs/publishing")
    // Either the page loads or redirects somewhere valid (not an error)
    await expect(page).not.toHaveURL(/error|500/)
  })

  test("package detail page renders install command", async ({ page }) => {
    // Use the browse page to find any package, then visit its detail page
    await page.goto("/browse")
    const firstPackageLink = page.getByRole("link").filter({ hasText: /[a-z]/ }).first()
    const href = await firstPackageLink.getAttribute("href")
    if (href && href.startsWith("/packages/")) {
      await page.goto(href)
      await expect(page.getByText(/tsx pkg install/)).toBeVisible()
    }
  })

  test("package detail page shows version history tab", async ({ page }) => {
    await page.goto("/browse")
    const firstPackageLink = page.locator("a[href^='/packages/']").first()
    const href = await firstPackageLink.getAttribute("href")
    if (href) {
      await page.goto(href)
      await expect(page.getByRole("tab", { name: /versions/i })).toBeVisible()
    }
  })

  test("package detail page shows download stats tab", async ({ page }) => {
    await page.goto("/browse")
    const firstPackageLink = page.locator("a[href^='/packages/']").first()
    const href = await firstPackageLink.getAttribute("href")
    if (href) {
      await page.goto(href)
      await expect(page.getByRole("tab", { name: /downloads/i })).toBeVisible()
    }
  })

  test("non-existent package shows not-found state", async ({ page }) => {
    await page.goto("/packages/this-package-does-not-exist-xyz-abc-999")
    await expect(page.getByText(/not found|404/i)).toBeVisible()
  })
})
