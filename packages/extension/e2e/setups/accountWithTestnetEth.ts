import type { BrowserContext, Page } from "@playwright/test"

import { getAccountAddressFromAccountPage } from "../selectors/getAccountAddressFromAccountPage"
import { getBalanceFromAccountPage } from "../selectors/getBalanceFromAccountPage"
import { disableNetworkIssuesWarning } from "../steps/disableNetworkIssuesWarning"
import { newAccountWhenEmpty } from "../steps/newAccount"
import { newWalletOnboarding } from "../steps/newWallet"
import { openExtension } from "../steps/openExtension"
import { switchNetwork } from "../steps/switchNetwork"
import { formatTruncatedAddress } from "../utils"

export async function setupNewAccount(page: Page, context: BrowserContext) {
  await disableNetworkIssuesWarning(page)
  await openExtension(page, context)
  await newWalletOnboarding(page)

  // page is now closed
  await openExtension(page, context)
  await switchNetwork(page, "Localhost 5050")
  await newAccountWhenEmpty(page)
  const address = await getAccountAddressFromAccountPage(page)
  const balance = await getBalanceFromAccountPage(page, "Ethereum")

  console.log(
    `Created Account ${formatTruncatedAddress(address)} with Ξ${balance}`,
  )

  return { address, balance }
}
