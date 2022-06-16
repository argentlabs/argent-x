import { number } from "starknet"

import { hasNewDerivationPath } from "../../../shared/wallet.service"
import { Account } from "./Account"

export async function checkIfUpgradeAvailable(
  account: Account,
  targetImplementation?: string,
): Promise<boolean> {
  if (
    !targetImplementation ||
    !hasNewDerivationPath(account.signer.derivationPath) // old accounts are not upgradable anymore
  ) {
    return false
  }
  const currentImplementation = await account.getCurrentImplementation()
  return !number
    .toBN(currentImplementation)
    .eq(number.toBN(targetImplementation))
}
