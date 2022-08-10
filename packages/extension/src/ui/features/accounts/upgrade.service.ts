import { number } from "starknet"

import { Network } from "../../../shared/network"
import { isDeprecated } from "../../../shared/wallet.service"
import { Account } from "./Account"

export async function checkIfUpgradeAvailable(
  account: Account,
  targetClassHash?: Network["accountClassHash"],
): Promise<boolean> {
  if (!targetClassHash) {
    return false
  }

  const currentImplementation = await account.getCurrentImplementation()

  // Just show for not deprecated accounts, as targetImplementation will always be a contract class hash, which is not supported by the old proxy
  const oldAccount = isDeprecated(account)

  const targetImplementation =
    account.type === "argent-plugin"
      ? targetClassHash.argentPluginAccount
      : targetClassHash.argentAccount

  return (
    !oldAccount &&
    !!targetImplementation &&
    !number.toBN(currentImplementation).eq(number.toBN(targetImplementation))
  )
}
