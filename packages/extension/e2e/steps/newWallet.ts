import { expect } from "@playwright/test"
import type { Page } from "@playwright/test"

export async function newWalletOnboarding(page: Page) {
  await page.click("text=Create a new wallet")
  await page.click("input[name='lossOfFunds']")
  await page.click("input[name='alphaVersion']")
  await page.click("text=Continue")
  await page.fill("input[name='password']", "test12")
  await page.fill("input[name='repeatPassword']", "test12")
  await page.click("text=Create wallet")
  await page.waitForSelector("text=Finish", {
    timeout: 60 * 60e3,
  })
}

export async function continueNewWalletAfterOnboarding(page: Page) {
  // eventually the degraded network performance banner shows up
  const deployingText = page.waitForSelector("text=Deploying...", {
    timeout: 60 * 60e3,
  })
  const degradedNetworkPerformanceText = page.waitForSelector(
    "text=Network issues",
    { timeout: 45 * 60e3 },
  )

  const whichWasFirst = await Promise.race([
    deployingText
      .then(() => "deploying" as const)
      .catch(() => "timeout" as const),
    degradedNetworkPerformanceText
      .then(() => "degraded" as const)
      .catch(() => "timeout" as const),
  ])

  if (whichWasFirst === "degraded") {
    await page.click("I understand")
  }

  expect((await deployingText).isVisible()).resolves.toBe(true)
}
