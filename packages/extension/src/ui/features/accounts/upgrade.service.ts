import { number } from "starknet"

import { isDeprecated } from "../../../shared/wallet.service"
import { Account } from "./Account"

export async function checkIfUpgradeAvailable(
  account: Account,
  targetImplementation?: string,
): Promise<boolean> {
  if (!targetImplementation) {
    return false
  }

  const currentImplementation = await account.getCurrentImplementation()

  const oldAccount = isDeprecated(account)

  return (
    !oldAccount &&
    !number.toBN(currentImplementation).eq(number.toBN(targetImplementation))
  )
}
