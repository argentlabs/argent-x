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

  // Just show for not deprecated accounts, as targetImplementation will always be a contract class hash, which is not supported by the old proxy
  const oldAccount = isDeprecated(account)

  return (
    !oldAccount &&
    !number.toBN(currentImplementation).eq(number.toBN(targetImplementation))
  )
}
