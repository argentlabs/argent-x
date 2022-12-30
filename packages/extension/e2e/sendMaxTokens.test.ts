import { expect } from "@playwright/test"

import { test } from "./fixture"
import { getAccountAddressFromAccountPage } from "./selectors/getAccountAddressFromAccountPage"
import { getBalanceFromAccountPage } from "./selectors/getBalanceFromAccountPage"
import { setupNewAccount } from "./setups/accountWithTestnetEth"
import { approveTransaction } from "./steps/approveTransaction"
import { navigateFromAccountToAccountList } from "./steps/navigateFromAccountToAccountList"
import { navigateFromAccountToTokenDetails } from "./steps/navigateFromAccountToTokenDetails"
import { newAccount } from "./steps/newAccount"
import { selectAccountFromAccountList } from "./steps/selectAccountFromAccountList"
import {
  HAS_PENDING_TRANSACTIONS_SELECTOR,
  waitForAllPendingTransactionsInAccount,
} from "./steps/waitForAllPendingTransactionsInAccount"
import { formatTruncatedAddress } from "./utils"

test("send max eth flow", async ({ page, context }) => {
  // disable page transitions so we don't need to wait for elements to settle
  await page.emulateMedia({ reducedMotion: "reduce" })

  const { address: a1, balance: b1 } = await setupNewAccount(page, context)

  await navigateFromAccountToAccountList(page)
  await newAccount(page)
  const a2 = await getAccountAddressFromAccountPage(page)
  const b2 = await getBalanceFromAccountPage(page, "Ethereum")
  expect(b2).toBe("1.0")
  await navigateFromAccountToAccountList(page)
  await selectAccountFromAccountList(page, a1)

  // await dismissUserReview(page)

  await navigateFromAccountToTokenDetails(page, "Ethereum")
  await page.click("button:has-text('Send')")
  await page.click("button:has-text('MAX')")
  await page.fill(`textarea[placeholder="Recipient's address"]`, a2)
  await page.click("button:has-text('Next'):not([disabled])")

  await approveTransaction(page)

  // await dismissUserReview(page)

  await page.waitForSelector(HAS_PENDING_TRANSACTIONS_SELECTOR)
  await waitForAllPendingTransactionsInAccount(page)

  const b1After = await getBalanceFromAccountPage(page, "Ethereum")
  await navigateFromAccountToAccountList(page)
  await selectAccountFromAccountList(page, a2)
  const b2After = await getBalanceFromAccountPage(page, "Ethereum")

  expect(b1After).not.toBe(b1)
  expect(b1After.substring(0, 4)).toBe("0.00")
  expect(b2After).not.toBe(b2)
  expect(b2After.substring(0, 3)).toBe("1.9")

  console.log(
    `Account ${formatTruncatedAddress(a1)} had Ξ${b1} and now has Ξ${b1After}`,
  )
  console.log(
    `Account ${formatTruncatedAddress(a2)} had Ξ${b2} and now has Ξ${b2After}`,
  )
})
