import type { BrowserContext, Page } from "@playwright/test"

import { mintDevnetEthToAccount } from "../apis/sendDevnetEthToAccount"
import { getAccountAddressFromAccountPage } from "../selectors/getAccountAddressFromAccountPage"
import { getBalanceFromAccountPage } from "../selectors/getBalanceFromAccountPage"
import { disableNetworkIssuesWarning } from "../steps/disableNetworkIssuesWarning"
import { newAccount } from "../steps/newAccount"
import { newWalletOnboarding } from "../steps/newWallet"
import { openExtension } from "../steps/openExtension"
import { switchNetwork } from "../steps/switchNetwork"
import { formatTruncatedAddress } from "../utils"

export async function setupNewAccountWithTestnetEth(
  page: Page,
  context: BrowserContext,
) {
  await disableNetworkIssuesWarning(page)
  await openExtension(page, context)
  await newWalletOnboarding(page)

  // page is now closed
  await openExtension(page, context)
  await switchNetwork(page, "Localhost")
  await newAccount(page)
  const address = await getAccountAddressFromAccountPage(page)
  await mintDevnetEthToAccount(address)
  const balance = await getBalanceFromAccountPage(page, "Ethereum")

  console.log(
    `Created Account ${formatTruncatedAddress(address)} with Ξ${balance}`,
  )

  return { address, balance }
}
