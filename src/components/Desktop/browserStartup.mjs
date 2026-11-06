export async function finishStartup(page) {
  await page.locator('.os-desktop.os-ready').waitFor()
  await page.locator('.os-desktop[data-startup="complete"]').waitFor()
}
