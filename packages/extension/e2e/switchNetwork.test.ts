import { expect } from "@playwright/test"

import { test } from "./fixture"
import { getAccountAddressFromAccountPage } from "./selectors/getAccountAddressFromAccountPage"
import { getBalanceFromAccountPage } from "./selectors/getBalanceFromAccountPage"
import { setupNewAccountWithTestnetEth } from "./setups/accountWithTestnetEth"
import { navigateFromAccountToAccountList } from "./steps/navigateFromAccountToAccountList"
import { newAccount } from "./steps/newAccount"
import { selectAccountFromAccountList } from "./steps/selectAccountFromAccountList"
import { switchNetwork } from "./steps/switchNetwork"
import { dismissUserReview } from "./steps/userReview"

test("switch network and keep account", async ({ page, context }) => {
  const { address: address1_localhost } = await setupNewAccountWithTestnetEth(
    page,
    context,
  )

  await navigateFromAccountToAccountList(page)
  await newAccount(page)
  const address2_localhost = await getAccountAddressFromAccountPage(page)
  const b2 = await getBalanceFromAccountPage(page, "Ethereum")
  expect(b2).toBe("0.0")
  await navigateFromAccountToAccountList(page)
  await selectAccountFromAccountList(page, address1_localhost)
  await dismissUserReview(page)

  await switchNetwork(page, "Testnet")
  const address1_goerli = await getAccountAddressFromAccountPage(page)

  await switchNetwork(page, "Localhost")
  expect(address1_localhost).toEqual(address1_goerli)

  await navigateFromAccountToAccountList(page)
  await selectAccountFromAccountList(page, address2_localhost)

  await switchNetwork(page, "Testnet")
  const currentGoerli = await getAccountAddressFromAccountPage(page)
  expect(currentGoerli).toEqual(address1_goerli)
})
