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

  // matches all current target implementations. If you want to change the account type please do it using a different flow than this banner
  const targetImplementations = Object.values(targetClassHash)

  const isInKnownImplementationsList = targetImplementations.some(
    (targetImplementation) =>
      number.toBN(currentImplementation).eq(number.toBN(targetImplementation)),
  )

  return !oldAccount && !!targetImplementations && !isInKnownImplementationsList
}
